<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Go WhatsApp API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Go-based WhatsApp API microservices.
    | This service handles WhatsApp session management, QR code generation,
    | and message sending/receiving via RabbitMQ.
    |
    */

    'go_whatsapp' => [
        'base_url' => env('GO_WHATSAPP_API_URL', 'http://localhost:8082'),
        'ws_url' => env('GO_WHATSAPP_WS_URL', 'ws://localhost:8082/ws'),
        'admin_token' => env('GO_WHATSAPP_ADMIN_TOKEN', ''),
    ],

];
