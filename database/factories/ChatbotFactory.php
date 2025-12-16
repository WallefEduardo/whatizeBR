<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Chatbot>
 */
class ChatbotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $triggerTypes = ['keyword', 'always', 'business_hours', 'custom'];
        $triggerType = fake()->randomElement($triggerTypes);

        return [
            'instance_id' => \App\Models\WhatsAppInstance::factory(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'trigger_type' => $triggerType,
            'trigger_value' => $triggerType === 'keyword' ? fake()->word() : null,
            'is_active' => fake()->boolean(80),
            'priority' => fake()->numberBetween(0, 10),
        ];
    }
}
