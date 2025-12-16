<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Performance Configuration
    |--------------------------------------------------------------------------
    |
    | Configurações de performance e otimização da aplicação
    |
    */

    'cache' => [
        // TTL padrão para cache de queries (em minutos)
        'query_ttl' => env('CACHE_QUERY_TTL', 5),

        // TTL para cache de respostas HTTP (em minutos)
        'response_ttl' => env('CACHE_RESPONSE_TTL', 10),

        // TTL para cache de dashboard stats (em minutos)
        'stats_ttl' => env('CACHE_STATS_TTL', 15),

        // Cache de configurações
        'config_ttl' => env('CACHE_CONFIG_TTL', 60),
    ],

    'pagination' => [
        // Número padrão de itens por página
        'per_page' => env('PAGINATION_PER_PAGE', 20),

        // Limite máximo de itens por página
        'max_per_page' => env('PAGINATION_MAX_PER_PAGE', 100),

        // Usar cursor pagination para grandes datasets
        'use_cursor' => env('PAGINATION_USE_CURSOR', true),
    ],

    'eager_loading' => [
        // Carregar relacionamentos automaticamente
        'auto_load' => env('EAGER_LOADING_AUTO', true),

        // Relacionamentos padrão para conversas
        'conversation_relations' => [
            'contact:id,name,phone,avatar',
            'lastMessage:id,conversation_id,type,content,created_at',
            'assignedUser:id,name,avatar',
        ],

        // Relacionamentos padrão para mensagens
        'message_relations' => [
            'conversation:id,status',
            'instance:id,name,phone',
        ],
    ],

    'optimization' => [
        // Ativar query log apenas em desenvolvimento
        'query_log' => env('QUERY_LOG_ENABLED', false),

        // Detectar N+1 queries em desenvolvimento
        'detect_n_plus_one' => env('DETECT_N_PLUS_ONE', env('APP_ENV') === 'local'),

        // Chunk size para operações em lote
        'chunk_size' => env('OPTIMIZATION_CHUNK_SIZE', 500),

        // Timeout para jobs (em segundos)
        'job_timeout' => env('JOB_TIMEOUT', 60),
    ],

    'compression' => [
        // Comprimir respostas JSON
        'json' => env('COMPRESS_JSON', true),

        // Nivel de compressão (1-9)
        'level' => env('COMPRESS_LEVEL', 6),
    ],

    'database' => [
        // Usar connection pooling
        'pooling' => env('DB_POOLING', true),

        // Número máximo de connections
        'max_connections' => env('DB_MAX_CONNECTIONS', 10),

        // Timeout de connection (em segundos)
        'timeout' => env('DB_TIMEOUT', 10),

        // Usar prepared statements
        'prepared_statements' => env('DB_PREPARED_STATEMENTS', true),
    ],
];
