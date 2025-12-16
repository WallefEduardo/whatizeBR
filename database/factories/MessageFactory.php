<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\WhatsAppInstance;
use Illuminate\Database\Eloquent\Factories\Factory;

class MessageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'instance_id' => WhatsAppInstance::factory(),
            'conversation_id' => Conversation::factory(),
            'message_id' => 'wamid.' . fake()->uuid(),
            'direction' => fake()->randomElement(['inbound', 'outbound']),
            'from_phone' => '5585' . fake()->numerify('#########'),
            'to_phone' => '5585' . fake()->numerify('#########'),
            'type' => 'text',
            'content' => fake()->sentence(),
            'media_url' => null,
            'media_type' => null,
            'media_size' => null,
            'thumbnail_url' => null,
            'caption' => null,
            'latitude' => null,
            'longitude' => null,
            'replied_to_message_id' => null,
            'metadata' => [],
            'status' => fake()->randomElement(['pending', 'sent', 'delivered', 'read', 'failed']),
            'error_message' => null,
            'sent_at' => null,
            'delivered_at' => null,
            'read_at' => null,
            'failed_at' => null,
        ];
    }
}
