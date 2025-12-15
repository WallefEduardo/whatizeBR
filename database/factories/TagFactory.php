<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colors = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981'];

        return [
            'name' => fake()->randomElement(['Urgente', 'Importante', 'Orçamento', 'Feedback', 'Suporte', 'Vendas', 'Follow-up', 'VIP', 'Em andamento', 'Pendente']),
            'color' => fake()->randomElement($colors),
        ];
    }
}
