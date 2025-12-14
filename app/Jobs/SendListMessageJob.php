<?php

namespace App\Jobs;

use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendListMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $instanceKey,
        public string $toPhone,
        public string $message,
        public array $sections,
        public string $buttonText
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
                'message' => $this->message,
                'sections' => $this->sections,
                'button_text' => $this->buttonText,
                'type' => 'list',
                'timestamp' => now()->toIso8601String(),
            ];

            $rabbitMQService->publishWithRoutingKey('send.list', $payload);

            Log::info('SendListMessageJob completed successfully', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'section_count' => count($this->sections),
            ]);
        } catch (\Exception $e) {
            Log::error('SendListMessageJob failed', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
