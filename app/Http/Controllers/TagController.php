<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TagController extends Controller
{
    /**
     * Display a listing of tags
     */
    public function index(): JsonResponse
    {
        $tags = Tag::where('user_id', Auth::id())
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tags,
        ]);
    }

    /**
     * Store a newly created tag
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        $validated['user_id'] = Auth::id();

        // Check if tag already exists for this user
        $existing = Tag::where('user_id', $validated['user_id'])
            ->where('name', $validated['name'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Uma tag com este nome já existe.',
            ], 422);
        }

        $tag = Tag::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tag criada com sucesso.',
            'data' => $tag,
        ], 201);
    }

    /**
     * Update the specified tag
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $tag = Tag::where('user_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        // Check if another tag with this name exists
        $existing = Tag::where('user_id', Auth::id())
            ->where('name', $validated['name'])
            ->where('id', '!=', $id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Uma tag com este nome já existe.',
            ], 422);
        }

        $tag->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tag atualizada com sucesso.',
            'data' => $tag,
        ]);
    }

    /**
     * Remove the specified tag
     */
    public function destroy(string $id): JsonResponse
    {
        $tag = Tag::where('user_id', Auth::id())->findOrFail($id);

        $tag->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tag deletada com sucesso.',
        ]);
    }
}
