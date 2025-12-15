<?php

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
