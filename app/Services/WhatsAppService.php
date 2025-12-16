<?php

namespace App\Services;

class WhatsAppService
{
    /**
     * Formata número de telefone para o padrão internacional
     */
    public function formatPhone(string $phone): string
    {
        // Remove tudo exceto números
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Se não tem código do país, adiciona 55 (Brasil)
        if (!str_starts_with($phone, '55')) {
            $phone = '55' . $phone;
        }

        return $phone;
    }

    /**
     * Valida se o telefone está no formato correto
     */
    public function isValidPhone(string $phone): bool
    {
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Deve ter entre 12 e 13 dígitos (55 + DDD + número)
        return strlen($phone) >= 12 && strlen($phone) <= 13;
    }

    /**
     * Valida tamanho da mensagem
     */
    public function validateMessageLength(string $message): bool
    {
        // WhatsApp permite até 4096 caracteres
        return strlen($message) <= 4096;
    }

    /**
     * Constrói payload para mensagem de texto
     */
    public function buildTextMessagePayload(string $to, string $message): array
    {
        return [
            'to' => $to,
            'type' => 'text',
            'text' => $message,
        ];
    }

    /**
     * Constrói payload para mensagem de mídia
     */
    public function buildMediaMessagePayload(
        string $to,
        string $mediaUrl,
        string $type,
        ?string $caption = null
    ): array {
        return [
            'to' => $to,
            'type' => $type,
            'media_url' => $mediaUrl,
            'caption' => $caption,
        ];
    }

    /**
     * Faz parse de mensagem recebida via webhook
     */
    public function parseWebhookMessage(array $data): array
    {
        $parsed = [
            'message_id' => $data['message_id'],
            'from' => $data['from'],
            'to' => $data['to'] ?? null,
            'type' => $data['type'],
            'timestamp' => $data['timestamp'] ?? time(),
        ];

        // Parse baseado no tipo
        switch ($data['type']) {
            case 'text':
                $parsed['content'] = $data['text']['body'] ?? '';
                break;

            case 'image':
            case 'video':
            case 'audio':
            case 'document':
                $mediaKey = $data['type'];
                $parsed['media_url'] = $data[$mediaKey]['url'] ?? '';
                $parsed['caption'] = $data[$mediaKey]['caption'] ?? null;
                $parsed['mime_type'] = $data[$mediaKey]['mime_type'] ?? null;
                break;
        }

        return $parsed;
    }

    /**
     * Sanitiza conteúdo de mensagem (proteção XSS)
     */
    public function sanitizeMessage(string $message): string
    {
        return strip_tags($message);
    }

    /**
     * Valida tipo de arquivo de mídia
     */
    public function isValidMediaType(string $mimeType): bool
    {
        $allowedTypes = [
            // Imagens
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            // Vídeos
            'video/mp4',
            'video/3gpp',
            // Áudio
            'audio/aac',
            'audio/mp4',
            'audio/mpeg',
            'audio/amr',
            'audio/ogg',
            // Documentos
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/msword',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        return in_array($mimeType, $allowedTypes);
    }

    /**
     * Valida tamanho de arquivo de mídia
     */
    public function isValidMediaSize(int $sizeInBytes): bool
    {
        // Limite de 16MB
        $maxSize = 16 * 1024 * 1024;

        return $sizeInBytes <= $maxSize;
    }
}
