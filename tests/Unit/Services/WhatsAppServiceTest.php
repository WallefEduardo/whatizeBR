<?php

namespace Tests\Unit\Services;

use App\Services\WhatsAppService;
use Tests\TestCase;

class WhatsAppServiceTest extends TestCase
{
    protected WhatsAppService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(WhatsAppService::class);
    }

    /** @test */
    public function it_can_format_phone_number_correctly()
    {
        // Testa formatação de telefone brasileiro
        $phone1 = $this->service->formatPhone('(85) 99999-9999');
        $this->assertEquals('5585999999999', $phone1);

        $phone2 = $this->service->formatPhone('85 9 9999-9999');
        $this->assertEquals('5585999999999', $phone2);

        $phone3 = $this->service->formatPhone('5585999999999');
        $this->assertEquals('5585999999999', $phone3);
    }

    /** @test */
    public function it_validates_phone_number_format()
    {
        $this->assertTrue($this->service->isValidPhone('5585999999999'));
        $this->assertTrue($this->service->isValidPhone('5511999999999'));

        $this->assertFalse($this->service->isValidPhone('123'));
        $this->assertFalse($this->service->isValidPhone('abc'));
        $this->assertFalse($this->service->isValidPhone(''));
    }

    /** @test */
    public function it_validates_message_content_length()
    {
        $longMessage = str_repeat('a', 5000);

        $this->assertFalse($this->service->validateMessageLength($longMessage));
        $this->assertTrue($this->service->validateMessageLength('Hello World'));
        $this->assertTrue($this->service->validateMessageLength(str_repeat('a', 4096)));
    }

    /** @test */
    public function it_builds_correct_text_message_payload()
    {
        $payload = $this->service->buildTextMessagePayload(
            to: '5585999999999',
            message: 'Test message'
        );

        $this->assertArrayHasKey('to', $payload);
        $this->assertArrayHasKey('type', $payload);
        $this->assertArrayHasKey('text', $payload);
        $this->assertEquals('text', $payload['type']);
        $this->assertEquals('5585999999999', $payload['to']);
        $this->assertEquals('Test message', $payload['text']);
    }

    /** @test */
    public function it_builds_correct_media_message_payload()
    {
        $payload = $this->service->buildMediaMessagePayload(
            to: '5585999999999',
            mediaUrl: 'https://example.com/image.jpg',
            type: 'image',
            caption: 'Check this out'
        );

        $this->assertArrayHasKey('to', $payload);
        $this->assertArrayHasKey('type', $payload);
        $this->assertArrayHasKey('media_url', $payload);
        $this->assertArrayHasKey('caption', $payload);
        $this->assertEquals('image', $payload['type']);
        $this->assertEquals('Check this out', $payload['caption']);
    }

    /** @test */
    public function it_can_parse_webhook_text_message()
    {
        $webhookData = [
            'message_id' => 'wamid.123',
            'from' => '5585999999999',
            'to' => '5585988888888',
            'type' => 'text',
            'text' => ['body' => 'Hello'],
            'timestamp' => time(),
        ];

        $parsed = $this->service->parseWebhookMessage($webhookData);

        $this->assertEquals('wamid.123', $parsed['message_id']);
        $this->assertEquals('text', $parsed['type']);
        $this->assertEquals('Hello', $parsed['content']);
        $this->assertEquals('5585999999999', $parsed['from']);
    }

    /** @test */
    public function it_can_parse_webhook_media_message()
    {
        $webhookData = [
            'message_id' => 'wamid.456',
            'from' => '5585999999999',
            'to' => '5585988888888',
            'type' => 'image',
            'image' => [
                'url' => 'https://example.com/image.jpg',
                'mime_type' => 'image/jpeg',
                'caption' => 'Check this',
            ],
            'timestamp' => time(),
        ];

        $parsed = $this->service->parseWebhookMessage($webhookData);

        $this->assertEquals('wamid.456', $parsed['message_id']);
        $this->assertEquals('image', $parsed['type']);
        $this->assertEquals('https://example.com/image.jpg', $parsed['media_url']);
        $this->assertEquals('Check this', $parsed['caption']);
    }

    /** @test */
    public function it_sanitizes_message_content()
    {
        $dirty = '<script>alert("xss")</script>Hello';
        $clean = $this->service->sanitizeMessage($dirty);

        $this->assertStringNotContainsString('<script>', $clean);
        $this->assertStringContainsString('Hello', $clean);
    }

    /** @test */
    public function it_validates_media_file_types()
    {
        $this->assertTrue($this->service->isValidMediaType('image/jpeg'));
        $this->assertTrue($this->service->isValidMediaType('image/png'));
        $this->assertTrue($this->service->isValidMediaType('video/mp4'));
        $this->assertTrue($this->service->isValidMediaType('application/pdf'));

        $this->assertFalse($this->service->isValidMediaType('application/x-executable'));
        $this->assertFalse($this->service->isValidMediaType('text/html'));
    }

    /** @test */
    public function it_validates_media_file_size()
    {
        // 5MB = permitido
        $this->assertTrue($this->service->isValidMediaSize(5 * 1024 * 1024));

        // 16MB = permitido (limite máximo)
        $this->assertTrue($this->service->isValidMediaSize(16 * 1024 * 1024));

        // 20MB = não permitido
        $this->assertFalse($this->service->isValidMediaSize(20 * 1024 * 1024));
    }
}
