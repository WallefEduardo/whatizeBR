<?php

namespace App\Jobs;

use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendMediaMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $instanceKey,
        public string $toPhone,
        public string $mediaUrl,
        public string $mediaType,
        public ?string $caption = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(RabbitMQService $rabbitMQService): void
    {
        try {
            $payload = [
                'instance_id' => $this->instanceKey,
                'to' => $this->toPhone,
                'media_url' => $this->mediaUrl,
                'media_type' => $this->mediaType,
                'caption' => $this->caption,
                'type' => 'media',
                'timestamp' => now()->toIso8601String(),
            ];

            $rabbitMQService->publishWithRoutingKey('send.media', $payload);

            Log::info('SendMediaMessageJob completed successfully', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'media_type' => $this->mediaType,
            ]);
        } catch (\Exception $e) {
            Log::error('SendMediaMessageJob failed', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
