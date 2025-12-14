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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_instance_id')->constrained()->onDelete('cascade');
            $table->foreignId('contact_id')->constrained()->onDelete('cascade');
            $table->foreignId('assigned_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['open', 'pending', 'resolved', 'closed'])->default('open');
            $table->integer('unread_count')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->timestamps();

            $table->index(['whatsapp_instance_id', 'contact_id']);
            $table->index('status');
            $table->index('assigned_user_id');
            $table->index('last_message_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
