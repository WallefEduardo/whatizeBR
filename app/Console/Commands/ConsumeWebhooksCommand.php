<?php

namespace App\Console\Commands;

use App\Services\RabbitMQ\RabbitMQService;
use App\Services\WhatsApp\WhatsAppWebhookHandler;
use PhpAmqpLib\Message\AMQPMessage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ConsumeWebhooksCommand extends Command
{
    protected $signature = 'rabbitmq:consume-webhooks';
    protected $description = 'Consume webhooks from RabbitMQ';

    public function __construct(
        private RabbitMQService $rabbitmq,
        private WhatsAppWebhookHandler $webhookHandler
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Starting webhook consumer...');

        $channel = $this->rabbitmq->getChannel();
        $queueName = config('rabbitmq.webhook_queue', 'whatsapp.webhook');

        // Declare queue (idempotent) - passive mode to not fail if exists
        try {
            $channel->queue_declare(
                $queueName,
                true,   // passive - don't create, just check if exists
                true,   // durable
                false,  // exclusive
                false   // auto_delete
            );
        } catch (\Exception $e) {
            // Queue doesn't exist, create it with proper args
            $channel->queue_declare(
                $queueName,
                false,  // passive
                true,   // durable
                false,  // exclusive
                false,  // auto_delete
                false,  // nowait
                ['x-message-ttl' => ['I', 86400000]] // 24 hours
            );
        }

        $this->info("Waiting for messages on queue: {$queueName}");

        $callback = function (AMQPMessage $msg) use ($channel) {
            try {
                $payload = json_decode($msg->body, true);

                if (!$payload) {
                    $this->error('Invalid JSON payload');
                    $channel->basic_nack($msg->delivery_info['delivery_tag'], false, false); // Reject and don't requeue
                    return;
                }

                $this->info("Processing webhook: {$payload['type']}");

                // Process webhook through handler
                $this->webhookHandler->handle($payload);

                // Acknowledge message
                $channel->basic_ack($msg->delivery_info['delivery_tag']);

                $this->info("Webhook processed successfully");
            } catch (\Exception $e) {
                $this->error("Failed to process webhook: {$e->getMessage()}");
                Log::error('Webhook processing failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                // Reject and requeue for retry
                $channel->basic_nack($msg->delivery_info['delivery_tag'], false, true);
            }
        };

        $channel->basic_qos(
            null,   // prefetch_size
            1,      // prefetch_count - process one message at a time
            null    // global
        );

        $channel->basic_consume(
            $queueName,
            '',     // consumer_tag
            false,  // no_local
            false,  // no_ack
            false,  // exclusive
            false,  // nowait
            $callback
        );

        $this->info('Consumer started. Press Ctrl+C to stop.');

        // Keep consuming messages
        while ($channel->callbacks) {
            try {
                $channel->wait();
            } catch (\Exception $e) {
                $this->error("Consumer error: {$e->getMessage()}");
                break;
            }
        }
    }
}
