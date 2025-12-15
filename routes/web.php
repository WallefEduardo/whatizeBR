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
});

require __DIR__.'/auth.php';
