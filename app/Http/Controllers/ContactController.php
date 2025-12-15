<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Tag;
use App\Models\WhatsAppInstance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    /**
     * Display a listing of contacts
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // Get all user's instances IDs
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        // Build query
        $query = Contact::with(['instance', 'tags'])
            ->whereIn('instance_id', $instanceIds)
            ->orderBy('last_interaction_at', 'desc')
            ->orderBy('created_at', 'desc');

        // Apply search filter
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Apply blocked filter
        if ($request->filled('blocked')) {
            $query->blocked($request->boolean('blocked'));
        }

        // Apply tags filter
        if ($request->filled('tags')) {
            $tagIds = is_array($request->tags) ? $request->tags : explode(',', $request->tags);
            $query->withTags($tagIds);
        }

        // Apply instance filter
        if ($request->filled('instance_id')) {
            $query->forInstance($request->instance_id);
        }

        // Paginate results
        $contacts = $query->paginate(20)->withQueryString();

        // Get user's tags for filters
        $tags = Tag::where('user_id', $user->id)->orderBy('name')->get();

        // Get user's instances for filters
        $instances = WhatsAppInstance::where('user_id', $user->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Contacts/Index', [
            'contacts' => $contacts,
            'tags' => $tags,
            'instances' => $instances,
            'filters' => $request->only(['search', 'blocked', 'tags', 'instance_id']),
        ]);
    }

    /**
     * Show the form for creating a new contact
     */
    public function create(): Response
    {
        $user = Auth::user();

        $instances = WhatsAppInstance::where('user_id', $user->id)
            ->where('status', 'connected')
            ->orderBy('name')
            ->get(['id', 'name']);

        $tags = Tag::where('user_id', $user->id)->orderBy('name')->get();

        return Inertia::render('Contacts/Create', [
            'instances' => $instances,
            'tags' => $tags,
        ]);
    }

    /**
     * Store a newly created contact
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'instance_id' => [
                'required',
                'uuid',
                Rule::exists('whatsapp_instances', 'id')->where('user_id', $user->id),
            ],
            'phone' => ['required', 'string', 'max:20'],
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string'],
            'custom_fields' => ['nullable', 'array'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => [
                'uuid',
                Rule::exists('tags', 'id')->where('user_id', $user->id),
            ],
        ]);

        // Check if contact already exists for this instance
        $existing = Contact::where('instance_id', $validated['instance_id'])
            ->where('phone', $validated['phone'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Um contato com este telefone já existe para esta instância.',
            ], 422);
        }

        $tagIds = $validated['tag_ids'] ?? [];
        unset($validated['tag_ids']);

        $contact = Contact::create($validated);

        // Attach tags
        if (!empty($tagIds)) {
            $contact->tags()->attach($tagIds);
        }

        $contact->load(['instance', 'tags']);

        return response()->json([
            'success' => true,
            'message' => 'Contato criado com sucesso.',
            'data' => $contact,
        ], 201);
    }

    /**
     * Display the specified contact
     */
    public function show(string $id): Response
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $contact = Contact::with(['instance', 'tags', 'messages' => function ($query) {
            $query->orderBy('created_at', 'desc')->limit(50);
        }])
            ->whereIn('instance_id', $instanceIds)
            ->findOrFail($id);

        return Inertia::render('Contacts/Show', [
            'contact' => $contact,
        ]);
    }

    /**
     * Show the form for editing the specified contact
     */
    public function edit(string $id): Response
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $contact = Contact::with(['instance', 'tags'])
            ->whereIn('instance_id', $instanceIds)
            ->findOrFail($id);

        $tags = Tag::where('user_id', $user->id)->orderBy('name')->get();

        return Inertia::render('Contacts/Edit', [
            'contact' => $contact,
            'tags' => $tags,
        ]);
    }

    /**
     * Update the specified contact
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $contact = Contact::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'avatar_url' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string'],
            'custom_fields' => ['nullable', 'array'],
            'is_blocked' => ['nullable', 'boolean'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => [
                'uuid',
                Rule::exists('tags', 'id')->where('user_id', $user->id),
            ],
        ]);

        $tagIds = $validated['tag_ids'] ?? null;
        unset($validated['tag_ids']);

        $contact->update($validated);

        // Sync tags
        if ($tagIds !== null) {
            $contact->tags()->sync($tagIds);
        }

        $contact->load(['instance', 'tags']);

        return response()->json([
            'success' => true,
            'message' => 'Contato atualizado com sucesso.',
            'data' => $contact,
        ]);
    }

    /**
     * Remove the specified contact
     */
    public function destroy(string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $contact = Contact::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Contato deletado com sucesso.',
        ]);
    }

    /**
     * Toggle blocked status of a contact
     */
    public function toggleBlock(string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $contact = Contact::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $contact->update([
            'is_blocked' => !$contact->is_blocked,
        ]);

        $contact->load(['instance', 'tags']);

        return response()->json([
            'success' => true,
            'message' => $contact->is_blocked ? 'Contato bloqueado.' : 'Contato desbloqueado.',
            'data' => $contact,
        ]);
    }

    /**
     * Bulk delete contacts
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['uuid'],
        ]);

        $count = Contact::whereIn('instance_id', $instanceIds)
            ->whereIn('id', $validated['ids'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => "{$count} contato(s) deletado(s) com sucesso.",
        ]);
    }

    /**
     * Bulk add tags to contacts
     */
    public function bulkAddTags(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $validated = $request->validate([
            'contact_ids' => ['required', 'array', 'min:1'],
            'contact_ids.*' => ['uuid'],
            'tag_ids' => ['required', 'array', 'min:1'],
            'tag_ids.*' => [
                'uuid',
                Rule::exists('tags', 'id')->where('user_id', $user->id),
            ],
        ]);

        $contacts = Contact::whereIn('instance_id', $instanceIds)
            ->whereIn('id', $validated['contact_ids'])
            ->get();

        foreach ($contacts as $contact) {
            $contact->tags()->syncWithoutDetaching($validated['tag_ids']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Tags adicionadas aos contatos com sucesso.',
        ]);
    }
}
