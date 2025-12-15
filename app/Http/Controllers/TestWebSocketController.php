<?php

namespace App\Http\Controllers;

use App\Events\WhatsApp\MessageReceived;
use App\Events\WhatsApp\TypingIndicator;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;

class TestWebSocketController extends Controller
{
    public function testMessage(Request $request)
    {
        // Pega uma conversa qualquer
        $conversation = Conversation::with('contact')->first();
        
        if (!$conversation) {
            return response()->json(['error' => 'Nenhuma conversa encontrada'], 404);
        }

        // Cria uma mensagem de teste
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'direction' => 'inbound',
            'type' => 'text',
            'content' => 'Mensagem de teste do WebSocket! ' . now()->format('H:i:s'),
            'status' => 'delivered',
            'whatsapp_message_id' => 'test_' . uniqid(),
        ]);

        // Dispara o evento
        broadcast(new MessageReceived($message))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Evento disparado!',
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
        ]);
    }

    public function testTyping(Request $request)
    {
        $conversation = Conversation::with('contact')->first();
        
        if (!$conversation) {
            return response()->json(['error' => 'Nenhuma conversa encontrada'], 404);
        }

        $contactName = $conversation->contact->name ?? $conversation->contact->phone;

        // Dispara typing indicator
        broadcast(new TypingIndicator(
            $conversation->id,
            $contactName,
            true
        ))->toOthers();

        return response()->json([
            'success' => true,
            'message' => 'Typing indicator disparado!',
            'conversation_id' => $conversation->id,
            'contact' => $contactName,
        ]);
    }
}
