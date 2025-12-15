<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Suporte',
                'description' => 'Departamento responsável pelo suporte técnico aos clientes',
                'color' => '#3b82f6',
                'is_active' => true,
            ],
            [
                'name' => 'Vendas',
                'description' => 'Departamento de vendas e prospecção de novos clientes',
                'color' => '#22c55e',
                'is_active' => true,
            ],
            [
                'name' => 'Financeiro',
                'description' => 'Departamento financeiro, cobranças e pagamentos',
                'color' => '#f59e0b',
                'is_active' => true,
            ],
            [
                'name' => 'SAC',
                'description' => 'Serviço de Atendimento ao Cliente',
                'color' => '#8b5cf6',
                'is_active' => true,
            ],
            [
                'name' => 'Comercial',
                'description' => 'Departamento comercial e parcerias',
                'color' => '#10b981',
                'is_active' => true,
            ],
        ];

        foreach ($departments as $department) {
            Department::create($department);
        }
    }
}
