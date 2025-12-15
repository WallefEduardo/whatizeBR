<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Jobs\SendWhatsAppTextMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Conversation::with(['contact.tags', 'instance', 'lastMessage'])
            ->where('assigned_to', $user->id)
            ->orderBy('last_message_at', 'desc');

        // Paginação
        $conversations = $query->paginate(50);

        // Stats por status
        $stats = [
            'open' => Conversation::where('assigned_to', $user->id)
                ->where('status', 'open')
                ->count(),
            'pending' => Conversation::where('assigned_to', $user->id)
                ->where('status', 'pending')
                ->count(),
            'closed' => Conversation::where('assigned_to', $user->id)
                ->where('status', 'closed')
                ->count(),
        ];

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'stats' => $stats,
        ]);
    }

    public function show(Request $request, string $id)
    {
        $user = $request->user();

        $conversation = Conversation::with(['contact.tags', 'instance'])
            ->where('assigned_to', $user->id)
            ->findOrFail($id);

        // Buscar todas as conversas para a lista lateral
        $conversations = Conversation::with(['contact.tags', 'instance', 'lastMessage'])
            ->where('assigned_to', $user->id)
            ->orderBy('last_message_at', 'desc')
            ->paginate(50);

        // Buscar mensagens da conversa
        $messages = Message::where('conversation_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        // Marcar mensagens como lidas
        $conversation->markAsRead();

        // Stats
        $stats = [
            'open' => Conversation::where('assigned_to', $user->id)
                ->where('status', 'open')
                ->count(),
            'pending' => Conversation::where('assigned_to', $user->id)
                ->where('status', 'pending')
                ->count(),
            'closed' => Conversation::where('assigned_to', $user->id)
                ->where('status', 'closed')
                ->count(),
        ];

        return Inertia::render('Chat/Index', [
            'conversations' => $conversations,
            'selectedConversation' => $conversation,
            'messages' => $messages,
            'stats' => $stats,
        ]);
    }

    public function sendMessage(Request $request, string $id)
    {
        $user = $request->user();

        $conversation = Conversation::where('assigned_to', $user->id)
            ->findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'type' => 'required|string|in:text,image,video,audio,document,location,contact,button,list,reaction,sticker',
        ]);

        // Criar mensagem no banco
        $message = Message::create([
            'instance_id' => $conversation->instance_id,
            'conversation_id' => $conversation->id,
            'contact_id' => $conversation->contact_id,
            'content' => $validated['content'],
            'type' => $validated['type'],
            'direction' => 'outbound',
            'status' => 'pending',
        ]);

        // Atualizar última mensagem da conversa
        $conversation->update([
            'last_message' => $validated['content'],
            'last_message_at' => now(),
            'last_message_id' => $message->id,
        ]);

        // Despachar job para enviar via WhatsApp
        if ($validated['type'] === 'text') {
            SendWhatsAppTextMessage::dispatch($message);
        }

        return redirect()->back();
    }
}
