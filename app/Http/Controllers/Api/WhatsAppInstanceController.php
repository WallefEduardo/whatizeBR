<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppInstance;
use App\Services\WhatsApp\WhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WhatsAppInstanceController extends Controller
{
    public function __construct(
        private WhatsAppService $whatsappService
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
                'user_id' => 'required|exists:users,id',
            ]);

            $token = Str::random(32);

            $instance = WhatsAppInstance::create([
                'name' => $validated['name'],
                'token' => $token,
                'user_id' => $validated['user_id'],
                'status' => 'disconnected',
                'settings' => [
                    'webhook_url' => null,
                    'auto_reply' => false,
                ],
            ]);

            Log::info('WhatsApp instance created', [
                'instance_id' => $instance->id,
                'token' => $token,
                'user_id' => $validated['user_id'],
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $instance->id,
                    'name' => $instance->name,
                    'token' => $instance->token,
                    'status' => $instance->status,
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
                'message' => 'Failed to create instance',
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
            $instance = WhatsAppInstance::where('token', $token)->firstOrFail();

            // In a real implementation, this would communicate with the Go Connection Service
            // For now, we return a placeholder response

            Log::info('QR Code requested', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
            ]);

            if ($instance->status === 'connected') {
                return response()->json([
                    'success' => false,
                    'message' => 'Instance is already connected',
                ], 400);
            }

            // Update status to connecting
            $instance->update(['status' => 'connecting']);

            return response()->json([
                'success' => true,
                'data' => [
                    'qr_code' => $instance->qr_code,
                    'status' => $instance->status,
                    'expires_at' => now()->addMinutes(2)->toIso8601String(),
                ],
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Instance not found',
            ], 404);

        } catch (\Exception $e) {
            Log::error('Failed to get QR Code', [
                'token' => $token,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get QR Code',
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
            $instance = WhatsAppInstance::where('token', $token)->firstOrFail();

            Log::info('Status requested', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $instance->id,
                    'name' => $instance->name,
                    'status' => $instance->status,
                    'phone_number' => $instance->phone_number,
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
     * Disconnect and delete WhatsApp instance
     *
     * DELETE /api/whatsapp/instances/{token}
     */
    public function destroy(string $token): JsonResponse
    {
        try {
            $instance = WhatsAppInstance::where('token', $token)->firstOrFail();

            Log::info('Disconnecting and deleting instance', [
                'instance_id' => $instance->id,
                'status' => $instance->status,
            ]);

            // In a real implementation, this would send a disconnect command to the Go Connection Service
            // via RabbitMQ before deleting the database record

            $instance->delete();

            Log::info('Instance deleted successfully', [
                'instance_id' => $instance->id,
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
                'message' => 'Failed to delete instance',
            ], 500);
        }
    }
}
