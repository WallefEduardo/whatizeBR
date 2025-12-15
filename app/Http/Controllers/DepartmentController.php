<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments
     */
    public function index()
    {
        $departments = Department::withCount(['conversations', 'members'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created department
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        $department = Department::create($validated);

        return redirect()->back()->with('success', 'Departamento criado com sucesso!');
    }

    /**
     * Display the specified department
     */
    public function show(Department $department)
    {
        $department->load(['conversations', 'members']);

        return Inertia::render('Departments/Show', [
            'department' => $department,
        ]);
    }

    /**
     * Update the specified department
     */
    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'is_active' => 'boolean',
        ]);

        $department->update($validated);

        return redirect()->back()->with('success', 'Departamento atualizado com sucesso!');
    }

    /**
     * Remove the specified department (soft delete)
     */
    public function destroy(Department $department)
    {
        // Verificar se há conversas ativas
        if ($department->conversations()->whereIn('status', ['open', 'pending'])->count() > 0) {
            return redirect()->back()->with('error', 'Não é possível excluir um departamento com conversas ativas.');
        }

        $department->delete();

        return redirect()->back()->with('success', 'Departamento excluído com sucesso!');
    }

    /**
     * Toggle department active status
     */
    public function toggle(Department $department)
    {
        $department->update([
            'is_active' => !$department->is_active,
        ]);

        $status = $department->is_active ? 'ativado' : 'desativado';

        return redirect()->back()->with('success', "Departamento {$status} com sucesso!");
    }
}
