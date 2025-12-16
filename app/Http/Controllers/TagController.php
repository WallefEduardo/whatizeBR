<?php

namespace App\Http\Controllers;

use App\Models\Tag;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TagController extends Controller
{
    /**
     * Display a listing of tags
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // ✅ OTIMIZADO: Cache tags com counts
        $tags = cache()->remember(
            "user_{$userId}_tags_with_counts",
            300, // 5 minutos
            fn() => Tag::where('user_id', $userId)
                ->withCount(['conversations', 'contacts'])
                ->orderBy('name')
                ->get()
        );

        return Inertia::render('Tags/Index', [
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created tag
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
            'instance_id' => 'nullable|exists:instances,id',
        ]);

        $validated['user_id'] = $request->user()->id;

        $tag = Tag::create($validated);

        // Invalidar cache
        cache()->forget("user_{$request->user()->id}_tags_with_counts");
        cache()->forget("user_{$request->user()->id}_tags");

        return redirect()->back()->with('success', 'Tag criada com sucesso!');
    }

    /**
     * Display the specified tag
     */
    public function show(Tag $tag)
    {
        // ✅ OTIMIZADO: Eager loading apenas campos necessários com paginação
        $tag->load([
            'conversations' => function($query) {
                $query->select('conversations.id', 'conversations.contact_id', 'conversations.status', 'conversations.last_message_at')
                    ->with('contact:id,name,phone,avatar')
                    ->latest('last_message_at')
                    ->limit(50);
            },
            'contacts' => function($query) {
                $query->select('contacts.id', 'contacts.name', 'contacts.phone', 'contacts.avatar')
                    ->limit(50);
            }
        ]);

        return Inertia::render('Tags/Show', [
            'tag' => $tag,
        ]);
    }

    /**
     * Update the specified tag
     */
    public function update(Request $request, Tag $tag)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
        ]);

        $tag->update($validated);

        // Invalidar cache
        cache()->forget("user_{$request->user()->id}_tags_with_counts");
        cache()->forget("user_{$request->user()->id}_tags");

        return redirect()->back()->with('success', 'Tag atualizada com sucesso!');
    }

    /**
     * Remove the specified tag
     */
    public function destroy(Request $request, Tag $tag)
    {
        $tag->delete();

        // Invalidar cache
        cache()->forget("user_{$request->user()->id}_tags_with_counts");
        cache()->forget("user_{$request->user()->id}_tags");

        return redirect()->back()->with('success', 'Tag excluída com sucesso!');
    }
}
