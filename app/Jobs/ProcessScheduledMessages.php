<?php

namespace App\Jobs;

use App\Models\Schedule;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessScheduledMessages implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Schedule $schedule
    ) {
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Mark schedule as processing
        $this->schedule->markAsProcessing();

        try {
            $sentCount = 0;
            $failedCount = 0;

            // Process each recipient
            foreach ($this->schedule->recipients as $recipient) {
                try {
                    // Dispatch appropriate job based on message type
                    $this->dispatchMessageJob($recipient);
                    $sentCount++;
                } catch (\Exception $e) {
                    Log::error('Failed to send scheduled message', [
                        'schedule_id' => $this->schedule->id,
                        'recipient' => $recipient,
                        'error' => $e->getMessage(),
                    ]);
                    $failedCount++;
                }

                // Add small delay between messages to avoid rate limiting
                usleep(100000); // 100ms
            }

            // Update counts
            $this->schedule->incrementSent($sentCount);
            $this->schedule->incrementFailed($failedCount);

            // Handle recurring schedules
            if ($this->schedule->isRecurring()) {
                $nextScheduledTime = $this->schedule->getNextScheduledTime();

                if ($nextScheduledTime) {
                    // Create new schedule for next occurrence
                    Schedule::create([
                        'instance_id' => $this->schedule->instance_id,
                        'name' => $this->schedule->name,
                        'type' => $this->schedule->type,
                        'scheduled_at' => $nextScheduledTime,
                        'recipients' => $this->schedule->recipients,
                        'message_type' => $this->schedule->message_type,
                        'message_content' => $this->schedule->message_content,
                        'media_url' => $this->schedule->media_url,
                        'status' => 'pending',
                    ]);
                }
            }

            // Mark as completed
            $this->schedule->markAsCompleted();

            Log::info('Scheduled messages processed successfully', [
                'schedule_id' => $this->schedule->id,
                'sent' => $sentCount,
                'failed' => $failedCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to process scheduled messages', [
                'schedule_id' => $this->schedule->id,
                'error' => $e->getMessage(),
            ]);

            $this->schedule->markAsFailed();
            throw $e;
        }
    }

    /**
     * Dispatch appropriate message job based on message type.
     */
    protected function dispatchMessageJob(string $recipient): void
    {
        $jobClass = match ($this->schedule->message_type) {
            'text' => SendWhatsAppTextMessage::class,
            'image' => SendWhatsAppMediaMessage::class,
            'video' => SendWhatsAppMediaMessage::class,
            'document' => SendWhatsAppMediaMessage::class,
            default => throw new \Exception('Invalid message type'),
        };

        $jobClass::dispatch(
            instanceId: $this->schedule->instance_id,
            to: $recipient,
            content: $this->schedule->message_content,
            mediaUrl: $this->schedule->media_url,
            mediaType: $this->schedule->message_type,
        );
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessScheduledMessages job failed', [
            'schedule_id' => $this->schedule->id,
            'error' => $exception->getMessage(),
        ]);

        $this->schedule->markAsFailed();
    }
}
