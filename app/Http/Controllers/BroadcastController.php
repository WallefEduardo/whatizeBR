<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessBroadcast;
use App\Models\Broadcast;
use App\Models\Tag;
use App\Models\Department;
use App\Services\BroadcastService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BroadcastController extends Controller
{
    protected BroadcastService $broadcastService;

    public function __construct(BroadcastService $broadcastService)
    {
        $this->broadcastService = $broadcastService;
    }

    public function index(Request $request)
    {
        $query = Broadcast::with(['user', 'instance'])
            ->where('instance_id', $request->user()->instance_id ?? Str::uuid()->toString());

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by message type
        if ($request->has('message_type') && $request->message_type !== 'all') {
            $query->where('message_type', $request->message_type);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'ILIKE', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $broadcasts = $query->paginate(15)->withQueryString();

        return Inertia::render('Broadcasts/Index', [
            'broadcasts' => $broadcasts,
            'filters' => [
                'status' => $request->input('status', 'all'),
                'message_type' => $request->input('message_type', 'all'),
                'search' => $request->input('search', ''),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function create()
    {
        $tags = Tag::all();
        $departments = Department::where('is_active', true)->get();

        return Inertia::render('Broadcasts/Create', [
            'tags' => $tags,
            'departments' => $departments,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'nullable|array',
            'filters.tags' => 'nullable|array',
            'filters.departments' => 'nullable|array',
            'filters.exclude_blocked' => 'nullable|boolean',
            'message_type' => 'required|in:text,image,video,document',
            'message_content' => 'nullable|string',
            'media_url' => 'nullable|url|max:500',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        // Validate filters structure
        if (isset($validated['filters']) && !$this->broadcastService->validateFilters($validated['filters'])) {
            return back()->withErrors(['filters' => 'Invalid filter structure']);
        }

        // Get instance_id (you'll need to implement proper instance selection)
        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        // Get recipient count
        $recipientCount = $this->broadcastService->getRecipientCount(
            $instanceId,
            $validated['filters'] ?? null
        );

        if ($recipientCount === 0) {
            return back()->withErrors(['filters' => 'No recipients match the selected filters']);
        }

        // Determine initial status
        $status = isset($validated['scheduled_at']) ? 'scheduled' : 'draft';

        // Create broadcast
        $broadcast = Broadcast::create([
            'instance_id' => $instanceId,
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'filters' => $validated['filters'] ?? null,
            'message_type' => $validated['message_type'],
            'message_content' => $validated['message_content'] ?? null,
            'media_url' => $validated['media_url'] ?? null,
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => $status,
            'total_recipients' => $recipientCount,
        ]);

        return redirect()->route('broadcasts.index')
            ->with('success', 'Broadcast criado com sucesso!');
    }

    public function show(Broadcast $broadcast)
    {
        $broadcast->load(['user', 'instance', 'messages.contact']);

        return Inertia::render('Broadcasts/Show', [
            'broadcast' => $broadcast,
        ]);
    }

    public function edit(Broadcast $broadcast)
    {
        // Only allow editing drafts
        if (!$broadcast->isPending()) {
            return back()->withErrors(['error' => 'Only draft or scheduled broadcasts can be edited']);
        }

        $tags = Tag::all();
        $departments = Department::where('is_active', true)->get();

        return Inertia::render('Broadcasts/Edit', [
            'broadcast' => $broadcast,
            'tags' => $tags,
            'departments' => $departments,
        ]);
    }

    public function update(Request $request, Broadcast $broadcast)
    {
        // Only allow updating drafts
        if (!$broadcast->isPending()) {
            return back()->withErrors(['error' => 'Only draft or scheduled broadcasts can be updated']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'nullable|array',
            'filters.tags' => 'nullable|array',
            'filters.departments' => 'nullable|array',
            'filters.exclude_blocked' => 'nullable|boolean',
            'message_type' => 'required|in:text,image,video,document',
            'message_content' => 'nullable|string',
            'media_url' => 'nullable|url|max:500',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        // Validate filters structure
        if (isset($validated['filters']) && !$this->broadcastService->validateFilters($validated['filters'])) {
            return back()->withErrors(['filters' => 'Invalid filter structure']);
        }

        // Get recipient count
        $recipientCount = $this->broadcastService->getRecipientCount(
            $broadcast->instance_id,
            $validated['filters'] ?? null
        );

        if ($recipientCount === 0) {
            return back()->withErrors(['filters' => 'No recipients match the selected filters']);
        }

        // Determine status
        $status = isset($validated['scheduled_at']) ? 'scheduled' : 'draft';

        $broadcast->update([
            'name' => $validated['name'],
            'filters' => $validated['filters'] ?? null,
            'message_type' => $validated['message_type'],
            'message_content' => $validated['message_content'] ?? null,
            'media_url' => $validated['media_url'] ?? null,
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'status' => $status,
            'total_recipients' => $recipientCount,
        ]);

        return redirect()->route('broadcasts.index')
            ->with('success', 'Broadcast atualizado com sucesso!');
    }

    public function destroy(Broadcast $broadcast)
    {
        // Only allow deleting drafts or cancelled broadcasts
        if (!in_array($broadcast->status, ['draft', 'cancelled', 'completed'])) {
            return back()->withErrors(['error' => 'Cannot delete active or processing broadcasts']);
        }

        $broadcast->delete();

        return redirect()->route('broadcasts.index')
            ->with('success', 'Broadcast excluído com sucesso!');
    }

    public function send(Broadcast $broadcast)
    {
        // Only allow sending drafts
        if ($broadcast->status !== 'draft') {
            return back()->withErrors(['error' => 'Only draft broadcasts can be sent']);
        }

        // Update status to processing
        $broadcast->markAsProcessing();

        // Dispatch job to process broadcast
        ProcessBroadcast::dispatch($broadcast);

        return back()->with('success', 'Broadcast iniciado com sucesso!');
    }

    public function cancel(Broadcast $broadcast)
    {
        try {
            $broadcast->cancel();

            return back()->with('success', 'Broadcast cancelado com sucesso!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function preview(Request $request)
    {
        $validated = $request->validate([
            'filters' => 'nullable|array',
            'filters.tags' => 'nullable|array',
            'filters.departments' => 'nullable|array',
            'filters.exclude_blocked' => 'nullable|boolean',
        ]);

        $instanceId = $request->user()->instance_id ?? Str::uuid()->toString();

        $recipientCount = $this->broadcastService->getRecipientCount(
            $instanceId,
            $validated['filters'] ?? null
        );

        return response()->json([
            'recipient_count' => $recipientCount,
        ]);
    }
}
