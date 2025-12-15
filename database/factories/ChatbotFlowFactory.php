<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ChatbotFlow>
 */
class ChatbotFlowFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startNodeId = 'node-start';

        // Simple flow with start -> text -> end nodes
        $nodes = [
            [
                'id' => $startNodeId,
                'type' => 'start',
                'data' => ['label' => 'Início'],
                'position' => ['x' => 100, 'y' => 100],
            ],
            [
                'id' => 'node-text-1',
                'type' => 'text',
                'data' => [
                    'label' => 'Mensagem de Texto',
                    'message' => fake()->sentence(),
                ],
                'position' => ['x' => 100, 'y' => 200],
            ],
            [
                'id' => 'node-end',
                'type' => 'end',
                'data' => ['label' => 'Fim'],
                'position' => ['x' => 100, 'y' => 300],
            ],
        ];

        $edges = [
            [
                'id' => 'edge-1',
                'source' => $startNodeId,
                'target' => 'node-text-1',
            ],
            [
                'id' => 'edge-2',
                'source' => 'node-text-1',
                'target' => 'node-end',
            ],
        ];

        return [
            'chatbot_id' => \App\Models\Chatbot::factory(),
            'name' => fake()->words(2, true) . ' Flow',
            'nodes' => $nodes,
            'edges' => $edges,
            'start_node_id' => $startNodeId,
            'variables' => [
                'contact_name' => '',
                'contact_phone' => '',
            ],
        ];
    }
}
