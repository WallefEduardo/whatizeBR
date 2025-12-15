<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MarkMessageAsRead implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Message $message
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $instance = $this->message->instance;

            // Check if instance is connected
            if (!in_array($instance->status, ['connected', 'authenticated'])) {
                Log::warning("Cannot mark message as read: instance not connected", [
                    'message_id' => $this->message->id,
                    'instance_id' => $instance->id,
                ]);
                return;
            }

            // Only mark inbound messages as read
            if ($this->message->direction !== 'inbound') {
                Log::warning("Cannot mark outbound message as read", [
                    'message_id' => $this->message->id,
                ]);
                return;
            }

            // Check if message already marked as read
            if ($this->message->status === 'read') {
                return;
            }

            // Prepare request payload
            $payload = [
                'readMessages' => [
                    [
                        'remoteJid' => $this->message->from_phone . '@s.whatsapp.net',
                        'id' => $this->message->message_id,
                        'fromMe' => false,
                    ],
                ],
            ];

            // Send request to Evolution API
            $response = Http::withHeaders([
                'apikey' => config('whatsapp.evolution_api_key'),
            ])->post(
                config('whatsapp.evolution_api_url') . "/chat/markMessageAsRead/{$instance->token}",
                $payload
            );

            if (!$response->successful()) {
                Log::error("Failed to mark message as read via API", [
                    'message_id' => $this->message->id,
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                // Still mark as read locally even if API fails
                $this->message->markAsRead();
                return;
            }

            // Mark message as read locally
            $this->message->markAsRead();

            Log::info("Message marked as read successfully", [
                'message_id' => $this->message->id,
                'whatsapp_message_id' => $this->message->message_id,
            ]);
        } catch (\Exception $e) {
            Log::error("Error marking message as read", [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark as read locally to prevent retries
            $this->message->markAsRead();
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("MarkMessageAsRead job failed permanently", [
            'message_id' => $this->message->id,
            'error' => $exception->getMessage(),
        ]);

        // Mark as read locally anyway
        $this->message->markAsRead();
    }
}
