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
        Schema::create('chatbot_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('conversations')->onDelete('cascade');
            $table->foreignUuid('chatbot_id')->constrained('chatbots')->onDelete('cascade');
            $table->foreignUuid('flow_id')->constrained('chatbot_flows')->onDelete('cascade');
            $table->string('current_node_id')->nullable();
            $table->jsonb('variables')->default('{}');
            $table->enum('status', ['active', 'completed', 'failed', 'cancelled'])->default('active');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index('conversation_id');
            $table->index('chatbot_id');
            $table->index('flow_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_sessions');
    }
};
