<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\WhatsAppInstance;
use App\Models\Member;
use App\Models\User;
use App\Models\Department;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    /**
     * Display settings page
     */
    public function index(Request $request): Response
    {
        $instanceId = $request->input('instance_id') ?? $request->user()->instance_id;

        // ✅ OTIMIZADO: Cache settings por instância
        $settings = cache()->remember(
            "settings_instance_{$instanceId}",
            300, // 5 minutos
            function() use ($instanceId) {
                $query = Setting::query();

                if ($instanceId) {
                    $query->where('instance_id', $instanceId);
                } else {
                    $query->whereNull('instance_id');
                }

                return $query->get()->keyBy('key');
            }
        );

        // ✅ OTIMIZADO: Cache lista de instâncias
        $instances = cache()->remember(
            'whatsapp_instances_list',
            300,
            fn() => WhatsAppInstance::select('id', 'name', 'phone', 'status', 'instance_key')->get()
        );

        // Buscar quick replies se for a tab de respostas rápidas
        $quickReplies = null;
        if ($instanceId) {
            $quickReplies = \App\Models\QuickReply::forInstance($instanceId)
                ->orderBy('shortcut', 'asc')
                ->paginate(15);
        }

        // ✅ OTIMIZADO: Usar cache de members
        $members = cache()->remember(
            'members_list_with_stats',
            120,
            function() {
                return Member::select('members.*')
                    ->with([
                        'user:id,name,email,avatar',
                        'department:id,name,color',
                        'instance:id,name,phone'
                    ])
                    ->withCount('activeConversations')
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function ($member) {
                        return [
                            'id' => $member->id,
                            'user' => $member->user,
                            'department' => $member->department,
                            'instance' => $member->instance,
                            'is_active' => $member->is_active,
                            'max_concurrent_chats' => $member->max_concurrent_chats,
                            'active_conversations_count' => $member->active_conversations_count,
                            'available_slots' => $member->available_slots,
                            'created_at' => $member->created_at,
                        ];
                    });
            }
        );

        // ✅ OTIMIZADO: Cache users e departments
        $users = cache()->remember(
            'users_for_members',
            300,
            fn() => User::orderBy('name')->get(['id', 'name', 'email', 'avatar'])
        );

        $departments = cache()->remember(
            'active_departments',
            300,
            fn() => Department::active()->orderBy('name')->get(['id', 'name', 'color'])
        );

        // Buscar tags e departments com counts
        $userId = $request->user()->id;

        $tags = cache()->remember(
            "user_{$userId}_tags_with_counts",
            300,
            fn() => Tag::where('user_id', $userId)
                ->withCount(['conversations', 'contacts'])
                ->orderBy('name')
                ->get()
        );

        $allDepartments = cache()->remember(
            'departments_with_counts',
            300,
            fn() => Department::withCount(['members', 'conversations'])
                ->orderBy('name')
                ->get()
        );

        // ✅ OTIMIZADO: Cache todos os usuários para gerenciamento
        $allUsers = cache()->remember(
            'all_users_for_management',
            300,
            fn() => User::select(['id', 'name', 'email', 'role', 'is_active', 'avatar', 'created_at'])
                ->orderBy('name')
                ->get()
        );

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'instances' => $instances,
            'currentInstanceId' => $instanceId,
            'quickReplies' => $quickReplies,
            'members' => $members,
            'users' => $users,
            'departments' => $departments,
            'tags' => $tags,
            'allDepartments' => $allDepartments,
            'allUsers' => $allUsers,
        ]);
    }

    /**
     * Get all settings
     */
    public function getAll(Request $request)
    {
        $instanceId = $request->input('instance_id');

        // ✅ OTIMIZADO: Cache settings
        $settings = cache()->remember(
            "settings_instance_{$instanceId}",
            300,
            function() use ($instanceId) {
                $query = Setting::query();

                if ($instanceId) {
                    $query->where('instance_id', $instanceId);
                } else {
                    $query->whereNull('instance_id');
                }

                return $query->get()->keyBy('key');
            }
        );

        return response()->json([
            'settings' => $settings,
        ]);
    }

    /**
     * Get a specific setting
     */
    public function get(Request $request, string $key)
    {
        $instanceId = $request->input('instance_id');

        // ✅ OTIMIZADO: Cache setting individual
        $setting = cache()->remember(
            "setting_{$key}_instance_{$instanceId}",
            300,
            fn() => Setting::get($key, $instanceId)
        );

        return response()->json([
            'value' => $setting,
        ]);
    }

    /**
     * Update settings in bulk
     */
    public function updateBulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|max:255',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'required|in:string,number,boolean,json',
        ]);

        $instanceId = $validated['instance_id'] ?? null;

        foreach ($validated['settings'] as $settingData) {
            Setting::set(
                $settingData['key'],
                $settingData['value'],
                $instanceId,
                $settingData['type']
            );
        }

        return redirect()->back()->with('success', 'Configurações atualizadas com sucesso!');
    }

    /**
     * Update a single setting
     */
    public function update(Request $request, string $key)
    {
        $validated = $request->validate([
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
            'value' => 'nullable',
            'type' => 'required|in:string,number,boolean,json',
        ]);

        $setting = Setting::set(
            $key,
            $validated['value'],
            $validated['instance_id'] ?? null,
            $validated['type']
        );

        return response()->json([
            'message' => 'Configuração atualizada com sucesso!',
            'setting' => $setting,
        ]);
    }

    /**
     * Delete a setting
     */
    public function destroy(Request $request, string $key)
    {
        $instanceId = $request->input('instance_id');

        $query = Setting::where('key', $key);

        if ($instanceId) {
            $query->where('instance_id', $instanceId);
        } else {
            $query->whereNull('instance_id');
        }

        $setting = $query->first();

        if (!$setting) {
            return response()->json([
                'message' => 'Configuração não encontrada.',
            ], 404);
        }

        $setting->delete();

        return response()->json([
            'message' => 'Configuração removida com sucesso!',
        ]);
    }

    /**
     * Reset settings to default
     */
    public function reset(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
        ]);

        $instanceId = $validated['instance_id'] ?? null;

        // Remove todas as configurações da instância ou globais
        $query = Setting::query();

        if ($instanceId) {
            $query->where('instance_id', $instanceId);
        } else {
            $query->whereNull('instance_id');
        }

        $query->delete();

        // Recriar configurações padrão
        $this->seedDefaultSettings($instanceId);

        return redirect()->back()->with('success', 'Configurações resetadas para o padrão!');
    }

    /**
     * Seed default settings
     */
    private function seedDefaultSettings(?string $instanceId = null)
    {
        $defaults = [
            // Geral
            ['key' => 'company_name', 'value' => 'WhatizeBr', 'type' => 'string'],
            ['key' => 'company_logo', 'value' => null, 'type' => 'string'],
            ['key' => 'timezone', 'value' => 'America/Sao_Paulo', 'type' => 'string'],

            // Horário Comercial
            ['key' => 'business_hours_enabled', 'value' => false, 'type' => 'boolean'],
            ['key' => 'business_hours', 'value' => [
                'monday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                'tuesday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                'wednesday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                'thursday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                'friday' => ['start' => '09:00', 'end' => '18:00', 'enabled' => true],
                'saturday' => ['start' => '09:00', 'end' => '13:00', 'enabled' => false],
                'sunday' => ['start' => '09:00', 'end' => '13:00', 'enabled' => false],
            ], 'type' => 'json'],

            // Mensagens
            ['key' => 'welcome_message', 'value' => 'Olá! Bem-vindo ao nosso atendimento.', 'type' => 'string'],
            ['key' => 'away_message', 'value' => 'No momento estamos fora do horário de atendimento. Retornaremos em breve.', 'type' => 'string'],

            // Atendimento
            ['key' => 'auto_assign_enabled', 'value' => true, 'type' => 'boolean'],
            ['key' => 'max_concurrent_chats', 'value' => 5, 'type' => 'number'],

            // Webhooks
            ['key' => 'webhook_url', 'value' => null, 'type' => 'string'],
            ['key' => 'webhook_events', 'value' => ['message.received', 'message.sent', 'message.read'], 'type' => 'json'],
        ];

        foreach ($defaults as $default) {
            Setting::set(
                $default['key'],
                $default['value'],
                $instanceId,
                $default['type']
            );
        }
    }
}
