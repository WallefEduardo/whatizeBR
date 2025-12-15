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

class SendWhatsAppMediaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120; // 2 minutes for media uploads

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
                Log::warning("Cannot send media message: instance not connected", [
                    'message_id' => $this->message->id,
                    'instance_id' => $instance->id,
                ]);
                return;
            }

            // Validate media URL
            if (empty($this->message->media_url)) {
                $this->message->markAsFailed('Media URL is required');
                return;
            }

            // Prepare request payload based on media type
            $payload = [
                'number' => $this->message->to_phone,
                'mediatype' => $this->getMediaType(),
                'media' => $this->message->media_url,
            ];

            // Add caption if present
            if (!empty($this->message->caption)) {
                $payload['caption'] = $this->message->caption;
            }

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

            // Determine endpoint based on message type
            $endpoint = $this->getEndpoint();

            // Send request to Evolution API
            $response = Http::withHeaders([
                'apikey' => config('whatsapp.evolution_api_key'),
            ])->timeout(120)->post(
                config('whatsapp.evolution_api_url') . "/message/{$endpoint}/{$instance->token}",
                $payload
            );

            if (!$response->successful()) {
                $errorMessage = $response->json('message') ?? 'Failed to send media message';
                $this->message->markAsFailed($errorMessage);

                Log::error("Failed to send WhatsApp media message", [
                    'message_id' => $this->message->id,
                    'type' => $this->message->type,
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

            Log::info("WhatsApp media message sent successfully", [
                'message_id' => $this->message->id,
                'type' => $this->message->type,
                'whatsapp_message_id' => $this->message->message_id,
            ]);
        } catch (\Exception $e) {
            $this->message->markAsFailed($e->getMessage());

            Log::error("Error sending WhatsApp media message", [
                'message_id' => $this->message->id,
                'type' => $this->message->type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Get Evolution API endpoint based on message type
     */
    protected function getEndpoint(): string
    {
        return match ($this->message->type) {
            'image' => 'sendMedia',
            'video' => 'sendMedia',
            'audio' => 'sendWhatsAppAudio',
            'document' => 'sendMedia',
            'sticker' => 'sendSticker',
            default => 'sendMedia',
        };
    }

    /**
     * Get media type for Evolution API
     */
    protected function getMediaType(): string
    {
        return match ($this->message->type) {
            'image' => 'image',
            'video' => 'video',
            'audio' => 'audio',
            'document' => 'document',
            'sticker' => 'sticker',
            default => 'document',
        };
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
        Log::error("SendWhatsAppMediaMessage job failed permanently", [
            'message_id' => $this->message->id,
            'type' => $this->message->type,
            'error' => $exception->getMessage(),
        ]);
    }
}
