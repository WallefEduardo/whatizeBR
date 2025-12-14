<?php

namespace App\Jobs;

use App\Services\RabbitMQ\RabbitMQService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendTextMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public string $instanceKey,
        public string $toPhone,
        public string $message
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
                'type' => 'text',
                'timestamp' => now()->toIso8601String(),
            ];

            $rabbitMQService->publishWithRoutingKey('send.text', $payload);

            Log::info('SendTextMessageJob completed successfully', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
            ]);
        } catch (\Exception $e) {
            Log::error('SendTextMessageJob failed', [
                'instance_key' => $this->instanceKey,
                'to' => $this->toPhone,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
