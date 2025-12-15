<?php

namespace App\Jobs;

use App\Models\Broadcast;
use App\Models\BroadcastMessage;
use App\Models\Contact;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class SendBroadcastMessage implements ShouldQueue
{
    use Queueable;

    protected Broadcast $broadcast;
    protected Contact $contact;

    public $tries = 3;
    public $backoff = [10, 30, 60]; // seconds

    /**
     * Create a new job instance.
     */
    public function __construct(Broadcast $broadcast, Contact $contact)
    {
        $this->broadcast = $broadcast;
        $this->contact = $contact;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Find or create broadcast message record
            $broadcastMessage = BroadcastMessage::firstOrCreate([
                'broadcast_id' => $this->broadcast->id,
                'contact_id' => $this->contact->id,
            ], [
                'status' => 'pending',
            ]);

            // Skip if already sent
            if ($broadcastMessage->isSent() || $broadcastMessage->isDelivered() || $broadcastMessage->isRead()) {
                Log::info("Message already sent to contact {$this->contact->id} for broadcast {$this->broadcast->id}");
                return;
            }

            // Check if broadcast was cancelled
            if ($this->broadcast->isCancelled()) {
                Log::info("Broadcast {$this->broadcast->id} was cancelled, skipping message");
                return;
            }

            // Send message via WhatsApp API
            $messageId = $this->sendWhatsAppMessage();

            // Mark as sent
            $broadcastMessage->markAsSent($messageId);

            // Increment broadcast sent count
            $this->broadcast->incrementSent();

            // Check if broadcast is completed
            $this->checkBroadcastCompletion();

            Log::info("Message sent to contact {$this->contact->id} for broadcast {$this->broadcast->id}");
        } catch (\Exception $e) {
            Log::error("Error sending broadcast message to contact {$this->contact->id}: {$e->getMessage()}");

            // Mark message as failed
            $broadcastMessage = BroadcastMessage::where('broadcast_id', $this->broadcast->id)
                ->where('contact_id', $this->contact->id)
                ->first();

            if ($broadcastMessage) {
                $broadcastMessage->markAsFailed($e->getMessage());
                $this->broadcast->incrementFailed();
            }

            // Check if broadcast is completed
            $this->checkBroadcastCompletion();

            throw $e;
        }
    }

    /**
     * Send message via WhatsApp API
     */
    protected function sendWhatsAppMessage(): string
    {
        // TODO: Implement actual WhatsApp API integration
        // For now, returning a mock message ID

        $instance = $this->broadcast->instance;

        // Mock API call
        // $response = Http::post("{$instance->webhook_url}/send-message", [
        //     'phone' => $this->contact->phone,
        //     'message_type' => $this->broadcast->message_type,
        //     'message_content' => $this->broadcast->message_content,
        //     'media_url' => $this->broadcast->media_url,
        // ]);

        // if (!$response->successful()) {
        //     throw new \Exception("WhatsApp API error: {$response->body()}");
        // }

        // return $response->json('message_id');

        // Mock message ID for testing
        return 'msg_' . uniqid();
    }

    /**
     * Check if all messages have been processed
     */
    protected function checkBroadcastCompletion(): void
    {
        $totalProcessed = $this->broadcast->sent_count + $this->broadcast->failed_count;

        if ($totalProcessed >= $this->broadcast->total_recipients) {
            $this->broadcast->markAsCompleted();
            Log::info("Broadcast {$this->broadcast->id} completed");
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Job failed for broadcast {$this->broadcast->id}, contact {$this->contact->id}: {$exception->getMessage()}");

        $broadcastMessage = BroadcastMessage::where('broadcast_id', $this->broadcast->id)
            ->where('contact_id', $this->contact->id)
            ->first();

        if ($broadcastMessage) {
            $broadcastMessage->markAsFailed($exception->getMessage());
            $this->broadcast->incrementFailed();
        }

        // Check if broadcast is completed
        $this->checkBroadcastCompletion();
    }
}
