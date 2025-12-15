<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuickReply extends Model
{
    use HasUuids;

    protected $fillable = [
        'instance_id',
        'shortcut',
        'message',
        'media_url',
        'media_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the instance that owns the quick reply.
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Scope a query to only include quick replies for a specific instance.
     */
    public function scopeForInstance($query, string $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }

    /**
     * Scope a query to search quick replies by shortcut or message.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('shortcut', 'like', "%{$search}%")
                ->orWhere('message', 'like', "%{$search}%");
        });
    }

    /**
     * Check if quick reply has media.
     */
    public function hasMedia(): bool
    {
        return !empty($this->media_url);
    }

    /**
     * Get media type icon/label.
     */
    public function getMediaTypeLabel(): ?string
    {
        return match ($this->media_type) {
            'image' => 'Imagem',
            'video' => 'Vídeo',
            'audio' => 'Áudio',
            'document' => 'Documento',
            default => null,
        };
    }
}
