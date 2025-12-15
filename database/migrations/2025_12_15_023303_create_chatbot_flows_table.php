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
        Schema::create('chatbot_flows', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('chatbot_id')->constrained('chatbots')->onDelete('cascade');
            $table->string('name');
            $table->jsonb('nodes');
            $table->jsonb('edges');
            $table->string('start_node_id');
            $table->jsonb('variables')->default('{}');
            $table->timestamps();

            $table->index('chatbot_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chatbot_flows');
    }
};
