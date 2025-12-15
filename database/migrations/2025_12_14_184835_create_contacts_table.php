<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('instance_id');
            $table->string('phone', 20);
            $table->string('name')->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->string('email')->nullable();
            $table->text('notes')->nullable();
            $table->json('custom_fields')->default('{}');
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamps();

            // Foreign key
            $table->foreign('instance_id')
                ->references('id')
                ->on('whatsapp_instances')
                ->onDelete('cascade');

            // Unique constraint
            $table->unique(['instance_id', 'phone']);

            // Indexes
            $table->index('phone');
            $table->index('name');
            $table->index('is_blocked');
            $table->index('last_interaction_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
};
