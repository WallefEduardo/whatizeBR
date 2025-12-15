<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'instance_id',
        'department_id',
        'is_active',
        'max_concurrent_chats',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'max_concurrent_chats' => 'integer',
    ];

    /**
     * Get the user that owns the member
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the instance that owns the member
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class);
    }

    /**
     * Get the department for this member
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get all conversations assigned to this member
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'assigned_to', 'user_id');
    }

    /**
     * Get active conversations for this member
     */
    public function activeConversations(): HasMany
    {
        return $this->conversations()->whereIn('status', ['open', 'pending']);
    }

    /**
     * Scope query to only active members
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope query to filter by instance
     */
    public function scopeForInstance($query, int $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }

    /**
     * Scope query to filter by department
     */
    public function scopeInDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Check if member can receive new conversations
     */
    public function canReceiveConversation(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        $activeCount = $this->activeConversations()->count();

        return $activeCount < $this->max_concurrent_chats;
    }

    /**
     * Get current active conversations count
     */
    public function getActiveConversationsCountAttribute(): int
    {
        return $this->activeConversations()->count();
    }

    /**
     * Get available slots for new conversations
     */
    public function getAvailableSlotsAttribute(): int
    {
        return max(0, $this->max_concurrent_chats - $this->active_conversations_count);
    }
}
