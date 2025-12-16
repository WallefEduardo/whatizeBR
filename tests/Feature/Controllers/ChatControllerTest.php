<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Contact;
use App\Models\WhatsAppInstance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;
use Tests\Traits\WithFakeWhatsApp;

class ChatControllerTest extends TestCase
{
    use RefreshDatabase, WithFakeWhatsApp;

    protected User $user;
    protected WhatsAppInstance $instance;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->instance = WhatsAppInstance::factory()->create();

        // Fake all WhatsApp services
        $this->fakeAllWhatsAppServices();
    }

    /** @test */
    public function it_can_send_text_message()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/messages/send', [
                'conversation_id' => $conversation->id,
                'type' => 'text',
                'content' => 'Hello World',
            ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'conversation_id',
                'type',
                'content',
                'status',
                'created_at',
            ],
        ]);

        // Verifica que o job foi despachado
        Queue::assertPushed(\App\Jobs\SendWhatsAppTextMessage::class);

        // Verifica que a mensagem foi salva no banco
        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'content' => 'Hello World',
            'type' => 'text',
            'direction' => 'outbound',
        ]);
    }

    /** @test */
    public function it_validates_message_content_is_required()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/messages/send', [
                'conversation_id' => $conversation->id,
                'type' => 'text',
                'content' => '', // vazio
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['content']);
    }

    /** @test */
    public function it_validates_conversation_exists()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/messages/send', [
                'conversation_id' => 999999, // não existe
                'type' => 'text',
                'content' => 'Test',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['conversation_id']);
    }

    /** @test */
    public function it_can_list_conversations()
    {
        Conversation::factory()->count(5)->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/conversations');

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    /** @test */
    public function it_can_filter_conversations_by_status()
    {
        Conversation::factory()->count(3)->create([
            'instance_id' => $this->instance->id,
            'status' => 'open',
        ]);

        Conversation::factory()->count(2)->create([
            'instance_id' => $this->instance->id,
            'status' => 'closed',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/conversations?status=open');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }

    /** @test */
    public function it_can_search_conversations_by_contact_name()
    {
        $contact1 = Contact::factory()->create(['name' => 'João Silva']);
        $contact2 = Contact::factory()->create(['name' => 'Maria Santos']);

        Conversation::factory()->create([
            'instance_id' => $this->instance->id,
            'contact_id' => $contact1->id,
        ]);

        Conversation::factory()->create([
            'instance_id' => $this->instance->id,
            'contact_id' => $contact2->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/conversations?search=João');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $response->assertJsonFragment(['name' => 'João Silva']);
    }

    /** @test */
    public function it_can_mark_message_as_read()
    {
        $message = Message::factory()->create([
            'instance_id' => $this->instance->id,
            'status' => 'delivered',
            'read_at' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/messages/{$message->id}/read");

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'status' => 'read',
        ]);

        $this->assertNotNull($message->fresh()->read_at);
    }

    /** @test */
    public function it_can_get_conversation_messages()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
        ]);

        Message::factory()->count(10)->create([
            'conversation_id' => $conversation->id,
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/conversations/{$conversation->id}/messages");

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
    }

    /** @test */
    public function it_paginates_messages_correctly()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
        ]);

        Message::factory()->count(30)->create([
            'conversation_id' => $conversation->id,
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/conversations/{$conversation->id}/messages?per_page=10");

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
        $response->assertJsonStructure([
            'data',
            'meta' => ['total', 'per_page', 'current_page'],
        ]);
    }

    /** @test */
    public function unauthorized_user_cannot_send_messages()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->postJson('/api/messages/send', [
            'conversation_id' => $conversation->id,
            'type' => 'text',
            'content' => 'Hello',
        ]);

        $response->assertStatus(401);
    }

    /** @test */
    public function it_can_send_media_message()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/messages/send', [
                'conversation_id' => $conversation->id,
                'type' => 'image',
                'media_url' => 'https://example.com/image.jpg',
                'caption' => 'Check this out',
            ]);

        $response->assertStatus(201);

        Queue::assertPushed(\App\Jobs\SendWhatsAppMediaMessage::class);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'type' => 'image',
            'media_url' => 'https://example.com/image.jpg',
            'caption' => 'Check this out',
        ]);
    }

    /** @test */
    public function it_can_assign_conversation_to_user()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
            'assigned_to' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/conversations/{$conversation->id}/assign", [
                'user_id' => $this->user->id,
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'assigned_to' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_can_close_conversation()
    {
        $conversation = Conversation::factory()->create([
            'instance_id' => $this->instance->id,
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/conversations/{$conversation->id}/close");

        $response->assertStatus(200);

        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'status' => 'closed',
        ]);

        $this->assertNotNull($conversation->fresh()->closed_at);
    }
}
