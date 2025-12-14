<?php

use App\Http\Controllers\Api\WhatsAppInstanceController;
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
