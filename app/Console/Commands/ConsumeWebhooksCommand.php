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

        // Declare queue (idempotent)
        $channel->queue_declare(
            $queueName,
            false,  // passive
            true,   // durable
            false,  // exclusive
            false   // auto_delete
        );

        $this->info("Waiting for messages on queue: {$queueName}");

        $callback = function (AMQPMessage $msg) {
            try {
                $payload = json_decode($msg->body, true);

                if (!$payload) {
                    $this->error('Invalid JSON payload');
                    $msg->nack(false, false); // Reject and don't requeue
                    return;
                }

                $this->info("Processing webhook: {$payload['type']}");

                // Process webhook through handler
                $this->webhookHandler->handle($payload);

                // Acknowledge message
                $msg->ack();

                $this->info("Webhook processed successfully");
            } catch (\Exception $e) {
                $this->error("Failed to process webhook: {$e->getMessage()}");
                Log::error('Webhook processing failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);

                // Reject and requeue for retry
                $msg->nack(false, true);
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

        while ($channel->is_consuming()) {
            $channel->wait();
        }
    }
}
