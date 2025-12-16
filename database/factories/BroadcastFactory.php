<?php

namespace Database\Factories;

use App\Models\WhatsAppInstance;
use Illuminate\Database\Eloquent\Factories\Factory;

class BroadcastFactory extends Factory
{
    public function definition(): array
    {
        return [
            'instance_id' => WhatsAppInstance::factory(),
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'filters' => [],
            'message_type' => 'text',
            'message_content' => fake()->sentence(),
            'media_url' => null,
            'buttons' => null,
            'list_options' => null,
            'status' => fake()->randomElement(['draft', 'scheduled', 'processing', 'completed', 'failed']),
            'scheduled_at' => null,
            'total_recipients' => fake()->numberBetween(0, 1000),
            'sent_count' => 0,
            'delivered_count' => 0,
            'read_count' => 0,
            'failed_count' => 0,
        ];
    }
}
