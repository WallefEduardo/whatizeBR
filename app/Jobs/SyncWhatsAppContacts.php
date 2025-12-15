<?php

namespace App\Jobs;

use App\Models\Contact;
use App\Models\WhatsAppInstance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncWhatsAppContacts implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300; // 5 minutes

    /**
     * Create a new job instance.
     */
    public function __construct(
        public WhatsAppInstance $instance
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Check if instance is connected
        if (!in_array($this->instance->status, ['connected', 'authenticated'])) {
            Log::warning("Cannot sync contacts for disconnected instance: {$this->instance->id}");
            return;
        }

        try {
            // Fetch contacts from Evolution API
            $response = Http::withHeaders([
                'apikey' => config('whatsapp.evolution_api_key'),
            ])->get(config('whatsapp.evolution_api_url') . "/chat/findContacts/{$this->instance->token}");

            if (!$response->successful()) {
                Log::error("Failed to fetch contacts from Evolution API", [
                    'instance_id' => $this->instance->id,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return;
            }

            $contacts = $response->json();

            if (empty($contacts)) {
                Log::info("No contacts found for instance: {$this->instance->id}");
                return;
            }

            $synced = 0;
            $updated = 0;

            foreach ($contacts as $contactData) {
                // Skip group chats and broadcast lists
                if (isset($contactData['isGroup']) && $contactData['isGroup']) {
                    continue;
                }

                $phone = $this->normalizePhone($contactData['id'] ?? $contactData['phone'] ?? null);

                if (!$phone) {
                    continue;
                }

                $data = [
                    'instance_id' => $this->instance->id,
                    'phone' => $phone,
                    'name' => $contactData['name'] ?? $contactData['pushname'] ?? null,
                    'avatar_url' => $contactData['profilePicUrl'] ?? null,
                ];

                // Update or create contact
                $contact = Contact::updateOrCreate(
                    [
                        'instance_id' => $this->instance->id,
                        'phone' => $phone,
                    ],
                    $data
                );

                if ($contact->wasRecentlyCreated) {
                    $synced++;
                } else {
                    $updated++;
                }
            }

            Log::info("Contacts synced successfully", [
                'instance_id' => $this->instance->id,
                'synced' => $synced,
                'updated' => $updated,
                'total' => $synced + $updated,
            ]);
        } catch (\Exception $e) {
            Log::error("Error syncing contacts", [
                'instance_id' => $this->instance->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Normalize phone number by removing non-numeric characters
     */
    protected function normalizePhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Remove @c.us or @s.whatsapp.net suffix
        $phone = preg_replace('/@.*$/', '', $phone);

        // Keep only digits
        $phone = preg_replace('/\D/', '', $phone);

        return $phone ?: null;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("SyncWhatsAppContacts job failed", [
            'instance_id' => $this->instance->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
