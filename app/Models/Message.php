<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'instance_id',
        'conversation_id',
        'message_id',
        'direction',
        'from_phone',
        'to_phone',
        'type',
        'content',
        'media_url',
        'media_type',
        'media_size',
        'thumbnail_url',
        'caption',
        'latitude',
        'longitude',
        'replied_to_message_id',
        'metadata',
        'status',
        'error_message',
        'sent_at',
        'delivered_at',
        'read_at',
        'failed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'media_size' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'read_at' => 'datetime',
        'failed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the WhatsApp instance that owns this message
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Get the conversation that owns this message
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    /**
     * Get the message this is replying to
     */
    public function repliedToMessage(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'replied_to_message_id');
    }

    /**
     * Get all replies to this message
     */
    public function replies()
    {
        return $this->hasMany(Message::class, 'replied_to_message_id');
    }

    /**
     * Scope a query to filter by direction
     */
    public function scopeDirection($query, string $direction)
    {
        return $query->where('direction', $direction);
    }

    /**
     * Scope a query to filter inbound messages
     */
    public function scopeInbound($query)
    {
        return $query->where('direction', 'inbound');
    }

    /**
     * Scope a query to filter outbound messages
     */
    public function scopeOutbound($query)
    {
        return $query->where('direction', 'outbound');
    }

    /**
     * Scope a query to filter by type
     */
    public function scopeType($query, string $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to filter by status
     */
    public function scopeStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter pending messages
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to filter sent messages
     */
    public function scopeSent($query)
    {
        return $query->where('status', 'sent');
    }

    /**
     * Scope a query to filter delivered messages
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * Scope a query to filter read messages
     */
    public function scopeRead($query)
    {
        return $query->where('status', 'read');
    }

    /**
     * Scope a query to filter failed messages
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Scope a query to filter by conversation
     */
    public function scopeForConversation($query, string $conversationId)
    {
        return $query->where('conversation_id', $conversationId);
    }

    /**
     * Scope a query to filter by instance
     */
    public function scopeForInstance($query, string $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }

    /**
     * Scope a query to order by latest
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope a query to order by oldest
     */
    public function scopeOldest($query)
    {
        return $query->orderBy('created_at', 'asc');
    }

    /**
     * Mark message as sent
     */
    public function markAsSent(): void
    {
        $this->update([
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * Mark message as delivered
     */
    public function markAsDelivered(): void
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(): void
    {
        $this->update([
            'status' => 'read',
            'read_at' => now(),
        ]);
    }

    /**
     * Mark message as failed
     */
    public function markAsFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'failed_at' => now(),
        ]);
    }

    /**
     * Check if message is inbound
     */
    public function isInbound(): bool
    {
        return $this->direction === 'inbound';
    }

    /**
     * Check if message is outbound
     */
    public function isOutbound(): bool
    {
        return $this->direction === 'outbound';
    }

    /**
     * Check if message has media
     */
    public function hasMedia(): bool
    {
        return in_array($this->type, ['image', 'video', 'audio', 'document', 'sticker']);
    }

    /**
     * Check if message is a reply
     */
    public function isReply(): bool
    {
        return !is_null($this->replied_to_message_id);
    }

    /**
     * Get formatted phone numbers
     */
    public function getFromPhoneFormattedAttribute(): string
    {
        return $this->formatPhone($this->from_phone);
    }

    public function getToPhoneFormattedAttribute(): string
    {
        return $this->formatPhone($this->to_phone);
    }

    /**
     * Format phone number
     */
    protected function formatPhone(string $phone): string
    {
        // Remove non-numeric characters
        $cleaned = preg_replace('/\D/', '', $phone);

        // Format as +XX (XX) XXXXX-XXXX for Brazilian numbers
        if (strlen($cleaned) === 13 && substr($cleaned, 0, 2) === '55') {
            return sprintf(
                '+%s (%s) %s-%s',
                substr($cleaned, 0, 2),
                substr($cleaned, 2, 2),
                substr($cleaned, 4, 5),
                substr($cleaned, 9, 4)
            );
        }

        return $phone;
    }
}
