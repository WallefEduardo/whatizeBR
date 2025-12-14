<?php

namespace App\Jobs;

use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendButtonMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $instanceKey,
        public string $toPhone,
        public string $message,
        public array $buttons
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
                'buttons' => $this->buttons,
                'type' => 'button',
                'timestamp' => now()->toIso8601String(),
            ];

            $rabbitMQService->publishWithRoutingKey('send.button', $payload);

            Log::info('SendButtonMessageJob completed successfully', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'button_count' => count($this->buttons),
            ]);
        } catch (\Exception $e) {
            Log::error('SendButtonMessageJob failed', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
