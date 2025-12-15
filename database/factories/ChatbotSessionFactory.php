<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatbotSession>
 */
class ChatbotSessionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $statuses = ['active', 'completed', 'failed', 'cancelled'];
        $status = fake()->randomElement($statuses);
        $startedAt = fake()->dateTimeBetween('-1 week', 'now');

        return [
            'conversation_id' => \App\Models\Conversation::factory(),
            'chatbot_id' => \App\Models\Chatbot::factory(),
            'flow_id' => \App\Models\ChatbotFlow::factory(),
            'current_node_id' => $status === 'active' ? 'node-text-1' : 'node-end',
            'variables' => [
                'contact_name' => fake()->name(),
                'contact_phone' => fake()->phoneNumber(),
                'step' => fake()->numberBetween(1, 5),
            ],
            'status' => $status,
            'started_at' => $startedAt,
            'completed_at' => $status !== 'active' ? fake()->dateTimeBetween($startedAt, 'now') : null,
        ];
    }
}
