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

class SendWhatsAppListMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Message $message
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $instance = $this->message->instance;

            // Check if instance is connected
            if (!in_array($instance->status, ['connected', 'authenticated'])) {
                $this->message->markAsFailed('Instance is not connected');
                Log::warning("Cannot send list message: instance not connected", [
                    'message_id' => $this->message->id,
                    'instance_id' => $instance->id,
                ]);
                return;
            }

            // Validate metadata contains sections
            $metadata = $this->message->metadata ?? [];
            if (empty($metadata['sections']) || !is_array($metadata['sections'])) {
                $this->message->markAsFailed('Sections are required in metadata');
                return;
            }

            // Prepare request payload
            $payload = [
                'number' => $this->message->to_phone,
                'title' => $metadata['title'] ?? 'Menu',
                'description' => $this->message->content ?? '',
                'buttonText' => $metadata['buttonText'] ?? 'Ver opções',
                'footerText' => $metadata['footer'] ?? '',
                'sections' => $this->formatSections($metadata['sections']),
            ];

            // Send request to Evolution API
            $response = Http::withHeaders([
                'apikey' => config('whatsapp.evolution_api_key'),
            ])->post(
                config('whatsapp.evolution_api_url') . "/message/sendList/{$instance->token}",
                $payload
            );

            if (!$response->successful()) {
                $errorMessage = $response->json('message') ?? 'Failed to send list message';
                $this->message->markAsFailed($errorMessage);

                Log::error("Failed to send WhatsApp list message", [
                    'message_id' => $this->message->id,
                    'status' => $response->status(),
                    'error' => $errorMessage,
                    'response' => $response->body(),
                ]);

                return;
            }

            $data = $response->json();

            // Update message with API response
            $this->message->update([
                'message_id' => $data['key']['id'] ?? null,
                'status' => 'sent',
                'sent_at' => now(),
                'metadata' => array_merge($this->message->metadata ?? [], [
                    'api_response' => $data,
                ]),
            ]);

            // Update conversation's last message
            $this->updateConversationLastMessage();

            Log::info("WhatsApp list message sent successfully", [
                'message_id' => $this->message->id,
                'whatsapp_message_id' => $this->message->message_id,
            ]);
        } catch (\Exception $e) {
            $this->message->markAsFailed($e->getMessage());

            Log::error("Error sending WhatsApp list message", [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Format sections for Evolution API
     */
    protected function formatSections(array $sections): array
    {
        return array_map(function ($section) {
            return [
                'title' => $section['title'] ?? 'Opções',
                'rows' => $this->formatRows($section['rows'] ?? []),
            ];
        }, $sections);
    }

    /**
     * Format rows for Evolution API
     */
    protected function formatRows(array $rows): array
    {
        return array_map(function ($row) {
            return [
                'title' => $row['title'] ?? $row['text'] ?? 'Item',
                'description' => $row['description'] ?? '',
                'rowId' => $row['id'] ?? uniqid('row_'),
            ];
        }, $rows);
    }

    /**
     * Update conversation's last message reference
     */
    protected function updateConversationLastMessage(): void
    {
        $conversation = $this->message->conversation;

        $conversation->update([
            'last_message_id' => $this->message->id,
            'last_message_at' => $this->message->created_at,
        ]);
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("SendWhatsAppListMessage job failed permanently", [
            'message_id' => $this->message->id,
            'error' => $exception->getMessage(),
        ]);
    }
}
