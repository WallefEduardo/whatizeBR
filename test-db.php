<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    DB::connection()->getPdo();
    echo "✅ Conexão com PostgreSQL: OK\n";
    echo "✅ Database: " . DB::connection()->getDatabaseName() . "\n";
} catch(Exception $e) {
    echo "❌ Erro ao conectar: " . $e->getMessage() . "\n";
}
