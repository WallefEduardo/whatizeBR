<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case SUPERVISOR = 'supervisor';
    case AGENT = 'agent';

    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Administrador',
            self::SUPERVISOR => 'Supervisor',
            self::AGENT => 'Atendente',
        };
    }

    public function permissions(): array
    {
        return match($this) {
            self::ADMIN => [
                'manage_users',
                'manage_instances',
                'manage_departments',
                'manage_tags',
                'manage_settings',
                'view_reports',
                'manage_chatbots',
                'manage_broadcasts',
                'manage_contacts',
                'chat',
            ],
            self::SUPERVISOR => [
                'manage_departments',
                'manage_tags',
                'view_reports',
                'manage_chatbots',
                'manage_broadcasts',
                'manage_contacts',
                'chat',
            ],
            self::AGENT => [
                'manage_contacts',
                'chat',
            ],
        };
    }

    public function can(string $permission): bool
    {
        return in_array($permission, $this->permissions());
    }
}
