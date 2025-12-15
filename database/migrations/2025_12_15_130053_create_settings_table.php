<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('instance_id')->nullable();
            $table->string('key', 255)->index();
            $table->text('value')->nullable();
            $table->enum('type', ['string', 'number', 'boolean', 'json'])->default('string');
            $table->timestamps();

            // Foreign key
            $table->foreign('instance_id')
                ->references('id')
                ->on('whatsapp_instances')
                ->onDelete('cascade');

            // Unique constraint
            $table->unique(['instance_id', 'key']);
        });

        // Indexes
        Schema::table('settings', function (Blueprint $table) {
            $table->index('instance_id', 'idx_settings_instance');
            $table->index('key', 'idx_settings_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
