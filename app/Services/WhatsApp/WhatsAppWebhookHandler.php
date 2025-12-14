<?php

namespace App\Services\WhatsApp;

use App\Events\WhatsApp\MessageReceived;
use App\Events\WhatsApp\MessageSent;
use App\Events\WhatsApp\MessageRead;
use App\Events\WhatsApp\TypingIndicator;
use App\Events\WhatsApp\PresenceUpdate;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookHandler
{
    /**
     * Verify HMAC signature for webhook security
     *
     * @param array $payload
     * @param string|null $signature
     * @return bool
     */
    public function verifySignature(array $payload, ?string $signature): bool
    {
        if (!$signature) {
            return false;
        }

        $secret = config('rabbitmq.webhook_secret');
        if (!$secret) {
            Log::warning('Webhook secret not configured');
            return true; // Skip verification if no secret is set
        }

        $expectedSignature = hash_hmac('sha256', json_encode($payload), $secret);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Handle incoming webhook payload
     *
     * @param array $payload
     * @return void
     */
    public function handle(array $payload): void
    {
        $type = $payload['type'] ?? null;

        if (!$type) {
            Log::warning('Webhook payload missing type field', ['payload' => $payload]);
            return;
        }

        Log::info('Processing webhook', [
            'type' => $type,
            'instance_id' => $payload['instance_id'] ?? null,
        ]);

        match ($type) {
            'message' => $this->handleMessageReceived($payload),
            'message_sent' => $this->handleMessageSent($payload),
            'message_read' => $this->handleMessageRead($payload),
            'typing' => $this->handleTypingIndicator($payload),
            'presence' => $this->handlePresenceUpdate($payload),
            default => $this->handleUnknownType($type, $payload),
        };
    }

    /**
     * Handle message received event
     */
    private function handleMessageReceived(array $payload): void
    {
        event(new MessageReceived($payload));
        Log::info('MessageReceived event dispatched', [
            'from' => $payload['from'] ?? null,
        ]);
    }

    /**
     * Handle message sent event
     */
    private function handleMessageSent(array $payload): void
    {
        event(new MessageSent($payload));
        Log::info('MessageSent event dispatched', [
            'message_id' => $payload['message_id'] ?? null,
        ]);
    }

    /**
     * Handle message read event
     */
    private function handleMessageRead(array $payload): void
    {
        event(new MessageRead($payload));
        Log::info('MessageRead event dispatched', [
            'message_id' => $payload['message_id'] ?? null,
        ]);
    }

    /**
     * Handle typing indicator event
     */
    private function handleTypingIndicator(array $payload): void
    {
        event(new TypingIndicator($payload));
        Log::debug('TypingIndicator event dispatched', [
            'from' => $payload['from'] ?? null,
            'is_typing' => $payload['is_typing'] ?? null,
        ]);
    }

    /**
     * Handle presence update event
     */
    private function handlePresenceUpdate(array $payload): void
    {
        event(new PresenceUpdate($payload));
        Log::debug('PresenceUpdate event dispatched', [
            'from' => $payload['from'] ?? null,
            'presence' => $payload['presence'] ?? null,
        ]);
    }

    /**
     * Handle unknown webhook type
     */
    private function handleUnknownType(string $type, array $payload): void
    {
        Log::warning('Unknown webhook type received', [
            'type' => $type,
            'payload' => $payload,
        ]);
    }
}
