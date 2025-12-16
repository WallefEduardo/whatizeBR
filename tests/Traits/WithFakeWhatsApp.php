<?php

namespace Tests\Traits;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Event;

trait WithFakeWhatsApp
{
    /**
     * Fake WhatsApp API responses
     */
    protected function fakeWhatsAppAPI(): void
    {
        Http::fake([
            'whatsapp-api/*' => Http::response([
                'status' => 'sent',
                'message_id' => 'wamid.test' . uniqid(),
            ], 200),
        ]);
    }

    /**
     * Fake WhatsApp API with custom response
     */
    protected function fakeWhatsAppAPIWithResponse(array $response, int $status = 200): void
    {
        Http::fake([
            'whatsapp-api/*' => Http::response($response, $status),
        ]);
    }

    /**
     * Fake WhatsApp API failure
     */
    protected function fakeWhatsAppAPIFailure(string $errorMessage = 'Rate limit exceeded', int $status = 429): void
    {
        Http::fake([
            'whatsapp-api/*' => Http::response([
                'error' => $errorMessage,
            ], $status),
        ]);
    }

    /**
     * Fake RabbitMQ Queue
     */
    protected function fakeRabbitMQ(): void
    {
        Queue::fake();
    }

    /**
     * Fake all notifications
     */
    protected function fakeNotifications(): void
    {
        Notification::fake();
    }

    /**
     * Fake all events
     */
    protected function fakeEvents(): void
    {
        Event::fake();
    }

    /**
     * Setup all fakes at once
     */
    protected function fakeAllWhatsAppServices(): void
    {
        $this->fakeWhatsAppAPI();
        $this->fakeRabbitMQ();
        $this->fakeNotifications();
        $this->fakeEvents();
    }
}
