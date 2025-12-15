<?php

namespace App\Jobs;

use App\Models\Broadcast;
use App\Models\BroadcastMessage;
use App\Services\BroadcastService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessBroadcast implements ShouldQueue
{
    use Queueable;

    protected Broadcast $broadcast;

    /**
     * Create a new job instance.
     */
    public function __construct(Broadcast $broadcast)
    {
        $this->broadcast = $broadcast;
    }

    /**
     * Execute the job.
     */
    public function handle(BroadcastService $broadcastService): void
    {
        try {
            Log::info("Processing broadcast: {$this->broadcast->id}");

            // Get filtered contacts
            $contacts = $broadcastService->getFilteredContacts(
                $this->broadcast->instance_id,
                $this->broadcast->filters
            );

            if ($contacts->isEmpty()) {
                $this->broadcast->markAsFailed();
                Log::warning("No contacts found for broadcast: {$this->broadcast->id}");
                return;
            }

            // Create broadcast messages for each contact
            foreach ($contacts as $contact) {
                BroadcastMessage::create([
                    'broadcast_id' => $this->broadcast->id,
                    'contact_id' => $contact->id,
                    'status' => 'pending',
                ]);
            }

            // Dispatch individual message jobs with rate limiting
            // WhatsApp rate limit: 1 message per 6 seconds per contact
            $delay = 0;
            $delayIncrement = 6; // seconds

            foreach ($contacts as $contact) {
                SendBroadcastMessage::dispatch($this->broadcast, $contact)
                    ->delay(now()->addSeconds($delay));

                $delay += $delayIncrement;
            }

            Log::info("Dispatched {$contacts->count()} messages for broadcast: {$this->broadcast->id}");
        } catch (\Exception $e) {
            Log::error("Error processing broadcast {$this->broadcast->id}: {$e->getMessage()}");
            $this->broadcast->markAsFailed();
            throw $e;
        }
    }
}
