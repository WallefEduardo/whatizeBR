<?php

namespace App\Models;

use App\Traits\Searchable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory, HasUuids, Searchable;

    /**
     * Colunas pesquisáveis
     */
    protected array $searchable = ['name', 'phone', 'email', 'notes'];

    /**
     * Colunas ordenáveis
     */
    protected array $sortable = ['name', 'phone', 'email', 'created_at', 'last_interaction_at'];

    protected $fillable = [
        'instance_id',
        'phone',
        'name',
        'avatar_url',
        'email',
        'notes',
        'custom_fields',
        'is_blocked',
        'last_interaction_at',
    ];

    protected $casts = [
        'custom_fields' => 'array',
        'is_blocked' => 'boolean',
        'last_interaction_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the WhatsApp instance that owns this contact
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Get all messages for this contact
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'contact_id');
    }

    /**
     * Get all conversations for this contact
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class, 'contact_id');
    }

    /**
     * Get all tags associated with this contact
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'contact_tag')
            ->withTimestamps();
    }

    /**
     * Scope a query to search contacts by phone, name or email using full-text search
     */
    public function scopeSearch($query, string $search)
    {
        // Use PostgreSQL full-text search for better performance
        $searchTerm = str_replace(' ', ' & ', trim($search));

        return $query->whereRaw(
            "to_tsvector('portuguese', COALESCE(name, '') || ' ' || COALESCE(phone, '') || ' ' || COALESCE(email, '')) @@ plainto_tsquery('portuguese', ?)",
            [$search]
        );
    }

    /**
     * Scope a query for simple LIKE search (fallback)
     */
    public function scopeSimpleSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('phone', 'LIKE', "%{$search}%")
                ->orWhere('name', 'LIKE', "%{$search}%")
                ->orWhere('email', 'LIKE', "%{$search}%");
        });
    }

    /**
     * Scope a query to filter by blocked status
     */
    public function scopeBlocked($query, bool $blocked = true)
    {
        return $query->where('is_blocked', $blocked);
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
     * Get the user that owns this contact (through instance)
     */
    public function user()
    {
        return $this->instance->user();
    }
}
