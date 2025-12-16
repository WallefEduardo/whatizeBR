<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppMediaMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(
        public Message $message
    ) {}

    public function handle(): void
    {
        try {
            $response = Http::timeout(60)
                ->post('whatsapp-api/messages/send', [
                    'to' => $this->message->to_phone,
                    'type' => $this->message->type,
                    'media_url' => $this->message->media_url,
                    'caption' => $this->message->caption,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                $this->message->update([
                    'status' => 'sent',
                    'message_id' => $data['message_id'] ?? null,
                    'sent_at' => now(),
                ]);
            } else {
                throw new \Exception('API returned error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp media message', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
            ]);

            $this->message->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'failed_at' => now(),
            ]);

            throw $e;
        }
    }
}
