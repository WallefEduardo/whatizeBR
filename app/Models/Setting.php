<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    use HasUuids;

    protected $fillable = [
        'instance_id',
        'key',
        'value',
        'type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relacionamento com WhatsAppInstance
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(WhatsAppInstance::class, 'instance_id');
    }

    /**
     * Get the value attribute cast to the correct type
     */
    public function getValueAttribute($value)
    {
        return match($this->type) {
            'number' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Set the value attribute from any type
     */
    public function setValueAttribute($value)
    {
        $type = $this->attributes['type'] ?? 'string';

        $this->attributes['value'] = match($type) {
            'json' => is_string($value) ? $value : json_encode($value),
            'boolean' => $value ? '1' : '0',
            default => is_array($value) ? json_encode($value) : (string) $value,
        };
    }

    /**
     * Scope para buscar por chave
     */
    public function scopeByKey($query, string $key)
    {
        return $query->where('key', $key);
    }

    /**
     * Scope para buscar por instância
     */
    public function scopeByInstance($query, string $instanceId)
    {
        return $query->where('instance_id', $instanceId);
    }

    /**
     * Helper estático para obter uma configuração
     */
    public static function get(string $key, ?string $instanceId = null, $default = null)
    {
        $query = static::byKey($key);

        if ($instanceId) {
            $query->byInstance($instanceId);
        } else {
            $query->whereNull('instance_id');
        }

        $setting = $query->first();

        return $setting ? $setting->value : $default;
    }

    /**
     * Helper estático para definir uma configuração
     */
    public static function set(string $key, $value, ?string $instanceId = null, string $type = 'string')
    {
        return static::updateOrCreate(
            [
                'key' => $key,
                'instance_id' => $instanceId,
            ],
            [
                'value' => $value,
                'type' => $type,
            ]
        );
    }
}
