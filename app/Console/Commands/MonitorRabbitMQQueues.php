<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use Illuminate\Support\Facades\Log;

class MonitorRabbitMQQueues extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'rabbitmq:monitor-queues
                            {--interval=30 : Check interval in seconds}
                            {--threshold=1000 : Alert threshold for message count}
                            {--queues=* : Specific queues to monitor (default: all)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor RabbitMQ queue metrics and alert on issues';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $interval = (int) $this->option('interval');
        $threshold = (int) $this->option('threshold');
        $specificQueues = $this->option('queues');

        $this->info("Starting RabbitMQ Queue Monitor");
        $this->info("Interval: {$interval}s | Threshold: {$threshold} messages");
        $this->newLine();

        // Queues to monitor
        $queuesToMonitor = !empty($specificQueues) ? $specificQueues : [
            'whatsapp.replica.1',
            'whatsapp.replica.2',
            'whatsapp.webhook',
        ];

        while (true) {
            try {
                $connection = new AMQPStreamConnection(
                    config('rabbitmq.host'),
                    config('rabbitmq.port'),
                    config('rabbitmq.login'),
                    config('rabbitmq.password'),
                    config('rabbitmq.vhost')
                );

                $channel = $connection->channel();

                $this->info("[" . now()->format('Y-m-d H:i:s') . "] Checking queue metrics...");

                foreach ($queuesToMonitor as $queueName) {
                    $this->checkQueue($channel, $queueName, $threshold);
                }

                $channel->close();
                $connection->close();

                $this->newLine();

            } catch (\Exception $e) {
                $this->error("Error monitoring queues: " . $e->getMessage());
                Log::error('RabbitMQ Monitor Error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }

            // Wait for next check
            sleep($interval);
        }

        return Command::SUCCESS;
    }

    /**
     * Check queue metrics and alert if needed
     */
    private function checkQueue($channel, string $queueName, int $threshold): void
    {
        try {
            // Declare queue passively to get info without creating
            [$queue, $messageCount, $consumerCount] = $channel->queue_declare(
                $queueName,
                true,  // passive - don't create, just check
                true,  // durable
                false, // exclusive
                false  // auto_delete
            );

            // Calculate utilization
            $utilization = $threshold > 0 ? ($messageCount / $threshold) * 100 : 0;
            $warningThreshold = (int) ($threshold * 0.7);

            // Determine status
            $status = '✓ HEALTHY';
            $statusColor = 'green';

            if ($consumerCount === 0) {
                $status = '✗ CRITICAL - NO CONSUMERS';
                $statusColor = 'red';

                Log::critical('RabbitMQ Queue Critical', [
                    'queue' => $queueName,
                    'issue' => 'No consumers connected',
                    'message_count' => $messageCount,
                ]);
            } elseif ($messageCount >= $threshold) {
                $status = '✗ CRITICAL - THRESHOLD EXCEEDED';
                $statusColor = 'red';

                Log::critical('RabbitMQ Queue Critical', [
                    'queue' => $queueName,
                    'message_count' => $messageCount,
                    'threshold' => $threshold,
                ]);
            } elseif ($messageCount >= $warningThreshold) {
                $status = '⚠ WARNING - APPROACHING THRESHOLD';
                $statusColor = 'yellow';

                Log::warning('RabbitMQ Queue Warning', [
                    'queue' => $queueName,
                    'message_count' => $messageCount,
                    'warning_threshold' => $warningThreshold,
                ]);
            }

            // Display queue info
            $this->line(sprintf(
                "  Queue: <comment>%-30s</comment> | Messages: <info>%5d</info> | Consumers: <info>%2d</info> | Utilization: <info>%5.1f%%</info> | %s",
                $queueName,
                $messageCount,
                $consumerCount,
                $utilization,
                "<fg={$statusColor}>{$status}</>"
            ));

        } catch (\PhpAmqpLib\Exception\AMQPProtocolChannelException $e) {
            if ($e->getCode() === 404) {
                $this->warn("  Queue: {$queueName} - NOT FOUND (may not be created yet)");
            } else {
                $this->error("  Queue: {$queueName} - Error: " . $e->getMessage());
            }
        } catch (\Exception $e) {
            $this->error("  Queue: {$queueName} - Unexpected error: " . $e->getMessage());
        }
    }

    /**
     * Get queue statistics from RabbitMQ Management API
     */
    private function getQueueStats(string $queueName): ?array
    {
        try {
            $managementUrl = sprintf(
                'http://%s:15672/api/queues/%s/%s',
                config('rabbitmq.host'),
                urlencode(config('rabbitmq.vhost')),
                urlencode($queueName)
            );

            $ch = curl_init($managementUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_USERPWD, config('rabbitmq.login') . ':' . config('rabbitmq.password'));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                return json_decode($response, true);
            }

            return null;

        } catch (\Exception $e) {
            return null;
        }
    }
}
