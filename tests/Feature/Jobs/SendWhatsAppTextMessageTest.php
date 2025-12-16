<?php

namespace Tests\Feature\Jobs;

use App\Jobs\SendWhatsAppTextMessage;
use App\Models\Message;
use App\Models\WhatsAppInstance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SendWhatsAppTextMessageTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_sends_text_message_successfully()
    {
        // Fake da API
        Http::fake([
            '*' => Http::response([
                'status' => 'sent',
                'message_id' => 'wamid.sent789',
            ], 200),
        ]);

        $instance = WhatsAppInstance::factory()->create();

        $message = Message::factory()->create([
            'instance_id' => $instance->id,
            'type' => 'text',
            'content' => 'Test message',
            'to_phone' => '5585999999999',
            'status' => 'pending',
        ]);

        // Executa o job
        $job = new SendWhatsAppTextMessage($message);
        $job->handle();

        // Verifica que a requisição HTTP foi feita
        Http::assertSent(function ($request) {
            return $request['type'] === 'text' &&
                   $request['content'] === 'Test message';
        });

        // Verifica que o status foi atualizado
        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'status' => 'sent',
            'message_id' => 'wamid.sent789',
        ]);

        $this->assertNotNull($message->fresh()->sent_at);
    }

    /** @test */
    public function it_handles_api_failure_gracefully()
    {
        // Simula falha na API
        Http::fake([
            '*' => Http::response([
                'error' => 'Rate limit exceeded',
            ], 429),
        ]);

        $instance = WhatsAppInstance::factory()->create();

        $message = Message::factory()->create([
            'instance_id' => $instance->id,
            'type' => 'text',
            'content' => 'Test',
            'status' => 'pending',
        ]);

        $job = new SendWhatsAppTextMessage($message);

        $this->expectException(\Exception::class);

        $job->handle();

        // Verifica que o status foi marcado como failed
        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'status' => 'failed',
        ]);

        $this->assertNotNull($message->fresh()->error_message);
        $this->assertNotNull($message->fresh()->failed_at);
    }

    /** @test */
    public function it_retries_on_failure()
    {
        $message = Message::factory()->create([
            'type' => 'text',
            'content' => 'Test',
            'status' => 'pending',
        ]);

        $job = new SendWhatsAppTextMessage($message);

        // Verifica que o job tem configuração de retry
        $this->assertGreaterThan(0, $job->tries);
    }
}
