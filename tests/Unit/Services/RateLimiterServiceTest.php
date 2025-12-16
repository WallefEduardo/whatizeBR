<?php

namespace Tests\Unit\Services;

use App\Services\RateLimiterService;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class RateLimiterServiceTest extends TestCase
{
    protected RateLimiterService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RateLimiterService::class);
        Cache::flush();
    }

    /** @test */
    public function it_allows_messages_within_rate_limit()
    {
        $contactPhone = '5585999999999';

        // 10 mensagens por minuto é o limite padrão
        for ($i = 0; $i < 10; $i++) {
            $this->assertTrue(
                $this->service->canSendMessage($contactPhone),
                "Message $i should be allowed"
            );
        }
    }

    /** @test */
    public function it_blocks_messages_exceeding_rate_limit()
    {
        $contactPhone = '5585999999999';

        // Envia 10 mensagens (limite)
        for ($i = 0; $i < 10; $i++) {
            $this->service->canSendMessage($contactPhone);
        }

        // 11ª mensagem deve ser bloqueada
        $this->assertFalse(
            $this->service->canSendMessage($contactPhone),
            '11th message should be blocked'
        );
    }

    /** @test */
    public function it_tracks_separate_limits_for_different_contacts()
    {
        $contact1 = '5585999999999';
        $contact2 = '5585988888888';

        // Preenche limite do contact1
        for ($i = 0; $i < 10; $i++) {
            $this->service->canSendMessage($contact1);
        }

        // Contact1 está bloqueado
        $this->assertFalse($this->service->canSendMessage($contact1));

        // Contact2 ainda pode enviar
        $this->assertTrue($this->service->canSendMessage($contact2));
    }

    /** @test */
    public function it_resets_limit_after_time_window()
    {
        $contactPhone = '5585999999999';

        // Preenche o limite
        for ($i = 0; $i < 10; $i++) {
            $this->service->canSendMessage($contactPhone);
        }

        // Está bloqueado
        $this->assertFalse($this->service->canSendMessage($contactPhone));

        // Limpa o rate limit manualmente (simula expiração do cache)
        $this->service->clearRateLimit($contactPhone);

        // Deve permitir novamente
        $this->assertTrue($this->service->canSendMessage($contactPhone));
    }

    /** @test */
    public function it_returns_remaining_attempts()
    {
        $contactPhone = '5585999999999';

        // Início: 10 tentativas disponíveis
        $this->assertEquals(10, $this->service->remainingAttempts($contactPhone));

        // Envia 3 mensagens
        for ($i = 0; $i < 3; $i++) {
            $this->service->canSendMessage($contactPhone);
        }

        // Restam 7 tentativas
        $this->assertEquals(7, $this->service->remainingAttempts($contactPhone));

        // Envia mais 7 mensagens
        for ($i = 0; $i < 7; $i++) {
            $this->service->canSendMessage($contactPhone);
        }

        // Restam 0 tentativas
        $this->assertEquals(0, $this->service->remainingAttempts($contactPhone));
    }

    /** @test */
    public function it_can_manually_clear_rate_limit()
    {
        $contactPhone = '5585999999999';

        // Preenche o limite
        for ($i = 0; $i < 10; $i++) {
            $this->service->canSendMessage($contactPhone);
        }

        // Está bloqueado
        $this->assertFalse($this->service->canSendMessage($contactPhone));

        // Limpa manualmente
        $this->service->clearRateLimit($contactPhone);

        // Pode enviar novamente
        $this->assertTrue($this->service->canSendMessage($contactPhone));
    }

    /** @test */
    public function it_can_check_global_rate_limit()
    {
        // Limite global: 1000 mensagens por minuto
        for ($i = 0; $i < 1000; $i++) {
            $this->assertTrue(
                $this->service->canSendGlobal(),
                "Global message $i should be allowed"
            );
        }

        // 1001ª mensagem deve ser bloqueada
        $this->assertFalse(
            $this->service->canSendGlobal(),
            'Message 1001 should be blocked globally'
        );
    }

    /** @test */
    public function it_respects_custom_rate_limit()
    {
        $contactPhone = '5585999999999';
        $customLimit = 5;

        // Define limite customizado de 5 mensagens
        for ($i = 0; $i < $customLimit; $i++) {
            $this->assertTrue(
                $this->service->canSendMessage($contactPhone, $customLimit),
                "Message $i should be allowed with custom limit"
            );
        }

        // 6ª mensagem deve ser bloqueada
        $this->assertFalse(
            $this->service->canSendMessage($contactPhone, $customLimit),
            'Message 6 should be blocked with custom limit of 5'
        );
    }

    /** @test */
    public function it_handles_concurrent_requests_safely()
    {
        $contactPhone = '5585999999999';

        // Simula múltiplas requisições concorrentes
        $allowed = 0;
        $blocked = 0;

        for ($i = 0; $i < 15; $i++) {
            if ($this->service->canSendMessage($contactPhone)) {
                $allowed++;
            } else {
                $blocked++;
            }
        }

        // Deve permitir exatamente 10 e bloquear 5
        $this->assertEquals(10, $allowed);
        $this->assertEquals(5, $blocked);
    }
}
