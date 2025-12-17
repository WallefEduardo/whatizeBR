<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppInstance;
use App\Services\WhatsApp\GoApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WhatsAppInstanceController extends Controller
{
    public function __construct(
        private GoApiService $goApi
    ) {}

    /**
     * Create a new WhatsApp instance
     *
     * POST /api/whatsapp/instances
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
            ]);

            // Use authenticated user ID (from session or Sanctum)
            $userId = auth()->id() ?? $request->user()?->id ?? 1; // Fallback to admin user

            // Generate unique instance token
            $instanceToken = 'inst_' . uniqid() . '_' . Str::random(16);

            // Create session in Go API first
            $goSession = $this->goApi->createSession($instanceToken);

            // Create instance in Laravel database
            $instance = WhatsAppInstance::create([
                'name' => $validated['name'],
                'instance_key' => $instanceToken,
                'user_id' => $userId,
                'status' => $goSession['status'] ?? 'disconnected',
                'webhook_config' => [
                    'url' => null,
                    'secret' => Str::random(32),
                ],
            ]);

            // Clear cache
            cache()->forget('whatsapp_instances_list');

            Log::info('WhatsApp instance created', [
                'instance_id' => $instance->id,
                'token' => $instanceToken,
                'user_id' => $userId,
                'go_status' => $goSession['status'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $instance->id,
                    'name' => $instance->name,
                    'instance_key' => $instance->instance_key,
                    'status' => $instance->status,
                    'phone' => $instance->phone,
                    'created_at' => $instance->created_at,
                ],
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Failed to create WhatsApp instance', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create instance: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get QR Code for WhatsApp instance
     *
     * GET /api/whatsapp/instances/{token}/qr
     */
    public function getQr(string $token): JsonResponse
    {
        try {
            $instance = WhatsAppInstance::where('instance_key', $token)->firstOrFail();

            Log::info('QR Code requested', [
                'instance_id' => $instance->id,
                'token' => $token,
                'status' => $instance->status,
            ]);

            if ($instance->status === 'authenticated') {
                return response()->json([
                    'success' => false,
                    'message' => 'Instance is already authenticated',
                ], 400);
            }

            // Generate QR code via Go API
            $qrData = $this->goApi->generateQrCode($token);

            // Update instance status and QR code
            $instance->update([
                'status' => 'connecting',
                'qr_code' => $qrData['qr_code'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'qr_code' => $qrData['qr_code'],
                    'status' => 'connecting',
                    'expires_at' => $qrData['expires_at'],
                    'generated_at' => $qrData['generated_at'],
                ],
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Instance not found',
            ], 404);

        } catch (\Exception $e) {
            $errorMsg = $e->getMessage();

            Log::error('Failed to get QR Code', [
                'token' => $token,
                'error' => $errorMsg,
            ]);

            // Check if error is "already connected"
            if (str_contains(strtolower($errorMsg), 'already connected')) {
                // Update instance status to authenticated
                $instance->update(['status' => 'authenticated']);

                return response()->json([
                    'success' => false,
                    'message' => 'Instance is already connected',
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to get QR Code: ' . $errorMsg,
            ], 500);
        }
    }

    /**
     * Get WhatsApp instance status
     *
     * GET /api/whatsapp/instances/{token}/status
     */
    public function getStatus(string $token): JsonResponse
    {
        try {
            $instance = WhatsAppInstance::where('instance_key', $token)->firstOrFail();

            // Get status from Go API
            try {
                $goStatus = $this->goApi->getSessionStatus($token);

                // Update local database with Go API status
                $instance->update([
                    'status' => $goStatus['status'] ?? $instance->status,
                    'phone_number' => $goStatus['phone_number'] ?? $instance->phone_number,
                    'connected_at' => $goStatus['connected_at'] ?? $instance->connected_at,
                ]);

                Log::info('Status synchronized from Go API', [
                    'instance_id' => $instance->id,
                    'go_status' => $goStatus['status'] ?? null,
                ]);

            } catch (\Exception $e) {
                // If Go API fails, return local database status
                Log::warning('Failed to get status from Go API, using local', [
                    'token' => $token,
                    'error' => $e->getMessage(),
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $instance->id,
                    'name' => $instance->name,
                    'instance_key' => $instance->instance_key,
                    'status' => $instance->status,
                    'phone' => $instance->phone,
                    'connected_at' => $instance->connected_at,
                    'last_seen_at' => $instance->last_seen_at,
                ],
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Instance not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to get status', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get status',
            ], 500);
        }
    }

    /**
     * Disconnect WhatsApp instance (without deleting)
     *
     * POST /api/whatsapp/instances/{token}/disconnect
     */
    public function disconnect(string $token): JsonResponse
    {
        try {
            $instance = WhatsAppInstance::where('instance_key', $token)->firstOrFail();

            Log::info('Disconnecting instance', [
                'instance_id' => $instance->id,
                'token' => $token,
                'status' => $instance->status,
            ]);

            // Disconnect session in Go API
            $disconnected = $this->goApi->disconnectSession($token, 'QR modal closed');

            if (!$disconnected) {
                Log::warning('Failed to disconnect session in Go API, updating local status anyway', [
                    'token' => $token,
                ]);
            }

            // Update local database status
            $instance->update([
                'status' => 'disconnected',
                'qr_code' => null,
            ]);

            Log::info('Instance disconnected successfully', [
                'instance_id' => $instance->id,
                'go_disconnected' => $disconnected,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Instance disconnected successfully',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Instance not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to disconnect instance', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to disconnect instance: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Disconnect and delete WhatsApp instance
     *
     * DELETE /api/whatsapp/instances/{token}
     */
    public function destroy(string $token): JsonResponse
    {
        try {
            $instance = WhatsAppInstance::where('instance_key', $token)->firstOrFail();

            Log::info('Disconnecting and deleting instance', [
                'instance_id' => $instance->id,
                'token' => $token,
                'status' => $instance->status,
            ]);

            // Disconnect and delete session in Go API
            $goDeleted = $this->goApi->deleteSession($token);

            if (!$goDeleted) {
                Log::warning('Failed to delete session in Go API, proceeding with local delete', [
                    'token' => $token,
                ]);
            }

            // Delete from local database
            $instance->delete();

            // Clear cache
            cache()->forget('whatsapp_instances_list');

            Log::info('Instance deleted successfully', [
                'instance_id' => $instance->id,
                'go_deleted' => $goDeleted,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Instance disconnected and deleted successfully',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Instance not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to delete instance', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete instance: ' . $e->getMessage(),
            ], 500);
        }
    }
}
