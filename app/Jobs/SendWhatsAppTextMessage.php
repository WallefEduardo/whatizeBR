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

class SendWhatsAppTextMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;

    public function __construct(
        public Message $message
    ) {}

    public function handle(RabbitMQService $rabbitmq): void
    {
        try {
            // Get instance token from the message's WhatsApp instance
            $instanceToken = $this->message->instance->instance_key;

            Log::info('Publishing text message to RabbitMQ', [
                'message_id' => $this->message->id,
                'instance_token' => $instanceToken,
                'to' => $this->message->to_phone,
            ]);

            // Publish message to RabbitMQ with routing key: send.text
            $rabbitmq->publishTextMessage(
                $instanceToken,
                $this->message->to_phone,
                $this->message->content
            );

            // Update message status to "queued" (waiting for Replica Service to send)
            $this->message->update([
                'status' => 'queued',
            ]);

            Log::info('Message queued successfully', [
                'message_id' => $this->message->id,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to queue WhatsApp message', [
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
