<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedGlobalSettings();
    }

    /**
     * Seed global settings (instance_id = null)
     */
    private function seedGlobalSettings(): void
    {
        $defaults = [
            // Configurações Gerais
            [
                'key' => 'company_name',
                'value' => 'WhatizeBr',
                'type' => 'string',
            ],
            [
                'key' => 'company_logo',
                'value' => null,
                'type' => 'string',
            ],
            [
                'key' => 'timezone',
                'value' => 'America/Sao_Paulo',
                'type' => 'string',
            ],

            // Horário Comercial
            [
                'key' => 'business_hours_enabled',
                'value' => false,
                'type' => 'boolean',
            ],
            [
                'key' => 'business_hours',
                'value' => [
                    'monday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                    'tuesday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                    'wednesday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                    'thursday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                    'friday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                    'saturday' => ['start' => '09:00', 'end' => '13:00', 'enabled' => false],
                    'sunday' => ['start' => '09:00', 'end' => '13:00', 'enabled' => false],
                ],
                'type' => 'json',
            ],

            // Mensagens Padrão
            [
                'key' => 'welcome_message',
                'value' => 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?',
                'type' => 'string',
            ],
            [
                'key' => 'away_message',
                'value' => 'No momento estamos fora do horário de atendimento. Retornaremos em breve. Deixe sua mensagem que responderemos assim que possível.',
                'type' => 'string',
            ],
            [
                'key' => 'queue_message',
                'value' => 'Obrigado por entrar em contato! Você está na fila de atendimento. Em breve um de nossos atendentes irá responder.',
                'type' => 'string',
            ],

            // Configurações de Atendimento
            [
                'key' => 'auto_assign_enabled',
                'value' => true,
                'type' => 'boolean',
            ],
            [
                'key' => 'max_concurrent_chats',
                'value' => 5,
                'type' => 'number',
            ],
            [
                'key' => 'auto_close_inactive_chats',
                'value' => true,
                'type' => 'boolean',
            ],
            [
                'key' => 'auto_close_inactive_hours',
                'value' => 24,
                'type' => 'number',
            ],

            // Webhooks
            [
                'key' => 'webhook_url',
                'value' => null,
                'type' => 'string',
            ],
            [
                'key' => 'webhook_enabled',
                'value' => false,
                'type' => 'boolean',
            ],
            [
                'key' => 'webhook_events',
                'value' => [
                    'message.received',
                    'message.sent',
                    'message.read',
                    'conversation.created',
                    'conversation.assigned',
                    'conversation.closed',
                ],
                'type' => 'json',
            ],

            // Notificações
            [
                'key' => 'notifications_enabled',
                'value' => true,
                'type' => 'boolean',
            ],
            [
                'key' => 'notification_sound_enabled',
                'value' => true,
                'type' => 'boolean',
            ],
            [
                'key' => 'notification_desktop_enabled',
                'value' => true,
                'type' => 'boolean',
            ],

            // API Config
            [
                'key' => 'api_rate_limit',
                'value' => 60,
                'type' => 'number',
            ],
            [
                'key' => 'api_timeout',
                'value' => 30,
                'type' => 'number',
            ],
        ];

        foreach ($defaults as $default) {
            Setting::updateOrCreate(
                [
                    'key' => $default['key'],
                    'instance_id' => null,
                ],
                [
                    'value' => $default['value'],
                    'type' => $default['type'],
                ]
            );
        }

        $this->command->info('✅ Configurações globais criadas com sucesso!');
    }
}
