<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles  Roles permitidas (admin, supervisor, agent)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        // Convert string roles to UserRole enums
        $allowedRoles = array_map(fn($role) => UserRole::from($role), $roles);

        // Check if user has any of the allowed roles
        $hasRole = false;
        foreach ($allowedRoles as $role) {
            if ($request->user()->hasRole($role)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            abort(403, 'Acesso negado. Você não tem permissão para acessar esta página.');
        }

        return $next($request);
    }
}
