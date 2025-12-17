<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

// Fix for DotenvVault not loading .env properly
if (class_exists(\Dotenv\Dotenv::class)) {
    $dotenv = \Dotenv\Dotenv::createUnsafeImmutable(dirname(__DIR__));
    $dotenv->safeLoad();
}

// Suppress PHP 8.1+ deprecation warnings from vendor libraries (php-amqplib)
error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    // Suppress deprecation warnings from vendor directory
    if ($errno === E_DEPRECATED && str_contains($errfile, 'vendor')) {
        return true; // Suppress the error
    }
    // Let other errors pass through
    return false;
});

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\AddSecurityHeaders::class,
        ]);

        // Register route middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'whatsapp.ratelimit' => \App\Http\Middleware\WhatsAppRateLimitMiddleware::class,
        ]);
    })
    ->withSchedule(function ($schedule) {
        // Process due schedules every minute
        $schedule->command('schedules:process')->everyMinute();
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
