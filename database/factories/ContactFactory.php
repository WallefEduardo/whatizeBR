<?php

namespace Database\Factories;

use App\Models\WhatsAppInstance;
use Illuminate\Database\Eloquent\Factories\Factory;

class ContactFactory extends Factory
{
    public function definition(): array
    {
        return [
            'instance_id' => WhatsAppInstance::factory(),
            'phone' => '5585' . fake()->numerify('#########'),
            'name' => fake()->name(),
            'avatar_url' => fake()->imageUrl(200, 200, 'people'),
            'email' => fake()->unique()->safeEmail(),
            'notes' => fake()->sentence(),
            'custom_fields' => [],
            'is_blocked' => false,
            'last_interaction_at' => now(),
        ];
    }
}
