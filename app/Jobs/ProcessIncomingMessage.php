<?php

namespace App\Jobs;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\WhatsAppInstance;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessIncomingMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public array $webhookData
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Extract message data from webhook
            $messageData = $this->webhookData['data'] ?? $this->webhookData;

            // Get instance by token
            $instanceToken = $this->webhookData['instance'] ?? null;
            if (!$instanceToken) {
                Log::warning("No instance token in webhook data");
                return;
            }

            $instance = WhatsAppInstance::where('token', $instanceToken)->first();
            if (!$instance) {
                Log::warning("Instance not found", ['token' => $instanceToken]);
                return;
            }

            // Extract message details
            $messageId = $messageData['key']['id'] ?? null;
            $fromPhone = $this->normalizePhone($messageData['key']['remoteJid'] ?? null);
            $toPhone = $instance->phone_number ?? $this->normalizePhone($messageData['key']['participant'] ?? null);

            if (!$messageId || !$fromPhone) {
                Log::warning("Missing required message fields", $messageData);
                return;
            }

            // Check if message already exists
            if (Message::where('message_id', $messageId)->exists()) {
                Log::info("Message already processed", ['message_id' => $messageId]);
                return;
            }

            // Get or create contact
            $contact = $this->getOrCreateContact($instance, $fromPhone, $messageData);

            // Get or create conversation
            $conversation = $this->getOrCreateConversation($instance, $contact);

            // Extract message content and type
            $messageInfo = $this->extractMessageInfo($messageData);

            // Create message
            $message = Message::create([
                'instance_id' => $instance->id,
                'conversation_id' => $conversation->id,
                'message_id' => $messageId,
                'direction' => 'inbound',
                'from_phone' => $fromPhone,
                'to_phone' => $toPhone,
                'type' => $messageInfo['type'],
                'content' => $messageInfo['content'],
                'media_url' => $messageInfo['media_url'] ?? null,
                'media_type' => $messageInfo['media_type'] ?? null,
                'media_size' => $messageInfo['media_size'] ?? null,
                'thumbnail_url' => $messageInfo['thumbnail_url'] ?? null,
                'caption' => $messageInfo['caption'] ?? null,
                'latitude' => $messageInfo['latitude'] ?? null,
                'longitude' => $messageInfo['longitude'] ?? null,
                'replied_to_message_id' => $this->getReplyToMessageId($messageData),
                'metadata' => [
                    'webhook_data' => $messageData,
                    'timestamp' => $messageData['messageTimestamp'] ?? null,
                ],
                'status' => 'delivered',
                'delivered_at' => now(),
            ]);

            // Update conversation
            $conversation->update([
                'last_message_id' => $message->id,
                'last_message_at' => $message->created_at,
            ]);

            // Increment unread count
            $conversation->incrementUnread();

            // Update contact's last interaction
            $contact->update([
                'last_interaction_at' => now(),
            ]);

            Log::info("Incoming message processed successfully", [
                'message_id' => $message->id,
                'whatsapp_message_id' => $messageId,
                'conversation_id' => $conversation->id,
            ]);

            // TODO: Dispatch event for real-time updates
            // event(new MessageReceived($message));

        } catch (\Exception $e) {
            Log::error("Error processing incoming message", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'webhook_data' => $this->webhookData,
            ]);

            throw $e;
        }
    }

    /**
     * Get or create contact
     */
    protected function getOrCreateContact(WhatsAppInstance $instance, string $phone, array $messageData): Contact
    {
        $pushName = $messageData['pushName'] ?? null;

        return Contact::firstOrCreate(
            [
                'instance_id' => $instance->id,
                'phone' => $phone,
            ],
            [
                'name' => $pushName,
            ]
        );
    }

    /**
     * Get or create conversation
     */
    protected function getOrCreateConversation(WhatsAppInstance $instance, Contact $contact): Conversation
    {
        return Conversation::firstOrCreate(
            [
                'instance_id' => $instance->id,
                'contact_id' => $contact->id,
            ],
            [
                'status' => 'open',
            ]
        );
    }

    /**
     * Extract message information based on type
     */
    protected function extractMessageInfo(array $messageData): array
    {
        $message = $messageData['message'] ?? [];

        // Text message
        if (isset($message['conversation'])) {
            return [
                'type' => 'text',
                'content' => $message['conversation'],
            ];
        }

        // Extended text (with preview)
        if (isset($message['extendedTextMessage'])) {
            return [
                'type' => 'text',
                'content' => $message['extendedTextMessage']['text'] ?? '',
            ];
        }

        // Image
        if (isset($message['imageMessage'])) {
            return [
                'type' => 'image',
                'content' => null,
                'caption' => $message['imageMessage']['caption'] ?? null,
                'media_url' => $message['imageMessage']['url'] ?? null,
                'media_type' => $message['imageMessage']['mimetype'] ?? 'image/jpeg',
                'media_size' => $message['imageMessage']['fileLength'] ?? null,
                'thumbnail_url' => $message['imageMessage']['jpegThumbnail'] ?? null,
            ];
        }

        // Video
        if (isset($message['videoMessage'])) {
            return [
                'type' => 'video',
                'content' => null,
                'caption' => $message['videoMessage']['caption'] ?? null,
                'media_url' => $message['videoMessage']['url'] ?? null,
                'media_type' => $message['videoMessage']['mimetype'] ?? 'video/mp4',
                'media_size' => $message['videoMessage']['fileLength'] ?? null,
                'thumbnail_url' => $message['videoMessage']['jpegThumbnail'] ?? null,
            ];
        }

        // Audio
        if (isset($message['audioMessage'])) {
            return [
                'type' => 'audio',
                'content' => null,
                'media_url' => $message['audioMessage']['url'] ?? null,
                'media_type' => $message['audioMessage']['mimetype'] ?? 'audio/ogg',
                'media_size' => $message['audioMessage']['fileLength'] ?? null,
            ];
        }

        // Document
        if (isset($message['documentMessage'])) {
            return [
                'type' => 'document',
                'content' => $message['documentMessage']['fileName'] ?? null,
                'media_url' => $message['documentMessage']['url'] ?? null,
                'media_type' => $message['documentMessage']['mimetype'] ?? 'application/octet-stream',
                'media_size' => $message['documentMessage']['fileLength'] ?? null,
            ];
        }

        // Location
        if (isset($message['locationMessage'])) {
            return [
                'type' => 'location',
                'content' => $message['locationMessage']['name'] ?? 'Location',
                'latitude' => $message['locationMessage']['degreesLatitude'] ?? null,
                'longitude' => $message['locationMessage']['degreesLongitude'] ?? null,
            ];
        }

        // Sticker
        if (isset($message['stickerMessage'])) {
            return [
                'type' => 'sticker',
                'content' => null,
                'media_url' => $message['stickerMessage']['url'] ?? null,
                'media_type' => 'image/webp',
            ];
        }

        // Reaction
        if (isset($message['reactionMessage'])) {
            return [
                'type' => 'reaction',
                'content' => $message['reactionMessage']['text'] ?? '👍',
            ];
        }

        // Default fallback
        return [
            'type' => 'text',
            'content' => json_encode($message),
        ];
    }

    /**
     * Get replied-to message ID if this is a reply
     */
    protected function getReplyToMessageId(array $messageData): ?string
    {
        $quotedId = $messageData['message']['extendedTextMessage']['contextInfo']['stanzaId'] ?? null;

        if ($quotedId) {
            $message = Message::where('message_id', $quotedId)->first();
            return $message?->id;
        }

        return null;
    }

    /**
     * Normalize phone number
     */
    protected function normalizePhone(?string $phone): ?string
    {
        if (!$phone) {
            return null;
        }

        // Remove @c.us or @s.whatsapp.net suffix
        $phone = preg_replace('/@.*$/', '', $phone);

        // Keep only digits
        $phone = preg_replace('/\D/', '', $phone);

        return $phone ?: null;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessIncomingMessage job failed permanently", [
            'error' => $exception->getMessage(),
            'webhook_data' => $this->webhookData,
        ]);
    }
}
