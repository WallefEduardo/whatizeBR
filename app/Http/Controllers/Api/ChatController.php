<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendWhatsAppMediaMessage;
use App\Jobs\SendWhatsAppTextMessage;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    /**
     * Listar conversas
     */
    public function index(Request $request): JsonResponse
    {
        $query = Conversation::query()->with(['contact', 'lastMessage']);

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Busca por nome do contato
        if ($request->has('search')) {
            $query->whereHas('contact', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%');
            });
        }

        $conversations = $query->latest('last_message_at')->get();

        return response()->json(['data' => $conversations]);
    }

    /**
     * Enviar mensagem
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'conversation_id' => 'required|exists:conversations,id',
            'type' => 'required|in:text,image,video,audio,document',
            'content' => 'required_if:type,text|string',
            'media_url' => 'required_unless:type,text|url',
            'caption' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $conversation = Conversation::findOrFail($request->conversation_id);

        // Criar mensagem
        $message = Message::create([
            'instance_id' => $conversation->instance_id,
            'conversation_id' => $conversation->id,
            'direction' => 'outbound',
            'from_phone' => $conversation->instance->phone,
            'to_phone' => $conversation->contact->phone,
            'type' => $request->type,
            'content' => $request->content,
            'media_url' => $request->media_url,
            'caption' => $request->caption,
            'status' => 'pending',
        ]);

        // Despachar job
        if ($request->type === 'text') {
            SendWhatsAppTextMessage::dispatch($message);
        } else {
            SendWhatsAppMediaMessage::dispatch($message);
        }

        return response()->json(['data' => $message], 201);
    }

    /**
     * Obter mensagens de uma conversa
     */
    public function getMessages(Request $request, string $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);

        $perPage = $request->get('per_page', 20);

        $messages = Message::where('conversation_id', $conversation->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $messages->items(),
            'meta' => [
                'total' => $messages->total(),
                'per_page' => $messages->perPage(),
                'current_page' => $messages->currentPage(),
            ],
        ]);
    }

    /**
     * Marcar mensagem como lida
     */
    public function markAsRead(string $messageId): JsonResponse
    {
        $message = Message::findOrFail($messageId);

        $message->update([
            'status' => 'read',
            'read_at' => now(),
        ]);

        return response()->json(['data' => $message]);
    }

    /**
     * Atribuir conversa a um usuário
     */
    public function assignConversation(Request $request, string $conversationId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $conversation = Conversation::findOrFail($conversationId);

        $conversation->update([
            'assigned_to' => $request->user_id,
        ]);

        return response()->json(['data' => $conversation]);
    }

    /**
     * Fechar conversa
     */
    public function closeConversation(string $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);

        $conversation->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return response()->json(['data' => $conversation]);
    }
}
