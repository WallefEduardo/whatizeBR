<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [\App\Http\Controllers\AnalyticsController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // WhatsApp Connections
    Route::get('/connections', [\App\Http\Controllers\ConnectionController::class, 'index'])->name('connections.index');
    Route::get('/connections/{token}/qr', [\App\Http\Controllers\ConnectionController::class, 'qrCode'])->name('connections.qr');

    // Contacts
    Route::resource('contacts', \App\Http\Controllers\ContactController::class);
    Route::post('/contacts/bulk-destroy', [\App\Http\Controllers\ContactController::class, 'bulkDestroy'])->name('contacts.bulk-destroy');
    Route::post('/contacts/bulk-add-tags', [\App\Http\Controllers\ContactController::class, 'bulkAddTags'])->name('contacts.bulk-add-tags');
    Route::post('/contacts/{id}/toggle-block', [\App\Http\Controllers\ContactController::class, 'toggleBlock'])->name('contacts.toggle-block');

    // Chat
    Route::get('/chat', [\App\Http\Controllers\ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{id}', [\App\Http\Controllers\ChatController::class, 'show'])->name('chat.show');
    Route::post('/conversations/{id}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage'])->name('chat.send-message');

    // Conversations
    Route::get('/conversations', [\App\Http\Controllers\ConversationController::class, 'index'])->name('conversations.index');
    Route::get('/conversations/{id}', [\App\Http\Controllers\ConversationController::class, 'show'])->name('conversations.show');
    Route::post('/conversations/{id}/assign', [\App\Http\Controllers\ConversationController::class, 'assign'])->name('conversations.assign');
    Route::post('/conversations/{id}/status', [\App\Http\Controllers\ConversationController::class, 'updateStatus'])->name('conversations.status');
    Route::post('/conversations/{id}/department', [\App\Http\Controllers\ConversationController::class, 'updateDepartment'])->name('conversations.department');
    Route::post('/conversations/{id}/tags', [\App\Http\Controllers\ConversationController::class, 'addTags'])->name('conversations.tags.add');
    Route::delete('/conversations/{id}/tags/{tagId}', [\App\Http\Controllers\ConversationController::class, 'removeTag'])->name('conversations.tags.remove');
    Route::post('/conversations/{id}/mark-read', [\App\Http\Controllers\ConversationController::class, 'markAsRead'])->name('conversations.mark-read');
    Route::post('/conversations/bulk-update', [\App\Http\Controllers\ConversationController::class, 'bulkUpdate'])->name('conversations.bulk-update');

    // Departments
    Route::resource('departments', \App\Http\Controllers\DepartmentController::class);
    Route::post('/departments/{department}/toggle', [\App\Http\Controllers\DepartmentController::class, 'toggle'])->name('departments.toggle');

    // Tags
    Route::resource('tags', \App\Http\Controllers\TagController::class);

    // Members
    Route::resource('members', \App\Http\Controllers\MemberController::class);
    Route::post('/members/{member}/toggle', [\App\Http\Controllers\MemberController::class, 'toggle'])->name('members.toggle');
    Route::get('/members/{member}/stats', [\App\Http\Controllers\MemberController::class, 'stats'])->name('members.stats');

    // Schedules
    Route::resource('schedules', \App\Http\Controllers\ScheduleController::class);
    Route::post('/schedules/{schedule}/cancel', [\App\Http\Controllers\ScheduleController::class, 'cancel'])->name('schedules.cancel');

    // Broadcasts
    Route::resource('broadcasts', \App\Http\Controllers\BroadcastController::class);
    Route::post('/broadcasts/{broadcast}/send', [\App\Http\Controllers\BroadcastController::class, 'send'])->name('broadcasts.send');
    Route::post('/broadcasts/{broadcast}/cancel', [\App\Http\Controllers\BroadcastController::class, 'cancel'])->name('broadcasts.cancel');
    Route::post('/broadcasts/preview', [\App\Http\Controllers\BroadcastController::class, 'preview'])->name('broadcasts.preview');

    // Chatbots
    Route::resource('chatbots', \App\Http\Controllers\ChatbotController::class);
    Route::post('/chatbots/{chatbot}/toggle', [\App\Http\Controllers\ChatbotController::class, 'toggle'])->name('chatbots.toggle');
    Route::get('/chatbots/{chatbot}/builder', [\App\Http\Controllers\ChatbotController::class, 'builder'])->name('chatbots.builder');

    // Chatbot Flows
    Route::resource('chatbot-flows', \App\Http\Controllers\ChatbotFlowController::class);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');

    // Custom Fields
    Route::resource('custom-fields', \App\Http\Controllers\CustomFieldController::class);
    Route::post('/custom-fields/update-order', [\App\Http\Controllers\CustomFieldController::class, 'updateOrder'])->name('custom-fields.update-order');

    // Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/conversations', [\App\Http\Controllers\AnalyticsController::class, 'conversations'])->name('conversations');
        Route::get('/response-rate', [\App\Http\Controllers\AnalyticsController::class, 'responseRate'])->name('response-rate');
        Route::get('/first-response-time', [\App\Http\Controllers\AnalyticsController::class, 'firstResponseTime'])->name('first-response-time');
        Route::get('/resolution-time', [\App\Http\Controllers\AnalyticsController::class, 'resolutionTime'])->name('resolution-time');
        Route::get('/by-agent', [\App\Http\Controllers\AnalyticsController::class, 'byAgent'])->name('by-agent');
        Route::get('/by-department', [\App\Http\Controllers\AnalyticsController::class, 'byDepartment'])->name('by-department');
        Route::get('/peak-hours', [\App\Http\Controllers\AnalyticsController::class, 'peakHours'])->name('peak-hours');
        Route::get('/messages', [\App\Http\Controllers\AnalyticsController::class, 'messages'])->name('messages');
        Route::get('/over-time', [\App\Http\Controllers\AnalyticsController::class, 'overTime'])->name('over-time');
        Route::post('/clear-cache', [\App\Http\Controllers\AnalyticsController::class, 'clearCache'])->name('clear-cache');
    });

    // WebSocket Test Routes (Development Only)
    if (config('app.debug')) {
        Route::get('/test/websocket/message', [\App\Http\Controllers\TestWebSocketController::class, 'testMessage'])->name('test.websocket.message');
        Route::get('/test/websocket/typing', [\App\Http\Controllers\TestWebSocketController::class, 'testTyping'])->name('test.websocket.typing');
    }
});

require __DIR__.'/auth.php';
