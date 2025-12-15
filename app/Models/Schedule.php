<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Schedule extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'instance_id',
        'name',
        'type',
        'scheduled_at',
        'recipients',
        'message_type',
        'message_content',
        'media_url',
        'status',
        'sent_count',
        'failed_count',
    ];

    protected $casts = [
        'recipients' => 'array',
        'scheduled_at' => 'datetime',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
    ];

    /**
     * Get the WhatsApp instance that owns the schedule.
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Scope to get pending schedules that should be processed.
     */
    public function scopeDue($query)
    {
        return $query->where('status', 'pending')
            ->where('scheduled_at', '<=', now());
    }

    /**
     * Scope to get schedules by type.
     */
    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get schedules by status.
     */
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Check if the schedule is recurring.
     */
    public function isRecurring(): bool
    {
        return in_array($this->type, ['daily', 'weekly', 'monthly']);
    }

    /**
     * Get the next scheduled time for recurring schedules.
     */
    public function getNextScheduledTime(): ?\DateTime
    {
        if (!$this->isRecurring()) {
            return null;
        }

        $current = clone $this->scheduled_at;

        return match ($this->type) {
            'daily' => $current->addDay(),
            'weekly' => $current->addWeek(),
            'monthly' => $current->addMonth(),
            default => null,
        };
    }

    /**
     * Mark the schedule as processing.
     */
    public function markAsProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    /**
     * Mark the schedule as completed.
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }

    /**
     * Mark the schedule as failed.
     */
    public function markAsFailed(): void
    {
        $this->update(['status' => 'failed']);
    }

    /**
     * Increment sent count.
     */
    public function incrementSent(int $count = 1): void
    {
        $this->increment('sent_count', $count);
    }

    /**
     * Increment failed count.
     */
    public function incrementFailed(int $count = 1): void
    {
        $this->increment('failed_count', $count);
    }
}
