<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'instance_id',
        'contact_id',
        'assigned_to',
        'department_id',
        'status',
        'is_group',
        'group_name',
        'group_avatar_url',
        'unread_count',
        'last_message_id',
        'last_message_at',
        'closed_at',
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'unread_count' => 'integer',
        'last_message_at' => 'datetime',
        'closed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the WhatsApp instance that owns this conversation
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Get the contact for this conversation
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class, 'contact_id');
    }

    /**
     * Get the user assigned to this conversation
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the department for this conversation
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /**
     * Get all messages for this conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conversation_id');
    }

    /**
     * Get the last message for this conversation
     */
    public function lastMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'last_message_id');
    }

    /**
     * Get all tags associated with this conversation
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'conversation_tag')
            ->withTimestamps();
    }

    /**
     * Scope a query to filter by status
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by open conversations
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope a query to filter by pending conversations
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to filter by closed conversations
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope a query to filter by assigned user
     */
    public function scopeAssignedTo($query, string $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope a query to filter by unassigned conversations
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_to');
    }

    /**
     * Scope a query to filter by department
     */
    public function scopeDepartment($query, string $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * Scope a query to filter by tags
     */
    public function scopeWithTags($query, array $tagIds)
    {
        return $query->whereHas('tags', function ($q) use ($tagIds) {
            $q->whereIn('tags.id', $tagIds);
        });
    }

    /**
     * Scope a query to filter by instance
     */
    public function scopeForInstance($query, string $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }

    /**
     * Scope a query to filter by unread messages
     */
    public function scopeWithUnread($query)
    {
        return $query->where('unread_count', '>', 0);
    }

    /**
     * Scope a query to search by contact name or phone
     */
    public function scopeSearchContact($query, string $search)
    {
        return $query->whereHas('contact', function ($q) use ($search) {
            $q->where('name', 'LIKE', "%{$search}%")
                ->orWhere('phone', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope a query to order by last message
     */
    public function scopeLatestMessages($query)
    {
        return $query->orderBy('last_message_at', 'desc');
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(): void
    {
        $this->update(['unread_count' => 0]);
    }

    /**
     * Increment unread count
     */
    public function incrementUnread(): void
    {
        $this->increment('unread_count');
    }

    /**
     * Close the conversation
     */
    public function close(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }

    /**
     * Reopen the conversation
     */
    public function reopen(): void
    {
        $this->update([
            'status' => 'open',
            'closed_at' => null,
        ]);
    }

    /**
     * Assign conversation to a user
     */
    public function assignTo(?string $userId): void
    {
        $this->update(['assigned_to' => $userId]);
    }

    /**
     * Get the user that owns this conversation (through instance)
     */
    public function user()
    {
        return $this->instance->user();
    }
}
