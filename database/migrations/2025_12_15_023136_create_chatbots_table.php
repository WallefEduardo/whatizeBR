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
        Schema::create('chatbots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('instance_id')->constrained('whatsapp_instances')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('trigger_type', ['keyword', 'always', 'business_hours', 'custom'])->default('keyword');
            $table->string('trigger_value')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->index('instance_id');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbots');
    }
};
