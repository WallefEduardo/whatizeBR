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

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
});

require __DIR__.'/auth.php';
