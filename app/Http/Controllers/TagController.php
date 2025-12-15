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
        $tags = Tag::where('user_id', $request->user()->id)
            ->withCount(['conversations', 'contacts'])
            ->orderBy('name')
            ->get();

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

        return redirect()->back()->with('success', 'Tag criada com sucesso!');
    }

    /**
     * Display the specified tag
     */
    public function show(Tag $tag)
    {
        $tag->load(['conversations', 'contacts']);

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

        return redirect()->back()->with('success', 'Tag atualizada com sucesso!');
    }

    /**
     * Remove the specified tag
     */
    public function destroy(Tag $tag)
    {
        $tag->delete();

        return redirect()->back()->with('success', 'Tag excluída com sucesso!');
    }
}
