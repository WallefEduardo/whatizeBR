<?php

namespace App\Jobs;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsAppInstance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppTextMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

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
                $this->message->markAsFailed('Instance is not connected');
                Log::warning("Cannot send message: instance not connected", [
                    'message_id' => $this->message->id,
                    'instance_id' => $instance->id,
                ]);
                return;
            }

            // Prepare request payload
            $payload = [
                'number' => $this->message->to_phone,
                'text' => $this->message->content,
            ];

            // Add quoted message if this is a reply
            if ($this->message->replied_to_message_id) {
                $repliedMessage = $this->message->repliedToMessage;
                if ($repliedMessage && $repliedMessage->message_id) {
                    $payload['quoted'] = [
                        'key' => [
                            'id' => $repliedMessage->message_id,
                        ],
                    ];
                }
            }

            // Send request to Evolution API
            $response = Http::withHeaders([
                'apikey' => config('whatsapp.evolution_api_key'),
            ])->post(
                config('whatsapp.evolution_api_url') . "/message/sendText/{$instance->token}",
                $payload
            );

            if (!$response->successful()) {
                $errorMessage = $response->json('message') ?? 'Failed to send message';
                $this->message->markAsFailed($errorMessage);

                Log::error("Failed to send WhatsApp text message", [
                    'message_id' => $this->message->id,
                    'status' => $response->status(),
                    'error' => $errorMessage,
                    'response' => $response->body(),
                ]);

                return;
            }

            $data = $response->json();

            // Update message with API response
            $this->message->update([
                'message_id' => $data['key']['id'] ?? null,
                'status' => 'sent',
                'sent_at' => now(),
                'metadata' => array_merge($this->message->metadata ?? [], [
                    'api_response' => $data,
                ]),
            ]);

            // Update conversation's last message
            $this->updateConversationLastMessage();

            Log::info("WhatsApp text message sent successfully", [
                'message_id' => $this->message->id,
                'whatsapp_message_id' => $this->message->message_id,
            ]);
        } catch (\Exception $e) {
            $this->message->markAsFailed($e->getMessage());

            Log::error("Error sending WhatsApp text message", [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Update conversation's last message reference
     */
    protected function updateConversationLastMessage(): void
    {
        $conversation = $this->message->conversation;

        $conversation->update([
            'last_message_id' => $this->message->id,
            'last_message_at' => $this->message->created_at,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("SendWhatsAppTextMessage job failed permanently", [
            'message_id' => $this->message->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
