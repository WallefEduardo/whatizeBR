<?php

namespace Database\Seeders;

use App\Models\Chatbot;
use App\Models\ChatbotFlow;
use App\Models\ChatbotSession;
use App\Models\WhatsAppInstance;
use Illuminate\Database\Seeder;

class ChatbotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first instance or create one
        $instance = WhatsAppInstance::first();

        if (!$instance) {
            $this->command->warn('No instances found. Please create an instance first.');
            return;
        }

        // Create chatbots with flows
        $chatbots = [
            [
                'name' => 'Boas-vindas',
                'description' => 'Mensagem de boas-vindas automática para novos contatos',
                'trigger_type' => 'always',
                'trigger_value' => null,
                'is_active' => true,
                'priority' => 10,
            ],
            [
                'name' => 'Suporte Básico',
                'description' => 'Chatbot de suporte com opções de menu',
                'trigger_type' => 'keyword',
                'trigger_value' => 'ajuda',
                'is_active' => true,
                'priority' => 5,
            ],
            [
                'name' => 'Horário de Atendimento',
                'description' => 'Resposta automática fora do horário comercial',
                'trigger_type' => 'business_hours',
                'trigger_value' => null,
                'is_active' => true,
                'priority' => 8,
            ],
        ];

        foreach ($chatbots as $chatbotData) {
            $chatbot = Chatbot::create([
                'instance_id' => $instance->id,
                ...$chatbotData,
            ]);

            // Create a simple flow for each chatbot
            ChatbotFlow::create([
                'chatbot_id' => $chatbot->id,
                'name' => 'Fluxo Principal',
                'nodes' => [
                    [
                        'id' => 'node-start',
                        'type' => 'start',
                        'data' => ['label' => 'Início'],
                        'position' => ['x' => 100, 'y' => 100],
                    ],
                    [
                        'id' => 'node-text-1',
                        'type' => 'text',
                        'data' => [
                            'label' => 'Mensagem de Boas-vindas',
                            'message' => "Olá! Bem-vindo(a) ao nosso atendimento.\n\nComo posso ajudá-lo(a) hoje?",
                        ],
                        'position' => ['x' => 100, 'y' => 200],
                    ],
                    [
                        'id' => 'node-end',
                        'type' => 'end',
                        'data' => ['label' => 'Fim'],
                        'position' => ['x' => 100, 'y' => 300],
                    ],
                ],
                'edges' => [
                    [
                        'id' => 'edge-1',
                        'source' => 'node-start',
                        'target' => 'node-text-1',
                    ],
                    [
                        'id' => 'edge-2',
                        'source' => 'node-text-1',
                        'target' => 'node-end',
                    ],
                ],
                'start_node_id' => 'node-start',
                'variables' => [
                    'contact_name' => '',
                    'contact_phone' => '',
                ],
            ]);
        }

        $this->command->info('Chatbots seeded successfully!');
    }
}
