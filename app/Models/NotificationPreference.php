<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'new_message_enabled',
        'conversation_assigned_enabled',
        'sound_enabled',
        'desktop_enabled',
        'email_enabled',
        'sound_file',
    ];

    protected $casts = [
        'new_message_enabled' => 'boolean',
        'conversation_assigned_enabled' => 'boolean',
        'sound_enabled' => 'boolean',
        'desktop_enabled' => 'boolean',
        'email_enabled' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification preference.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get notification preferences for a user or create default.
     */
    public static function forUser(string $userId): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId],
            [
                'new_message_enabled' => true,
                'conversation_assigned_enabled' => true,
                'sound_enabled' => true,
                'desktop_enabled' => true,
                'email_enabled' => false,
            ]
        );
    }
}
