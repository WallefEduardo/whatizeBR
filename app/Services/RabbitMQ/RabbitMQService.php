<?php

namespace App\Services\RabbitMQ;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use Illuminate\Support\Facades\Log;

class RabbitMQService
{
    private $connection;
    private $channel;
    private $exchange;

    public function __construct()
    {
        try {
            $this->connection = new AMQPStreamConnection(
                config('rabbitmq.host'),
                config('rabbitmq.port'),
                config('rabbitmq.user'),
                config('rabbitmq.password'),
                config('rabbitmq.vhost'),
                false, // insist
                'AMQPLAIN', // login_method
                null, // login_response
                'en_US', // locale
                config('rabbitmq.options.connection_timeout', 3.0),
                config('rabbitmq.options.read_write_timeout', 3.0),
                null, // context
                config('rabbitmq.options.keepalive', false),
                config('rabbitmq.options.heartbeat', 0)
            );

            $this->channel = $this->connection->channel();
            $this->exchange = config('rabbitmq.exchange');

            // Declarar exchange (idempotente - pode ser chamado múltiplas vezes)
            $this->channel->exchange_declare(
                $this->exchange,
                config('rabbitmq.exchange_type', 'direct'), // type
                false, // passive
                true,  // durable - persiste após restart do RabbitMQ
                false  // auto_delete
            );

            Log::info('RabbitMQ connection established', [
                'exchange' => $this->exchange,
                'host' => config('rabbitmq.host'),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to connect to RabbitMQ', [
                'error' => $e->getMessage(),
                'host' => config('rabbitmq.host'),
                'port' => config('rabbitmq.port'),
            ]);
            throw $e;
        }
    }

    /**
     * Publish a message to the exchange with a routing key
     *
     * @param string $routingKey The routing key (e.g., 'send.text', 'send.media', 'send.button', 'send.list')
     * @param array $payload The message payload
     * @return void
     */
    public function publishWithRoutingKey(string $routingKey, array $payload): void
    {
        try {
            $messageBody = json_encode($payload);

            $message = new AMQPMessage(
                $messageBody,
                [
                    'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT, // 2 - persistent
                    'content_type' => 'application/json',
                    'timestamp' => time(),
                ]
            );

            $this->channel->basic_publish(
                $message,
                $this->exchange,
                $routingKey
            );

            Log::info('Message published to RabbitMQ', [
                'exchange' => $this->exchange,
                'routing_key' => $routingKey,
                'payload_size' => strlen($messageBody),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to publish message to RabbitMQ', [
                'error' => $e->getMessage(),
                'exchange' => $this->exchange,
                'routing_key' => $routingKey,
            ]);
            throw $e;
        }
    }

    /**
     * Publish a text message to WhatsApp
     *
     * @param string $instanceId
     * @param string $toPhone
     * @param string $message
     * @return void
     */
    public function publishTextMessage(string $instanceId, string $toPhone, string $message): void
    {
        $payload = [
            'instance_id' => $instanceId,
            'to' => $toPhone,
            'message' => $message,
            'type' => 'text',
            'timestamp' => now()->toIso8601String(),
        ];

        $this->publishWithRoutingKey('send.text', $payload);
    }

    /**
     * Publish a media message to WhatsApp
     *
     * @param string $instanceId
     * @param string $toPhone
     * @param string $mediaUrl
     * @param string $mediaType (image, video, audio, document)
     * @param string|null $caption
     * @return void
     */
    public function publishMediaMessage(string $instanceId, string $toPhone, string $mediaUrl, string $mediaType, ?string $caption = null): void
    {
        $payload = [
            'instance_id' => $instanceId,
            'to' => $toPhone,
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
            'caption' => $caption,
            'type' => 'media',
            'timestamp' => now()->toIso8601String(),
        ];

        $this->publishWithRoutingKey('send.media', $payload);
    }

    /**
     * Publish a button message to WhatsApp
     *
     * @param string $instanceId
     * @param string $toPhone
     * @param string $message
     * @param array $buttons
     * @return void
     */
    public function publishButtonMessage(string $instanceId, string $toPhone, string $message, array $buttons): void
    {
        $payload = [
            'instance_id' => $instanceId,
            'to' => $toPhone,
            'message' => $message,
            'buttons' => $buttons,
            'type' => 'button',
            'timestamp' => now()->toIso8601String(),
        ];

        $this->publishWithRoutingKey('send.button', $payload);
    }

    /**
     * Publish a list message to WhatsApp
     *
     * @param string $instanceId
     * @param string $toPhone
     * @param string $message
     * @param array $sections
     * @param string $buttonText
     * @return void
     */
    public function publishListMessage(string $instanceId, string $toPhone, string $message, array $sections, string $buttonText): void
    {
        $payload = [
            'instance_id' => $instanceId,
            'to' => $toPhone,
            'message' => $message,
            'sections' => $sections,
            'button_text' => $buttonText,
            'type' => 'list',
            'timestamp' => now()->toIso8601String(),
        ];

        $this->publishWithRoutingKey('send.list', $payload);
    }

    /**
     * Close the connection and channel
     *
     * @return void
     */
    public function __destruct()
    {
        try {
            if ($this->channel) {
                $this->channel->close();
            }
            if ($this->connection) {
                $this->connection->close();
            }
        } catch (\Exception $e) {
            Log::error('Error closing RabbitMQ connection', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
