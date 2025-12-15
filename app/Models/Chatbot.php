<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chatbot extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'instance_id',
        'name',
        'description',
        'trigger_type',
        'trigger_value',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    /**
     * Get the instance that owns the chatbot.
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(Instance::class);
    }

    /**
     * Get the flows for the chatbot.
     */
    public function flows(): HasMany
    {
        return $this->hasMany(ChatbotFlow::class);
    }

    /**
     * Get the sessions for the chatbot.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(ChatbotSession::class);
    }

    /**
     * Scope a query to only include active chatbots.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by instance.
     */
    public function scopeForInstance($query, $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }

    /**
     * Scope a query to order by priority.
     */
    public function scopeByPriority($query)
    {
        return $query->orderBy('priority', 'desc');
    }
}
