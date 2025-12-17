<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$instances = App\Models\WhatsAppInstance::all();

echo "Total instances: " . $instances->count() . "\n\n";

foreach ($instances as $instance) {
    echo "ID: {$instance->id}\n";
    echo "Name: {$instance->name}\n";
    echo "Instance Key: " . ($instance->instance_key ?? 'NULL') . "\n";
    echo "Status: {$instance->status}\n";
    echo "---\n";
}
