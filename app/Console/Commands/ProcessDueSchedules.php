<?php

namespace App\Console\Commands;

use App\Jobs\ProcessScheduledMessages;
use App\Models\Schedule;
use Illuminate\Console\Command;

class ProcessDueSchedules extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'schedules:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process due scheduled messages';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Processing due schedules...');

        // Get all due schedules (pending and scheduled_at <= now)
        $dueSchedules = Schedule::due()->get();

        if ($dueSchedules->isEmpty()) {
            $this->info('No due schedules found.');
            return 0;
        }

        $this->info("Found {$dueSchedules->count()} due schedule(s).");

        $processed = 0;

        foreach ($dueSchedules as $schedule) {
            try {
                // Dispatch job to process this schedule
                ProcessScheduledMessages::dispatch($schedule);
                $processed++;

                $this->info("Dispatched job for schedule: {$schedule->name} (ID: {$schedule->id})");
            } catch (\Exception $e) {
                $this->error("Failed to dispatch job for schedule {$schedule->id}: {$e->getMessage()}");
            }
        }

        $this->info("Successfully dispatched {$processed} schedule(s) for processing.");

        return 0;
    }
}
