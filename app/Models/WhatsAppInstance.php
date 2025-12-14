<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WhatsAppInstance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'phone',
        'status',
        'instance_key',
        'qr_code',
        'connected_at',
        'webhook_config',
        'is_active',
    ];

    protected $casts = [
        'webhook_config' => 'array',
        'connected_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Get all members associated with this WhatsApp instance
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'whatsapp_instance_id');
    }

    /**
     * Get all contacts for this WhatsApp instance
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class, 'whatsapp_instance_id');
    }

    /**
     * Get all conversations for this WhatsApp instance
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'whatsapp_instance_id');
    }

    /**
     * Scope to get only active instances
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only connected instances
     */
    public function scopeConnected($query)
    {
        return $query->where('status', 'connected');
    }

    /**
     * Check if instance is connected
     */
    public function isConnected(): bool
    {
        return $this->status === 'connected';
    }

    /**
     * Check if instance is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }
}
