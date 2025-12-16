<?php

use App\Http\Controllers\Api\BroadcastController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\WhatsAppInstanceController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\TagController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// WhatsApp Instance Management Routes
Route::prefix('whatsapp')->group(function () {
    // Create new WhatsApp instance
    Route::post('/instances', [WhatsAppInstanceController::class, 'store'])
        ->name('whatsapp.instances.store');

    // Get QR Code for instance
    Route::get('/instances/{token}/qr', [WhatsAppInstanceController::class, 'getQr'])
        ->name('whatsapp.instances.qr');

    // Get instance status
    Route::get('/instances/{token}/status', [WhatsAppInstanceController::class, 'getStatus'])
        ->name('whatsapp.instances.status');

    // Disconnect and delete instance
    Route::delete('/instances/{token}', [WhatsAppInstanceController::class, 'destroy'])
        ->name('whatsapp.instances.destroy');
});

// Tags Management Routes
Route::middleware('auth:sanctum')->prefix('tags')->group(function () {
    Route::get('/', [TagController::class, 'index'])->name('tags.index');
    Route::post('/', [TagController::class, 'store'])->name('tags.store');
    Route::patch('/{id}', [TagController::class, 'update'])->name('tags.update');
    Route::delete('/{id}', [TagController::class, 'destroy'])->name('tags.destroy');
});

// Conversations Stats Routes
Route::middleware('auth:sanctum')->prefix('conversations')->group(function () {
    Route::get('/stats', [ConversationController::class, 'stats'])->name('conversations.stats');
    Route::get('/unread-count', [ConversationController::class, 'unreadCount'])->name('conversations.unread-count');
});

// Chat API Routes (protected by auth)
Route::middleware('auth:sanctum')->group(function () {
    // Listar conversas
    Route::get('/conversations', [ChatController::class, 'index'])->name('api.conversations.index');

    // Enviar mensagem
    Route::post('/messages/send', [ChatController::class, 'sendMessage'])->name('api.messages.send');

    // Obter mensagens de uma conversa
    Route::get('/conversations/{conversationId}/messages', [ChatController::class, 'getMessages'])->name('api.messages.index');

    // Marcar mensagem como lida
    Route::patch('/messages/{messageId}/read', [ChatController::class, 'markAsRead'])->name('api.messages.read');

    // Atribuir conversa
    Route::patch('/conversations/{conversationId}/assign', [ChatController::class, 'assignConversation'])->name('api.conversations.assign');

    // Fechar conversa
    Route::patch('/conversations/{conversationId}/close', [ChatController::class, 'closeConversation'])->name('api.conversations.close');
});

// Broadcast API Routes (protected by auth)
Route::middleware('auth:sanctum')->prefix('broadcasts')->group(function () {
    // Listar broadcasts
    Route::get('/', [BroadcastController::class, 'index'])->name('api.broadcasts.index');

    // Criar broadcast
    Route::post('/', [BroadcastController::class, 'store'])->name('api.broadcasts.store');

    // Agendar broadcast
    Route::post('/{id}/schedule', [BroadcastController::class, 'schedule'])->name('api.broadcasts.schedule');

    // Enviar broadcast
    Route::post('/{id}/send', [BroadcastController::class, 'send'])->name('api.broadcasts.send');

    // Cancelar broadcast
    Route::post('/{id}/cancel', [BroadcastController::class, 'cancel'])->name('api.broadcasts.cancel');
});

// Webhook Routes (public - authenticated via webhook secret)
Route::prefix('webhook')->group(function () {
    // Receber mensagem
    Route::post('/message', [WebhookController::class, 'handleMessage'])->name('api.webhook.message');

    // Atualização de status
    Route::post('/status', [WebhookController::class, 'handleStatus'])->name('api.webhook.status');
});
