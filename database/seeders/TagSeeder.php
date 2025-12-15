<?php

namespace Database\Seeders;

use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = [
            [
                'name' => 'Urgente',
                'color' => '#ef4444',
            ],
            [
                'name' => 'Importante',
                'color' => '#f59e0b',
            ],
            [
                'name' => 'Orçamento',
                'color' => '#22c55e',
            ],
            [
                'name' => 'Feedback',
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Suporte',
                'color' => '#6366f1',
            ],
            [
                'name' => 'Vendas',
                'color' => '#10b981',
            ],
            [
                'name' => 'Follow-up',
                'color' => '#8b5cf6',
            ],
            [
                'name' => 'VIP',
                'color' => '#ec4899',
            ],
        ];

        foreach ($tags as $tag) {
            Tag::create($tag);
        }
    }
}
