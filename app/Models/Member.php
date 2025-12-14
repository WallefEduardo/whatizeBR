<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Member extends Model
{
    protected $fillable = [
        'user_id',
        'whatsapp_instance_id',
        'is_active',
        'max_concurrent_chats',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the user that owns the member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the WhatsApp instance that owns the member.
     */
    public function whatsappInstance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class);
    }

    /**
     * Scope query to only active members
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
