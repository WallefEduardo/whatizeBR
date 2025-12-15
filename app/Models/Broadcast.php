<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Broadcast extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'instance_id',
        'user_id',
        'name',
        'filters',
        'message_type',
        'message_content',
        'media_url',
        'scheduled_at',
        'status',
        'total_recipients',
        'sent_count',
        'delivered_count',
        'read_count',
        'failed_count',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'filters' => 'array',
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Relationships
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsappInstance::class, 'instance_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(BroadcastMessage::class);
    }

    // Scopes
    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeDue($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '<=', now());
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('message_type', $type);
    }

    // Helper methods
    public function isScheduled(): bool
    {
        return !is_null($this->scheduled_at);
    }

    public function isPending(): bool
    {
        return $this->status === 'draft' || $this->status === 'scheduled';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isCancelled(): bool
    {
        return $this->status === 'cancelled';
    }

    public function getProgressPercentage(): int
    {
        if ($this->total_recipients === 0) {
            return 0;
        }

        return (int) (($this->sent_count / $this->total_recipients) * 100);
    }

    public function getSuccessRate(): float
    {
        if ($this->sent_count === 0) {
            return 0;
        }

        $successful = $this->sent_count - $this->failed_count;
        return ($successful / $this->sent_count) * 100;
    }

    // State management
    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(): void
    {
        $this->update([
            'status' => 'failed',
            'completed_at' => now(),
        ]);
    }

    public function cancel(): void
    {
        if (!$this->isPending() && !$this->isProcessing()) {
            throw new \Exception('Only pending or processing broadcasts can be cancelled.');
        }

        $this->update([
            'status' => 'cancelled',
            'completed_at' => now(),
        ]);
    }

    // Counter methods
    public function incrementSent(): void
    {
        $this->increment('sent_count');
    }

    public function incrementDelivered(): void
    {
        $this->increment('delivered_count');
    }

    public function incrementRead(): void
    {
        $this->increment('read_count');
    }

    public function incrementFailed(): void
    {
        $this->increment('failed_count');
    }
}
