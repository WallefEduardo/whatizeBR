<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Busca global em todos os recursos
     */
    public function global(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2|max:255',
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
            'types' => 'nullable|array',
            'types.*' => 'in:messages,contacts,conversations',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $validated['query'];
        $instanceId = $validated['instance_id'] ?? null;
        $types = $validated['types'] ?? ['messages', 'contacts', 'conversations'];
        $limit = $validated['limit'] ?? 20;

        $results = [
            'query' => $query,
            'results' => [],
            'total' => 0,
        ];

        // Buscar mensagens
        if (in_array('messages', $types)) {
            $messages = $this->searchMessages($query, $instanceId, $limit);
            $results['results']['messages'] = $messages['data'];
            $results['total'] += $messages['total'];
        }

        // Buscar contatos
        if (in_array('contacts', $types)) {
            $contacts = $this->searchContacts($query, $instanceId, $limit);
            $results['results']['contacts'] = $contacts['data'];
            $results['total'] += $contacts['total'];
        }

        // Buscar conversas
        if (in_array('conversations', $types)) {
            $conversations = $this->searchConversations($query, $instanceId, $limit);
            $results['results']['conversations'] = $conversations['data'];
            $results['total'] += $conversations['total'];
        }

        return response()->json($results);
    }

    /**
     * Busca específica em mensagens
     */
    public function messages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2|max:255',
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
            'conversation_id' => 'nullable|uuid|exists:conversations,id',
            'filters' => 'nullable|array',
            'filters.*.field' => 'required_with:filters|string',
            'filters.*.value' => 'required_with:filters',
            'filters.*.condition' => 'nullable|string',
            'filter_operator' => 'nullable|in:AND,OR',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'highlight' => 'nullable|boolean',
        ]);

        $query = $validated['query'];
        $instanceId = $validated['instance_id'] ?? null;
        $conversationId = $validated['conversation_id'] ?? null;
        $filters = $validated['filters'] ?? [];
        $filterOperator = $validated['filter_operator'] ?? 'AND';
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortDirection = $validated['sort_direction'] ?? 'desc';
        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 20;
        $highlight = $validated['highlight'] ?? true;

        $messagesQuery = Message::query()
            ->with(['conversation.contact', 'instance'])
            ->fullTextSearch($query, ['content', 'caption']);

        if ($highlight) {
            $messagesQuery->selectRaw('messages.*')
                ->selectRaw(
                    "ts_headline('portuguese', content, to_tsquery('portuguese', ?), 'MaxWords=50, MinWords=25, MaxFragments=3') as content_highlighted",
                    [str_replace(' ', ' & ', $query)]
                );
        }

        if ($instanceId) {
            $messagesQuery->forInstance($instanceId);
        }

        if ($conversationId) {
            $messagesQuery->forConversation($conversationId);
        }

        if (!empty($filters)) {
            $messagesQuery->applyFilters($filters, $filterOperator);
        }

        $messagesQuery->sortBy($sortBy, $sortDirection);

        $messages = $messagesQuery->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $messages->items(),
            'total' => $messages->total(),
            'per_page' => $messages->perPage(),
            'current_page' => $messages->currentPage(),
            'last_page' => $messages->lastPage(),
            'from' => $messages->firstItem(),
            'to' => $messages->lastItem(),
        ]);
    }

    /**
     * Busca específica em contatos
     */
    public function contacts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2|max:255',
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
            'filters' => 'nullable|array',
            'filters.*.field' => 'required_with:filters|string',
            'filters.*.value' => 'required_with:filters',
            'filters.*.condition' => 'nullable|string',
            'filter_operator' => 'nullable|in:AND,OR',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'uuid|exists:tags,id',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $validated['query'];
        $instanceId = $validated['instance_id'] ?? null;
        $filters = $validated['filters'] ?? [];
        $filterOperator = $validated['filter_operator'] ?? 'AND';
        $tagIds = $validated['tag_ids'] ?? [];
        $sortBy = $validated['sort_by'] ?? 'name';
        $sortDirection = $validated['sort_direction'] ?? 'asc';
        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 20;

        $contactsQuery = Contact::query()
            ->with(['instance', 'tags'])
            ->fullTextSearch($query, ['name', 'phone', 'email', 'notes']);

        if ($instanceId) {
            $contactsQuery->forInstance($instanceId);
        }

        if (!empty($tagIds)) {
            $contactsQuery->whereHas('tags', function ($q) use ($tagIds) {
                $q->whereIn('tags.id', $tagIds);
            });
        }

        if (!empty($filters)) {
            $contactsQuery->applyFilters($filters, $filterOperator);
        }

        $contactsQuery->sortBy($sortBy, $sortDirection);

        $contacts = $contactsQuery->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $contacts->items(),
            'total' => $contacts->total(),
            'per_page' => $contacts->perPage(),
            'current_page' => $contacts->currentPage(),
            'last_page' => $contacts->lastPage(),
            'from' => $contacts->firstItem(),
            'to' => $contacts->lastItem(),
        ]);
    }

    /**
     * Busca específica em conversas
     */
    public function conversations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => 'nullable|string|min:2|max:255',
            'instance_id' => 'nullable|uuid|exists:whatsapp_instances,id',
            'filters' => 'nullable|array',
            'filters.*.field' => 'required_with:filters|string',
            'filters.*.value' => 'required_with:filters',
            'filters.*.condition' => 'nullable|string',
            'filter_operator' => 'nullable|in:AND,OR',
            'status' => 'nullable|in:open,pending,closed',
            'assigned_to' => 'nullable|uuid|exists:users,id',
            'department_id' => 'nullable|uuid|exists:departments,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'uuid|exists:tags,id',
            'sort_by' => 'nullable|string',
            'sort_direction' => 'nullable|in:asc,desc',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = $validated['query'] ?? null;
        $instanceId = $validated['instance_id'] ?? null;
        $filters = $validated['filters'] ?? [];
        $filterOperator = $validated['filter_operator'] ?? 'AND';
        $status = $validated['status'] ?? null;
        $assignedTo = $validated['assigned_to'] ?? null;
        $departmentId = $validated['department_id'] ?? null;
        $tagIds = $validated['tag_ids'] ?? [];
        $sortBy = $validated['sort_by'] ?? 'last_message_at';
        $sortDirection = $validated['sort_direction'] ?? 'desc';
        $page = $validated['page'] ?? 1;
        $perPage = $validated['per_page'] ?? 20;

        $conversationsQuery = Conversation::query()
            ->with(['contact', 'instance', 'assignedUser', 'department', 'tags']);

        if ($query) {
            $conversationsQuery->where(function ($q) use ($query) {
                $q->fullTextSearch($query, ['group_name'])
                    ->orWhereHas('contact', function ($contactQuery) use ($query) {
                        $contactQuery->fullTextSearch($query, ['name', 'phone']);
                    });
            });
        }

        if ($instanceId) {
            $conversationsQuery->where('instance_id', $instanceId);
        }

        if ($status) {
            $conversationsQuery->where('status', $status);
        }

        if ($assignedTo) {
            $conversationsQuery->where('assigned_to', $assignedTo);
        }

        if ($departmentId) {
            $conversationsQuery->where('department_id', $departmentId);
        }

        if (!empty($tagIds)) {
            $conversationsQuery->whereHas('tags', function ($q) use ($tagIds) {
                $q->whereIn('tags.id', $tagIds);
            });
        }

        if (!empty($filters)) {
            $conversationsQuery->applyFilters($filters, $filterOperator);
        }

        $conversationsQuery->sortBy($sortBy, $sortDirection);

        $conversations = $conversationsQuery->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $conversations->items(),
            'total' => $conversations->total(),
            'per_page' => $conversations->perPage(),
            'current_page' => $conversations->currentPage(),
            'last_page' => $conversations->lastPage(),
            'from' => $conversations->firstItem(),
            'to' => $conversations->lastItem(),
        ]);
    }

    /**
     * Helper: Buscar mensagens
     */
    private function searchMessages(string $query, ?string $instanceId, int $limit): array
    {
        $messagesQuery = Message::query()
            ->with(['conversation.contact'])
            ->fullTextSearch($query, ['content', 'caption'])
            ->selectRaw('messages.*')
            ->selectRaw(
                "ts_headline('portuguese', content, to_tsquery('portuguese', ?), 'MaxWords=30, MinWords=15, MaxFragments=1') as content_highlighted",
                [str_replace(' ', ' & ', $query)]
            )
            ->latest()
            ->limit($limit);

        if ($instanceId) {
            $messagesQuery->forInstance($instanceId);
        }

        $messages = $messagesQuery->get();

        return [
            'data' => $messages,
            'total' => $messages->count(),
        ];
    }

    /**
     * Helper: Buscar contatos
     */
    private function searchContacts(string $query, ?string $instanceId, int $limit): array
    {
        $contactsQuery = Contact::query()
            ->with(['instance'])
            ->fullTextSearch($query, ['name', 'phone', 'email'])
            ->limit($limit);

        if ($instanceId) {
            $contactsQuery->forInstance($instanceId);
        }

        $contacts = $contactsQuery->get();

        return [
            'data' => $contacts,
            'total' => $contacts->count(),
        ];
    }

    /**
     * Helper: Buscar conversas
     */
    private function searchConversations(string $query, ?string $instanceId, int $limit): array
    {
        $conversationsQuery = Conversation::query()
            ->with(['contact', 'instance'])
            ->where(function ($q) use ($query) {
                $q->fullTextSearch($query, ['group_name'])
                    ->orWhereHas('contact', function ($contactQuery) use ($query) {
                        $contactQuery->fullTextSearch($query, ['name', 'phone']);
                    });
            })
            ->latest('last_message_at')
            ->limit($limit);

        if ($instanceId) {
            $conversationsQuery->where('instance_id', $instanceId);
        }

        $conversations = $conversationsQuery->get();

        return [
            'data' => $conversations,
            'total' => $conversations->count(),
        ];
    }
}
