<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#10b981', '#f97316'];

        return [
            'name' => fake()->randomElement(['Suporte', 'Vendas', 'Financeiro', 'Técnico', 'Comercial', 'Atendimento', 'SAC', 'Marketing']),
            'description' => fake()->sentence(10),
            'color' => fake()->randomElement($colors),
            'is_active' => fake()->boolean(90), // 90% de chance de ser true
        ];
    }
}
