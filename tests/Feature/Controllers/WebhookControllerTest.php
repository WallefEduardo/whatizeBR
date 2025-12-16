<?php

namespace Tests\Feature\Controllers;

use App\Models\WhatsAppInstance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\WithFakeWhatsApp;

class WebhookControllerTest extends TestCase
{
    use RefreshDatabase, WithFakeWhatsApp;

    protected WhatsAppInstance $instance;

    protected function setUp(): void
    {
        parent::setUp();

        $this->instance = WhatsAppInstance::factory()->create([
            'webhook_secret' => 'test-secret-key',
            'token' => 'instance-token-123',
        ]);

        $this->fakeAllWhatsAppServices();
    }

    /** @test */
    public function it_can_process_incoming_text_message_webhook()
    {
        $payload = [
            'instance_token' => $this->instance->token,
            'event' => 'message.received',
            'data' => [
                'message_id' => 'wamid.incoming123',
                'from' => '5585999999999',
                'to' => '5585988888888',
                'type' => 'text',
                'text' => ['body' => 'Olá, preciso de ajuda'],
                'timestamp' => now()->timestamp,
            ],
        ];

        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);

        Queue::assertPushed(\App\Jobs\ProcessIncomingMessage::class);

        $this->assertDatabaseHas('conversations', [
            'instance_id' => $this->instance->id,
        ]);

        $this->assertDatabaseHas('messages', [
            'message_id' => 'wamid.incoming123',
            'content' => 'Olá, preciso de ajuda',
            'direction' => 'inbound',
        ]);
    }

    /** @test */
    public function it_rejects_webhook_with_invalid_token()
    {
        $payload = [
            'instance_token' => 'invalid-token',
            'event' => 'message.received',
            'data' => [],
        ];

        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_process_message_status_update()
    {
        $message = \App\Models\Message::factory()->create([
            'instance_id' => $this->instance->id,
            'message_id' => 'wamid.test456',
            'status' => 'sent',
        ]);

        $payload = [
            'instance_token' => $this->instance->token,
            'event' => 'message.status',
            'data' => [
                'message_id' => 'wamid.test456',
                'status' => 'read',
                'timestamp' => now()->timestamp,
            ],
        ];

        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'message_id' => 'wamid.test456',
            'status' => 'read',
        ]);
    }

    /** @test */
    public function it_handles_media_message_webhook()
    {
        $payload = [
            'instance_token' => $this->instance->token,
            'event' => 'message.received',
            'data' => [
                'message_id' => 'wamid.media789',
                'from' => '5585999999999',
                'to' => '5585988888888',
                'type' => 'image',
                'image' => [
                    'url' => 'https://example.com/image.jpg',
                    'mime_type' => 'image/jpeg',
                    'caption' => 'Check this',
                ],
                'timestamp' => now()->timestamp,
            ],
        ];

        $response = $this->postJson('/api/webhooks/whatsapp', $payload);

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'message_id' => 'wamid.media789',
            'type' => 'image',
            'media_url' => 'https://example.com/image.jpg',
            'caption' => 'Check this',
        ]);
    }
}
