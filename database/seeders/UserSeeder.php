<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Admin user
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@whatize.com',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Supervisor user
        User::create([
            'name' => 'Supervisor Teste',
            'email' => 'supervisor@whatize.com',
            'password' => Hash::make('password'),
            'role' => UserRole::SUPERVISOR,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Agent user
        User::create([
            'name' => 'Atendente Teste',
            'email' => 'agent@whatize.com',
            'password' => Hash::make('password'),
            'role' => UserRole::AGENT,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Additional agent users
        User::create([
            'name' => 'João Silva',
            'email' => 'joao@whatize.com',
            'password' => Hash::make('password'),
            'role' => UserRole::AGENT,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Maria Santos',
            'email' => 'maria@whatize.com',
            'password' => Hash::make('password'),
            'role' => UserRole::AGENT,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
