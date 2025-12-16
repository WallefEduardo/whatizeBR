<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para cache de respostas HTTP
 *
 * Cacheia respostas GET por um tempo determinado
 */
class CacheResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, int $minutes = 5): Response
    {
        // Apenas cacheia requisições GET
        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        // Gera chave única baseada na URL e query params
        $cacheKey = $this->getCacheKey($request);

        // Verifica se existe resposta em cache
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            return response($cached['content'], $cached['status'])
                ->withHeaders(array_merge($cached['headers'], [
                    'X-Cache-Hit' => 'true',
                ]));
        }

        // Processa requisição
        $response = $next($request);

        // Cacheia apenas respostas de sucesso
        if ($response->isSuccessful()) {
            Cache::put($cacheKey, [
                'content' => $response->getContent(),
                'status' => $response->getStatusCode(),
                'headers' => $response->headers->all(),
            ], now()->addMinutes($minutes));
        }

        return $response->withHeaders([
            'X-Cache-Hit' => 'false',
        ]);
    }

    /**
     * Gera chave de cache única
     */
    private function getCacheKey(Request $request): string
    {
        $url = $request->url();
        $query = $request->query();
        $user = $request->user()?->id ?? 'guest';

        ksort($query);

        return 'http_cache:' . md5($url . serialize($query) . $user);
    }
}
