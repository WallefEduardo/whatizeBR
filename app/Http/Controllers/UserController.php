<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        $users = cache()->remember(
            "user_{$userId}_all_users",
            300,
            fn() => User::select(['id', 'name', 'email', 'role', 'is_active', 'avatar', 'created_at'])
                ->orderBy('name')
                ->get()
        );

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => 'required|in:admin,supervisor,agent',
            'is_active' => 'boolean',
            'avatar' => 'nullable|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        // Invalidar cache
        $this->clearUsersCache($request->user()->id);

        return redirect()->back()->with('success', 'Usuário criado com sucesso!');
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => 'required|in:admin,supervisor,agent',
            'is_active' => 'boolean',
            'avatar' => 'nullable|string|max:255',
        ]);

        // Only update password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Invalidar cache
        $this->clearUsersCache($request->user()->id);

        return redirect()->back()->with('success', 'Usuário atualizado com sucesso!');
    }

    /**
     * Toggle user active status
     */
    public function toggle(Request $request, User $user)
    {
        // Prevent deactivating yourself
        if ($user->id === $request->user()->id) {
            return redirect()->back()->withErrors(['error' => 'Você não pode desativar sua própria conta!']);
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        // Invalidar cache
        $this->clearUsersCache($request->user()->id);

        $status = $user->is_active ? 'ativado' : 'desativado';
        return redirect()->back()->with('success', "Usuário {$status} com sucesso!");
    }

    /**
     * Remove the specified user
     */
    public function destroy(Request $request, User $user)
    {
        // Prevent deleting yourself
        if ($user->id === $request->user()->id) {
            return redirect()->back()->withErrors(['error' => 'Você não pode deletar sua própria conta!']);
        }

        // Check if user has active conversations
        $activeConversationsCount = $user->assignedConversations()->whereIn('status', ['open', 'pending'])->count();
        if ($activeConversationsCount > 0) {
            return redirect()->back()->withErrors([
                'error' => "Não é possível deletar o usuário. Ele possui {$activeConversationsCount} conversas ativas."
            ]);
        }

        $user->delete();

        // Invalidar cache
        $this->clearUsersCache($request->user()->id);

        return redirect()->back()->with('success', 'Usuário excluído com sucesso!');
    }

    /**
     * Clear users cache
     */
    private function clearUsersCache(string $userId): void
    {
        cache()->forget("user_{$userId}_all_users");
        cache()->forget("all_users_for_management");
        cache()->forget("users_for_members");
        cache()->forget("members_list_with_stats");
    }
}
