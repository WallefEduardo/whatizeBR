<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Department;
use App\Models\Tag;
use App\Models\User;
use App\Models\WhatsAppInstance;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ConversationController extends Controller
{
    /**
     * Display a listing of conversations with pagination and filters
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // ✅ OTIMIZADO: Cache instanceIds
        $instanceIds = cache()->remember(
            "user_{$user->id}_instances",
            300,
            fn() => WhatsAppInstance::where('user_id', $user->id)->pluck('id')
        );

        // ✅ OTIMIZADO: Eager loading apenas campos necessários
        $query = Conversation::select('conversations.*')
            ->with([
                'contact:id,name,phone,avatar,instance_id',
                'assignedUser:id,name,email,avatar',
                'department:id,name,color',
                'tags:id,name,color',
                'lastMessage:id,conversation_id,content,type,created_at,status',
            ])
            ->whereIn('instance_id', $instanceIds)
            ->latestMessages();

        // Apply status filter
        if ($request->filled('status')) {
            $query->status($request->status);
        }

        // Apply assigned user filter
        if ($request->filled('assigned_to')) {
            if ($request->assigned_to === 'unassigned') {
                $query->unassigned();
            } elseif ($request->assigned_to === 'me') {
                $query->assignedTo($user->id);
            } else {
                $query->assignedTo($request->assigned_to);
            }
        }

        // Apply department filter
        if ($request->filled('department_id')) {
            $query->department($request->department_id);
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

        // Apply unread filter
        if ($request->boolean('unread_only')) {
            $query->withUnread();
        }

        // Apply search filter
        if ($request->filled('search')) {
            $query->searchContact($request->search);
        }

        // ✅ OTIMIZADO: Cursor pagination para melhor performance
        $conversations = $query->cursorPaginate(50)->withQueryString();

        // ✅ OTIMIZADO: Cache filter options
        $departments = cache()->remember(
            "user_{$user->id}_departments",
            300,
            fn() => Department::where('user_id', $user->id)
                ->orderBy('name')
                ->get(['id', 'name', 'color'])
        );

        $tags = cache()->remember(
            "user_{$user->id}_tags",
            300,
            fn() => Tag::where('user_id', $user->id)
                ->orderBy('name')
                ->get(['id', 'name', 'color'])
        );

        $instances = cache()->remember(
            "user_{$user->id}_instances_list",
            300,
            fn() => WhatsAppInstance::where('user_id', $user->id)
                ->orderBy('name')
                ->get(['id', 'name'])
        );

        $teamMembers = cache()->remember(
            "user_{$user->id}_team_members",
            300,
            fn() => User::where('id', '!=', $user->id)
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'avatar'])
        );

        // ✅ OTIMIZADO: Cache stats com chave incluindo filtros
        $filterKey = md5(json_encode($request->only(['status', 'assigned_to', 'department_id'])));
        $stats = cache()->remember(
            "conversation_stats_{$user->id}_{$filterKey}",
            60, // 1 minuto para stats
            fn() => $this->getConversationStats($instanceIds)
        );

        return Inertia::render('Conversations/Index', [
            'conversations' => $conversations,
            'departments' => $departments,
            'tags' => $tags,
            'instances' => $instances,
            'teamMembers' => $teamMembers,
            'stats' => $stats,
            'filters' => $request->only([
                'status',
                'assigned_to',
                'department_id',
                'tags',
                'instance_id',
                'unread_only',
                'search',
            ]),
        ]);
    }

    /**
     * Display the specified conversation
     */
    public function show(string $id): Response
    {
        $user = Auth::user();

        // ✅ OTIMIZADO: Cache instanceIds
        $instanceIds = cache()->remember(
            "user_{$user->id}_instances",
            300,
            fn() => WhatsAppInstance::where('user_id', $user->id)->pluck('id')
        );

        // ✅ OTIMIZADO: Eager loading apenas campos necessários
        $conversation = Conversation::select('conversations.*')
            ->with([
                'contact:id,name,phone,avatar,instance_id,email',
                'instance:id,name,phone,status',
                'assignedUser:id,name,email,avatar',
                'department:id,name,color',
                'tags:id,name,color',
                'messages' => function ($query) {
                    $query->select('id', 'conversation_id', 'content', 'type', 'direction', 'status', 'created_at', 'from_phone', 'to_phone')
                        ->orderBy('created_at', 'asc')
                        ->limit(100);
                },
            ])
            ->whereIn('instance_id', $instanceIds)
            ->findOrFail($id);

        // Mark as read
        if ($conversation->unread_count > 0) {
            $conversation->markAsRead();
        }

        return Inertia::render('Conversations/Show', [
            'conversation' => $conversation,
        ]);
    }

    /**
     * Assign conversation to a user
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $conversation = Conversation::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $validated = $request->validate([
            'user_id' => [
                'nullable',
                'uuid',
                Rule::exists('users', 'id'),
            ],
        ]);

        $conversation->assignTo($validated['user_id'] ?? null);
        $conversation->load('assignedUser');

        return response()->json([
            'success' => true,
            'message' => $validated['user_id']
                ? 'Conversa atribuída com sucesso.'
                : 'Atribuição removida com sucesso.',
            'data' => $conversation,
        ]);
    }

    /**
     * Update conversation status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $conversation = Conversation::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'pending', 'closed'])],
        ]);

        if ($validated['status'] === 'closed') {
            $conversation->close();
        } elseif ($conversation->status === 'closed') {
            $conversation->reopen();
            $conversation->update(['status' => $validated['status']]);
        } else {
            $conversation->update(['status' => $validated['status']]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Status da conversa atualizado com sucesso.',
            'data' => $conversation,
        ]);
    }

    /**
     * Update conversation department
     */
    public function updateDepartment(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $conversation = Conversation::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $validated = $request->validate([
            'department_id' => [
                'nullable',
                'uuid',
                Rule::exists('departments', 'id')->where('user_id', $user->id),
            ],
        ]);

        $conversation->update(['department_id' => $validated['department_id']]);
        $conversation->load('department');

        return response()->json([
            'success' => true,
            'message' => 'Departamento atualizado com sucesso.',
            'data' => $conversation,
        ]);
    }

    /**
     * Add tags to conversation
     */
    public function addTags(Request $request, string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $conversation = Conversation::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $validated = $request->validate([
            'tag_ids' => ['required', 'array', 'min:1'],
            'tag_ids.*' => [
                'uuid',
                Rule::exists('tags', 'id')->where('user_id', $user->id),
            ],
        ]);

        $conversation->tags()->syncWithoutDetaching($validated['tag_ids']);
        $conversation->load('tags');

        return response()->json([
            'success' => true,
            'message' => 'Tags adicionadas com sucesso.',
            'data' => $conversation,
        ]);
    }

    /**
     * Remove tag from conversation
     */
    public function removeTag(string $id, string $tagId): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $conversation = Conversation::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $conversation->tags()->detach($tagId);
        $conversation->load('tags');

        return response()->json([
            'success' => true,
            'message' => 'Tag removida com sucesso.',
            'data' => $conversation,
        ]);
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(string $id): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $conversation = Conversation::whereIn('instance_id', $instanceIds)->findOrFail($id);

        $conversation->markAsRead();

        return response()->json([
            'success' => true,
            'message' => 'Conversa marcada como lida.',
            'data' => $conversation,
        ]);
    }

    /**
     * Get conversation statistics
     */
    public function stats(): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $stats = $this->getConversationStats($instanceIds);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get unread count for current user
     */
    public function unreadCount(): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $unreadCount = Conversation::whereIn('instance_id', $instanceIds)
            ->where('unread_count', '>', 0)
            ->sum('unread_count');

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount,
            ],
        ]);
    }

    /**
     * Helper method to get conversation stats
     */
    protected function getConversationStats($instanceIds): array
    {
        $baseQuery = Conversation::whereIn('instance_id', $instanceIds);

        return [
            'total' => (clone $baseQuery)->count(),
            'open' => (clone $baseQuery)->where('status', 'open')->count(),
            'pending' => (clone $baseQuery)->where('status', 'pending')->count(),
            'closed' => (clone $baseQuery)->where('status', 'closed')->count(),
            'unread' => (clone $baseQuery)->where('unread_count', '>', 0)->count(),
            'assigned_to_me' => (clone $baseQuery)->where('assigned_to', Auth::id())->count(),
            'unassigned' => (clone $baseQuery)->whereNull('assigned_to')->count(),
        ];
    }

    /**
     * Bulk update conversations
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $user = Auth::user();
        $instanceIds = WhatsAppInstance::where('user_id', $user->id)->pluck('id');

        $validated = $request->validate([
            'conversation_ids' => ['required', 'array', 'min:1'],
            'conversation_ids.*' => ['uuid'],
            'action' => ['required', Rule::in(['assign', 'status', 'department', 'add_tags'])],
            'user_id' => ['nullable', 'uuid', 'required_if:action,assign'],
            'status' => ['nullable', 'required_if:action,status', Rule::in(['open', 'pending', 'closed'])],
            'department_id' => ['nullable', 'uuid', 'required_if:action,department'],
            'tag_ids' => ['nullable', 'array', 'required_if:action,add_tags'],
        ]);

        $conversations = Conversation::whereIn('instance_id', $instanceIds)
            ->whereIn('id', $validated['conversation_ids'])
            ->get();

        $count = 0;

        foreach ($conversations as $conversation) {
            switch ($validated['action']) {
                case 'assign':
                    $conversation->assignTo($validated['user_id'] ?? null);
                    $count++;
                    break;

                case 'status':
                    if ($validated['status'] === 'closed') {
                        $conversation->close();
                    } else {
                        $conversation->update(['status' => $validated['status']]);
                    }
                    $count++;
                    break;

                case 'department':
                    $conversation->update(['department_id' => $validated['department_id'] ?? null]);
                    $count++;
                    break;

                case 'add_tags':
                    $conversation->tags()->syncWithoutDetaching($validated['tag_ids']);
                    $count++;
                    break;
            }
        }

        return response()->json([
            'success' => true,
            'message' => "{$count} conversa(s) atualizada(s) com sucesso.",
        ]);
    }
}
