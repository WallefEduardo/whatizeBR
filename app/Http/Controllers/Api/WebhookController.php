<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsAppInstance;
use App\Services\ChatbotService;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsappService,
        private ChatbotService $chatbotService
    ) {}

    /**
     * Processa webhook de mensagens recebidas
     */
    public function handleMessage(Request $request): JsonResponse
    {
        try {
            // Validar webhook secret
            $instance = WhatsAppInstance::where('webhook_secret', $request->header('X-Webhook-Secret'))->first();

            if (!$instance) {
                Log::warning('Webhook rejeitado: secret inválido', [
                    'ip' => $request->ip(),
                    'secret' => $request->header('X-Webhook-Secret'),
                ]);
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Parse mensagem do webhook
            $parsedMessage = $this->whatsappService->parseWebhookMessage($request->all());

            // Buscar ou criar contato
            $contact = Contact::firstOrCreate(
                ['phone' => $parsedMessage['from']],
                [
                    'instance_id' => $instance->id,
                    'name' => $parsedMessage['from'],
                ]
            );

            // Buscar ou criar conversa
            $conversation = Conversation::firstOrCreate(
                [
                    'instance_id' => $instance->id,
                    'contact_id' => $contact->id,
                ],
                [
                    'status' => 'open',
                    'last_message_at' => now(),
                ]
            );

            // Criar mensagem
            $message = Message::create([
                'instance_id' => $instance->id,
                'conversation_id' => $conversation->id,
                'direction' => 'inbound',
                'from_phone' => $parsedMessage['from'],
                'to_phone' => $parsedMessage['to'],
                'type' => $parsedMessage['type'],
                'content' => $parsedMessage['content'] ?? null,
                'media_url' => $parsedMessage['media_url'] ?? null,
                'caption' => $parsedMessage['caption'] ?? null,
                'message_id' => $parsedMessage['message_id'],
                'status' => 'received',
                'received_at' => now(),
            ]);

            // Atualizar conversa
            $conversation->update([
                'last_message_at' => now(),
            ]);

            // Processar chatbot se for mensagem de texto
            if ($parsedMessage['type'] === 'text') {
                $this->chatbotService->processMessage(
                    $conversation,
                    $parsedMessage['content']
                );
            }

            return response()->json(['status' => 'success', 'message_id' => $message->id], 200);
        } catch (\Exception $e) {
            Log::error('Erro ao processar webhook', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }

    /**
     * Processa webhook de status de mensagem
     */
    public function handleStatus(Request $request): JsonResponse
    {
        try {
            // Validar webhook secret
            $instance = WhatsAppInstance::where('webhook_secret', $request->header('X-Webhook-Secret'))->first();

            if (!$instance) {
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            $messageId = $request->input('message_id');
            $status = $request->input('status'); // sent, delivered, read, failed

            // Buscar mensagem
            $message = Message::where('message_id', $messageId)
                ->where('instance_id', $instance->id)
                ->first();

            if (!$message) {
                Log::warning('Mensagem não encontrada para atualização de status', [
                    'message_id' => $messageId,
                ]);
                return response()->json(['error' => 'Message not found'], 404);
            }

            // Atualizar status
            $updates = ['status' => $status];

            if ($status === 'sent') {
                $updates['sent_at'] = now();
            } elseif ($status === 'delivered') {
                $updates['delivered_at'] = now();
            } elseif ($status === 'read') {
                $updates['read_at'] = now();
            } elseif ($status === 'failed') {
                $updates['error_message'] = $request->input('error_message', 'Unknown error');
            }

            $message->update($updates);

            return response()->json(['status' => 'success'], 200);
        } catch (\Exception $e) {
            Log::error('Erro ao processar status do webhook', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Internal Server Error'], 500);
        }
    }
}
