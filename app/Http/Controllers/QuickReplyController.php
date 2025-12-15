<?php

namespace App\Http\Controllers;

use App\Models\QuickReply;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class QuickReplyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $query = QuickReply::forInstance($instanceId)
            ->orderBy('shortcut', 'asc');

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $query->search($request->search);
        }

        $quickReplies = $query->paginate(15);

        return Inertia::render('QuickReplies/Index', [
            'quickReplies' => $quickReplies,
            'filters' => [
                'search' => $request->search,
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shortcut' => 'required|string|max:50',
            'message' => 'required|string',
            'media_url' => 'nullable|string|max:500',
            'media_type' => 'nullable|string|in:image,video,audio,document',
        ]);

        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        // Check if shortcut already exists for this instance
        $exists = QuickReply::forInstance($instanceId)
            ->where('shortcut', $validated['shortcut'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'shortcut' => 'Este atalho já está em uso.',
            ]);
        }

        $quickReply = QuickReply::create([
            'instance_id' => $instanceId,
            'shortcut' => $validated['shortcut'],
            'message' => $validated['message'],
            'media_url' => $validated['media_url'] ?? null,
            'media_type' => $validated['media_type'] ?? null,
        ]);

        return back()->with('success', 'Resposta rápida criada com sucesso!');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $quickReply = QuickReply::findOrFail($id);

        $validated = $request->validate([
            'shortcut' => 'required|string|max:50',
            'message' => 'required|string',
            'media_url' => 'nullable|string|max:500',
            'media_type' => 'nullable|string|in:image,video,audio,document',
        ]);

        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        // Check if shortcut already exists for this instance (excluding current)
        $exists = QuickReply::forInstance($instanceId)
            ->where('shortcut', $validated['shortcut'])
            ->where('id', '!=', $id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'shortcut' => 'Este atalho já está em uso.',
            ]);
        }

        $quickReply->update([
            'shortcut' => $validated['shortcut'],
            'message' => $validated['message'],
            'media_url' => $validated['media_url'] ?? null,
            'media_type' => $validated['media_type'] ?? null,
        ]);

        return back()->with('success', 'Resposta rápida atualizada com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $quickReply = QuickReply::findOrFail($id);
        $quickReply->delete();

        return back()->with('success', 'Resposta rápida deletada com sucesso!');
    }

    /**
     * Search quick replies by shortcut (for autocomplete).
     */
    public function search(Request $request)
    {
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();
        $search = $request->get('q', '');

        $quickReplies = QuickReply::forInstance($instanceId)
            ->where('shortcut', 'like', "{$search}%")
            ->orderBy('shortcut', 'asc')
            ->limit(10)
            ->get(['id', 'shortcut', 'message', 'media_url', 'media_type']);

        return response()->json($quickReplies);
    }
}
