<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\WhatsAppInstance>
 */
class WhatsAppInstanceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'name' => fake()->company(),
            'phone' => '5585' . fake()->numerify('#########'),
            'instance_key' => 'inst_' . fake()->uuid(),
            'status' => fake()->randomElement(['connected', 'disconnected', 'connecting']),
            'qr_code' => null,
            'connected_at' => now(),
            'webhook_config' => [
                'url' => fake()->url(),
                'secret' => fake()->sha256(),
            ],
            'is_active' => true,
        ];
    }
}
