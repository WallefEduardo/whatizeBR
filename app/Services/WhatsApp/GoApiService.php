<?php

namespace App\Services\WhatsApp;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GoApiService
{
    private string $baseUrl;
    private string $adminToken;

    public function __construct()
    {
        $this->baseUrl = config('services.go_whatsapp.base_url');
        $this->adminToken = config('services.go_whatsapp.admin_token');
    }

    /**
     * Create a new WhatsApp session
     *
     * @param string $instanceToken Unique instance identifier
     * @return array Session data
     * @throws \Exception
     */
    public function createSession(string $instanceToken): array
    {
        Log::info('Creating WhatsApp session via Go API', [
            'instance_token' => $instanceToken,
        ]);

        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
                'Content-Type' => 'application/json',
            ])
            ->post("{$this->baseUrl}/admin/sessions", [
                'instance_token' => $instanceToken,
            ]);

        if (!$response->successful()) {
            $error = $response->json('error') ?? $response->body();
            Log::error('Failed to create session via Go API', [
                'instance_token' => $instanceToken,
                'status' => $response->status(),
                'error' => $error,
            ]);
            throw new \Exception("Failed to create session: {$error}");
        }

        $data = $response->json('data');

        Log::info('Session created successfully', [
            'instance_token' => $instanceToken,
            'status' => $data['status'] ?? 'unknown',
        ]);

        return $data;
    }

    /**
     * Generate QR code for session authentication
     *
     * @param string $instanceToken Instance identifier
     * @return array QR code data
     * @throws \Exception
     */
    public function generateQrCode(string $instanceToken): array
    {
        Log::info('Generating QR code via Go API', [
            'instance_token' => $instanceToken,
        ]);

        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->post("{$this->baseUrl}/admin/sessions/{$instanceToken}/qr");

        if (!$response->successful()) {
            $error = $response->json('error') ?? $response->body();
            Log::error('Failed to generate QR code', [
                'instance_token' => $instanceToken,
                'status' => $response->status(),
                'error' => $error,
            ]);
            throw new \Exception("Failed to generate QR code: {$error}");
        }

        $data = $response->json('data');

        Log::info('QR code generated successfully', [
            'instance_token' => $instanceToken,
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        return $data;
    }

    /**
     * Get current QR code (if already generated)
     *
     * @param string $instanceToken Instance identifier
     * @return array|null QR code data or null if not found
     */
    public function getQrCode(string $instanceToken): ?array
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->get("{$this->baseUrl}/admin/sessions/{$instanceToken}/qr");

        if ($response->status() === 404) {
            return null;
        }

        if (!$response->successful()) {
            return null;
        }

        return $response->json('data');
    }

    /**
     * Get session status
     *
     * @param string $instanceToken Instance identifier
     * @return array Session status data
     * @throws \Exception
     */
    public function getSessionStatus(string $instanceToken): array
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->get("{$this->baseUrl}/admin/sessions/{$instanceToken}");

        if (!$response->successful()) {
            $error = $response->json('error') ?? $response->body();
            throw new \Exception("Failed to get session status: {$error}");
        }

        return $response->json('data');
    }

    /**
     * List all sessions
     *
     * @return array Sessions list
     */
    public function listSessions(): array
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->get("{$this->baseUrl}/admin/sessions");

        if (!$response->successful()) {
            Log::error('Failed to list sessions', [
                'status' => $response->status(),
            ]);
            return [];
        }

        return $response->json('data.sessions', []);
    }

    /**
     * Disconnect a session
     *
     * @param string $instanceToken Instance identifier
     * @param string $reason Disconnect reason
     * @return bool Success status
     */
    public function disconnectSession(string $instanceToken, string $reason = 'User requested'): bool
    {
        Log::info('Disconnecting session via Go API', [
            'instance_token' => $instanceToken,
            'reason' => $reason,
        ]);

        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
                'Content-Type' => 'application/json',
            ])
            ->post("{$this->baseUrl}/admin/sessions/{$instanceToken}/disconnect", [
                'reason' => $reason,
            ]);

        if (!$response->successful()) {
            Log::error('Failed to disconnect session', [
                'instance_token' => $instanceToken,
                'status' => $response->status(),
            ]);
            return false;
        }

        Log::info('Session disconnected successfully', [
            'instance_token' => $instanceToken,
        ]);

        return true;
    }

    /**
     * Delete a session
     *
     * @param string $instanceToken Instance identifier
     * @return bool Success status
     */
    public function deleteSession(string $instanceToken): bool
    {
        Log::info('Deleting session via Go API', [
            'instance_token' => $instanceToken,
        ]);

        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->delete("{$this->baseUrl}/admin/sessions/{$instanceToken}");

        if (!$response->successful()) {
            Log::error('Failed to delete session', [
                'instance_token' => $instanceToken,
                'status' => $response->status(),
            ]);
            return false;
        }

        Log::info('Session deleted successfully', [
            'instance_token' => $instanceToken,
        ]);

        return true;
    }

    /**
     * Refresh QR code
     *
     * @param string $instanceToken Instance identifier
     * @return array QR code data
     * @throws \Exception
     */
    public function refreshQrCode(string $instanceToken): array
    {
        Log::info('Refreshing QR code via Go API', [
            'instance_token' => $instanceToken,
        ]);

        $response = Http::timeout(30)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->post("{$this->baseUrl}/admin/sessions/{$instanceToken}/qr/refresh");

        if (!$response->successful()) {
            $error = $response->json('error') ?? $response->body();
            throw new \Exception("Failed to refresh QR code: {$error}");
        }

        return $response->json('data');
    }

    /**
     * Cancel QR code generation
     *
     * @param string $instanceToken Instance identifier
     * @return bool Success status
     */
    public function cancelQrCode(string $instanceToken): bool
    {
        $response = Http::timeout(10)
            ->withHeaders([
                'Authorization' => "Bearer {$this->adminToken}",
            ])
            ->delete("{$this->baseUrl}/admin/sessions/{$instanceToken}/qr");

        return $response->successful();
    }

    /**
     * Check if Go API is healthy
     *
     * @return bool Health status
     */
    public function isHealthy(): bool
    {
        try {
            $response = Http::timeout(5)
                ->get("{$this->baseUrl}/health");

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Go API health check failed', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
