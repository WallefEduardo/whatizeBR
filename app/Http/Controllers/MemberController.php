<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\User;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemberController extends Controller
{
    /**
     * Display a listing of members
     */
    public function index()
    {
        $members = Member::with(['user', 'department', 'instance'])
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

        $users = User::orderBy('name')->get(['id', 'name', 'email']);
        $departments = Department::active()->orderBy('name')->get(['id', 'name', 'color']);

        return Inertia::render('Members/Index', [
            'members' => $members,
            'users' => $users,
            'departments' => $departments,
        ]);
    }

    /**
     * Store a newly created member
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'instance_id' => 'nullable|exists:whatsapp_instances,id',
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'boolean',
            'max_concurrent_chats' => 'required|integer|min:1|max:50',
        ]);

        // Check if member already exists for this user and instance
        $existing = Member::where('user_id', $validated['user_id'])
            ->where('instance_id', $validated['instance_id'])
            ->first();

        if ($existing) {
            return redirect()->back()->with('error', 'Este usuário já é membro desta instância.');
        }

        $member = Member::create($validated);

        return redirect()->back()->with('success', 'Membro adicionado com sucesso!');
    }

    /**
     * Display the specified member
     */
    public function show(Member $member)
    {
        $member->load(['user', 'department', 'instance', 'conversations']);

        return Inertia::render('Members/Show', [
            'member' => $member,
        ]);
    }

    /**
     * Update the specified member
     */
    public function update(Request $request, Member $member)
    {
        $validated = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'is_active' => 'boolean',
            'max_concurrent_chats' => 'required|integer|min:1|max:50',
        ]);

        $member->update($validated);

        return redirect()->back()->with('success', 'Membro atualizado com sucesso!');
    }

    /**
     * Remove the specified member
     */
    public function destroy(Member $member)
    {
        // Check if member has active conversations
        if ($member->activeConversations()->count() > 0) {
            return redirect()->back()->with('error', 'Não é possível remover um membro com conversas ativas.');
        }

        $member->delete();

        return redirect()->back()->with('success', 'Membro removido com sucesso!');
    }

    /**
     * Toggle member active status
     */
    public function toggle(Member $member)
    {
        $member->update([
            'is_active' => !$member->is_active,
        ]);

        $status = $member->is_active ? 'ativado' : 'desativado';

        return redirect()->back()->with('success', "Membro {$status} com sucesso!");
    }

    /**
     * Get member statistics
     */
    public function stats(Member $member)
    {
        $stats = [
            'total_conversations' => $member->conversations()->count(),
            'active_conversations' => $member->activeConversations()->count(),
            'closed_conversations' => $member->conversations()->where('status', 'closed')->count(),
            'available_slots' => $member->available_slots,
            'utilization_rate' => $member->max_concurrent_chats > 0
                ? round(($member->active_conversations_count / $member->max_concurrent_chats) * 100, 2)
                : 0,
        ];

        return response()->json($stats);
    }
}
