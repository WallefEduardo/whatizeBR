<?php

namespace Database\Factories;

use App\Models\Contact;
use App\Models\WhatsAppInstance;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'instance_id' => WhatsAppInstance::factory(),
            'contact_id' => Contact::factory(),
            'assigned_to' => null,
            'department_id' => null,
            'status' => fake()->randomElement(['open', 'pending', 'closed']),
            'is_group' => false,
            'group_name' => null,
            'group_avatar_url' => null,
            'unread_count' => fake()->numberBetween(0, 10),
            'last_message_id' => null,
            'last_message_at' => now(),
            'closed_at' => null,
        ];
    }
}
