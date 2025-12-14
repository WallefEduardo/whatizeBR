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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique();
            $table->enum('direction', ['incoming', 'outgoing']);
            $table->enum('type', ['text', 'image', 'video', 'audio', 'document', 'location', 'contact']);
            $table->text('content')->nullable();
            $table->json('media_data')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->foreignId('replied_to_message_id')->nullable()->constrained('messages')->onDelete('set null');
            $table->timestamps();

            $table->index('conversation_id');
            $table->index('message_id');
            $table->index('direction');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
