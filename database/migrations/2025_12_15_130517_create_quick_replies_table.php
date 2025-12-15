<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quick_replies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('instance_id');
            $table->string('shortcut', 50);
            $table->text('message');
            $table->string('media_url', 500)->nullable();
            $table->string('media_type', 50)->nullable();
            $table->timestamps();

            // Foreign key
            $table->foreign('instance_id')
                ->references('id')
                ->on('whatsapp_instances')
                ->onDelete('cascade');

            // Unique constraint: shortcut deve ser único por instância
            $table->unique(['instance_id', 'shortcut']);

            // Indexes
            $table->index('instance_id');
            $table->index('shortcut');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quick_replies');
    }
};
