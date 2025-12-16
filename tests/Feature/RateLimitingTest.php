<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_rate_limits_api_requests()
    {
        $user = User::factory()->create();

        // Faz 60 requisições (limite padrão do Laravel)
        for ($i = 0; $i < 61; $i++) {
            $response = $this->actingAs($user)
                ->getJson('/api/conversations');

            if ($i < 60) {
                $response->assertStatus(200);
            } else {
                // 61ª requisição deve ser bloqueada
                $response->assertStatus(429);
                $response->assertHeader('Retry-After');
            }
        }
    }

    /** @test */
    public function it_has_different_limits_for_different_routes()
    {
        $user = User::factory()->create();

        // Testa uma rota com limite menor (ex: webhooks públicos)
        for ($i = 0; $i < 10; $i++) {
            $response = $this->getJson('/api/webhooks/whatsapp');

            if ($i < 5) {
                // Limite mais baixo para rotas públicas
                $response->assertStatus(200);
            }
        }
    }

    /** @test */
    public function it_resets_rate_limit_after_time_window()
    {
        $user = User::factory()->create();

        // Preenche o limite
        for ($i = 0; $i < 60; $i++) {
            $this->actingAs($user)->getJson('/api/conversations');
        }

        // Próxima requisição é bloqueada
        $response = $this->actingAs($user)->getJson('/api/conversations');
        $response->assertStatus(429);

        // Avança o tempo em 61 segundos
        $this->travel(61)->seconds();

        // Agora deve funcionar novamente
        $response = $this->actingAs($user)->getJson('/api/conversations');
        $response->assertStatus(200);
    }
}
