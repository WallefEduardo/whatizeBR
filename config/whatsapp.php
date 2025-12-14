<?php

return [
    /*
    |--------------------------------------------------------------------------
    | WhatsApp Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for WhatsApp messages per contact
    |
    */
    'rate_limit' => [
        'max_attempts' => env('WHATSAPP_RATE_LIMIT_MAX_ATTEMPTS', 10),
        'decay_minutes' => env('WHATSAPP_RATE_LIMIT_DECAY_MINUTES', 1),
    ],
];
