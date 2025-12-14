<?php

namespace App\Services\WhatsApp;

use App\Models\WhatsAppInstance;
use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    public function __construct(
        private RabbitMQService $rabbitMQService
    ) {}

    /**
     * Send a text message via WhatsApp
     *
     * @param WhatsAppInstance $instance
     * @param string $toPhone
     * @param string $message
     * @return void
     */
    public function sendTextMessage(WhatsAppInstance $instance, string $toPhone, string $message): void
    {
        if (!$instance->isConnected() || !$instance->isActive()) {
            Log::warning('Attempted to send message with inactive or disconnected instance', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
                'is_active' => $instance->is_active,
            ]);
            throw new \Exception('WhatsApp instance is not connected or active');
        }

        $this->rabbitMQService->publishTextMessage(
            $instance->instance_key,
            $toPhone,
            $message
        );

        Log::info('Text message queued for sending', [
            'instance_id' => $instance->id,
            'to' => $toPhone,
        ]);
    }

    /**
     * Send a media message via WhatsApp
     *
     * @param WhatsAppInstance $instance
     * @param string $toPhone
     * @param string $mediaUrl
     * @param string $mediaType
     * @param string|null $caption
     * @return void
     */
    public function sendMediaMessage(
        WhatsAppInstance $instance,
        string $toPhone,
        string $mediaUrl,
        string $mediaType,
        ?string $caption = null
    ): void {
        if (!$instance->isConnected() || !$instance->isActive()) {
            Log::warning('Attempted to send media with inactive or disconnected instance', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
            ]);
            throw new \Exception('WhatsApp instance is not connected or active');
        }

        $this->rabbitMQService->publishMediaMessage(
            $instance->instance_key,
            $toPhone,
            $mediaUrl,
            $mediaType,
            $caption
        );

        Log::info('Media message queued for sending', [
            'instance_id' => $instance->id,
            'to' => $toPhone,
            'media_type' => $mediaType,
        ]);
    }

    /**
     * Send a button message via WhatsApp
     *
     * @param WhatsAppInstance $instance
     * @param string $toPhone
     * @param string $message
     * @param array $buttons
     * @return void
     */
    public function sendButtonMessage(
        WhatsAppInstance $instance,
        string $toPhone,
        string $message,
        array $buttons
    ): void {
        if (!$instance->isConnected() || !$instance->isActive()) {
            Log::warning('Attempted to send button message with inactive or disconnected instance', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
            ]);
            throw new \Exception('WhatsApp instance is not connected or active');
        }

        $this->rabbitMQService->publishButtonMessage(
            $instance->instance_key,
            $toPhone,
            $message,
            $buttons
        );

        Log::info('Button message queued for sending', [
            'instance_id' => $instance->id,
            'to' => $toPhone,
            'button_count' => count($buttons),
        ]);
    }

    /**
     * Send a list message via WhatsApp
     *
     * @param WhatsAppInstance $instance
     * @param string $toPhone
     * @param string $message
     * @param array $sections
     * @param string $buttonText
     * @return void
     */
    public function sendListMessage(
        WhatsAppInstance $instance,
        string $toPhone,
        string $message,
        array $sections,
        string $buttonText
    ): void {
        if (!$instance->isConnected() || !$instance->isActive()) {
            Log::warning('Attempted to send list message with inactive or disconnected instance', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
            ]);
            throw new \Exception('WhatsApp instance is not connected or active');
        }

        $this->rabbitMQService->publishListMessage(
            $instance->instance_key,
            $toPhone,
            $message,
            $sections,
            $buttonText
        );

        Log::info('List message queued for sending', [
            'instance_id' => $instance->id,
            'to' => $toPhone,
            'section_count' => count($sections),
        ]);
    }
}
