<?php

namespace Tests\Feature\Controllers;

use App\Models\User;
use App\Models\Broadcast;
use App\Models\Contact;
use App\Models\WhatsAppInstance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Tests\Traits\WithFakeWhatsApp;

class BroadcastControllerTest extends TestCase
{
    use RefreshDatabase, WithFakeWhatsApp;

    protected User $user;
    protected WhatsAppInstance $instance;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->instance = WhatsAppInstance::factory()->create();
        $this->fakeAllWhatsAppServices();
    }

    /** @test */
    public function it_can_create_broadcast()
    {
        Contact::factory()->count(10)->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/broadcasts', [
                'name' => 'Promoção Black Friday',
                'message_type' => 'text',
                'message_content' => 'Aproveite 50% OFF!',
                'instance_id' => $this->instance->id,
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('broadcasts', [
            'name' => 'Promoção Black Friday',
            'status' => 'draft',
        ]);
    }

    /** @test */
    public function it_validates_broadcast_name_is_required()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/broadcasts', [
                'name' => '',
                'message_type' => 'text',
                'message_content' => 'Test',
            ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name']);
    }

    /** @test */
    public function it_can_schedule_broadcast()
    {
        $broadcast = Broadcast::factory()->create([
            'instance_id' => $this->instance->id,
            'status' => 'draft',
        ]);

        $scheduledAt = now()->addHours(2);

        $response = $this->actingAs($this->user)
            ->putJson("/api/broadcasts/{$broadcast->id}/schedule", [
                'scheduled_at' => $scheduledAt->toIso8601String(),
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('broadcasts', [
            'id' => $broadcast->id,
            'status' => 'scheduled',
        ]);
    }

    /** @test */
    public function it_dispatches_jobs_when_sending_broadcast()
    {
        $broadcast = Broadcast::factory()->create([
            'instance_id' => $this->instance->id,
            'status' => 'scheduled',
            'total_recipients' => 100,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/broadcasts/{$broadcast->id}/send");

        $response->assertStatus(200);

        Queue::assertPushed(\App\Jobs\SendBroadcastMessage::class);
    }

    /** @test */
    public function it_can_cancel_scheduled_broadcast()
    {
        $broadcast = Broadcast::factory()->create([
            'instance_id' => $this->instance->id,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/broadcasts/{$broadcast->id}/cancel");

        $response->assertStatus(200);

        $this->assertDatabaseHas('broadcasts', [
            'id' => $broadcast->id,
            'status' => 'cancelled',
        ]);
    }

    /** @test */
    public function it_can_list_broadcasts()
    {
        Broadcast::factory()->count(5)->create([
            'instance_id' => $this->instance->id,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/broadcasts');

        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');
    }

    /** @test */
    public function it_can_filter_broadcasts_by_status()
    {
        Broadcast::factory()->count(3)->create([
            'instance_id' => $this->instance->id,
            'status' => 'completed',
        ]);

        Broadcast::factory()->count(2)->create([
            'instance_id' => $this->instance->id,
            'status' => 'scheduled',
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/broadcasts?status=completed');

        $response->assertStatus(200);
        $response->assertJsonCount(3, 'data');
    }
}
