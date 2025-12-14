<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class WhatsAppRateLimitMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Rate limiting per contact to prevent spam
     * Default: 10 messages per minute per contact
     */
    public function handle(Request $request, Closure $next): Response
    {
        $contact = $request->input('to') ?? $request->input('contact');

        if (!$contact) {
            // If no contact specified, skip rate limiting
            return $next($request);
        }

        $instanceId = $request->route('token') ?? 'default';
        $key = "whatsapp_rate_limit:{$instanceId}:{$contact}";

        // Get rate limit configuration (messages per minute)
        $maxAttempts = config('whatsapp.rate_limit.max_attempts', 10);
        $decayMinutes = config('whatsapp.rate_limit.decay_minutes', 1);

        // Get current attempts
        $attempts = Cache::get($key, 0);

        if ($attempts >= $maxAttempts) {
            Log::warning('Rate limit exceeded for contact', [
                'instance_id' => $instanceId,
                'contact' => $contact,
                'attempts' => $attempts,
                'max_attempts' => $maxAttempts,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Rate limit exceeded. Please try again later.',
                'retry_after' => $decayMinutes * 60, // seconds
            ], 429);
        }

        // Increment attempts
        if ($attempts === 0) {
            Cache::put($key, 1, now()->addMinutes($decayMinutes));
        } else {
            Cache::increment($key);
        }

        Log::debug('Rate limit check passed', [
            'instance_id' => $instanceId,
            'contact' => $contact,
            'attempts' => $attempts + 1,
            'max_attempts' => $maxAttempts,
        ]);

        return $next($request);
    }
}
