<?php

namespace App\Jobs;

use App\Models\Message;
use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMediaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public Message $message
    ) {}

    public function handle(RabbitMQService $rabbitmq): void
    {
        try {
            // Get instance token from the message's WhatsApp instance
            $instanceToken = $this->message->instance->instance_key;

            // Determine media type from message type
            $mediaType = match($this->message->type) {
                'image' => 'image',
                'video' => 'video',
                'audio' => 'audio',
                'document' => 'document',
                default => 'document'
            };

            Log::info('Publishing media message to RabbitMQ', [
                'message_id' => $this->message->id,
                'instance_token' => $instanceToken,
                'to' => $this->message->to_phone,
                'media_type' => $mediaType,
            ]);

            // Publish message to RabbitMQ with routing key: send.media
            $rabbitmq->publishMediaMessage(
                $instanceToken,
                $this->message->to_phone,
                $this->message->media_url,
                $mediaType,
                $this->message->caption
            );

            // Update message status to "queued" (waiting for Replica Service to send)
            $this->message->update([
                'status' => 'queued',
            ]);

            Log::info('Media message queued successfully', [
                'message_id' => $this->message->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue WhatsApp media message', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $this->message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'failed_at' => now(),
            ]);

            throw $e;
        }
    }
}
