<?php

return [
    /*
    |--------------------------------------------------------------------------
    | RabbitMQ Connection Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for RabbitMQ connection used for WhatsApp message queue
    | communication between Laravel and Go microservices.
    |
    */

    'host' => env('RABBITMQ_HOST', 'localhost'),
    'port' => env('RABBITMQ_PORT', 5672),
    'user' => env('RABBITMQ_USER', 'guest'),
    'password' => env('RABBITMQ_PASSWORD', 'guest'),
    'vhost' => env('RABBITMQ_VHOST', '/'),

    /*
    |--------------------------------------------------------------------------
    | Exchange Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the main WhatsApp exchange used for routing messages
    | to different Go replicas based on routing keys.
    |
    */

    'exchange' => env('RABBITMQ_EXCHANGE', 'whatsapp.direct'),
    'exchange_type' => 'direct',

    /*
    |--------------------------------------------------------------------------
    | Queue Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for webhook queue where Go services publish incoming
    | WhatsApp events that Laravel will consume.
    |
    */

    'webhook_queue' => env('RABBITMQ_WEBHOOK_QUEUE', 'whatsapp.webhook'),

    /*
    |--------------------------------------------------------------------------
    | Connection Options
    |--------------------------------------------------------------------------
    |
    | Additional connection options for RabbitMQ connection.
    |
    */

    'options' => [
        'insist' => false,
        'login_method' => 'AMQPLAIN',
        'login_response' => null,
        'locale' => 'en_US',
        'connection_timeout' => 3.0,
        'read_write_timeout' => 3.0,
        'context' => null,
        'keepalive' => false,
        'heartbeat' => 0,
    ],
];
