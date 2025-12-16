<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class RateLimiterService
{
    private int $defaultLimit = 10; // mensagens por minuto
    private int $windowSeconds = 60;
    private int $globalLimit = 1000;

    public function canSendMessage(string $contactPhone, ?int $customLimit = null): bool
    {
        $limit = $customLimit ?? $this->defaultLimit;
        $key = "rate_limit:contact:{$contactPhone}";

        $attempts = Cache::get($key, 0);

        if ($attempts >= $limit) {
            return false;
        }

        Cache::put($key, $attempts + 1, $this->windowSeconds);

        return true;
    }

    public function remainingAttempts(string $contactPhone, ?int $customLimit = null): int
    {
        $limit = $customLimit ?? $this->defaultLimit;
        $key = "rate_limit:contact:{$contactPhone}";

        $attempts = Cache::get($key, 0);

        return max(0, $limit - $attempts);
    }

    public function availableIn(string $contactPhone): int
    {
        $key = "rate_limit:contact:{$contactPhone}";

        // Para testes com array driver, retorna tempo estimado
        if (config('cache.default') === 'array') {
            $attempts = Cache::get($key, 0);
            return $attempts >= $this->defaultLimit ? $this->windowSeconds : 0;
        }

        // Para Redis/produção
        try {
            $ttl = Cache::getStore()->getRedis()->ttl($key);
            return max(0, $ttl);
        } catch (\Exception $e) {
            return $this->windowSeconds;
        }
    }

    public function canSendGlobal(): bool
    {
        $key = "rate_limit:global";

        $attempts = Cache::get($key, 0);

        if ($attempts >= $this->globalLimit) {
            return false;
        }

        Cache::put($key, $attempts + 1, $this->windowSeconds);

        return true;
    }

    public function clearRateLimit(string $contactPhone): void
    {
        $key = "rate_limit:contact:{$contactPhone}";
        Cache::forget($key);
    }
}
