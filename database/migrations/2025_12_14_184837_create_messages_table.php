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
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('instance_id');
            $table->uuid('conversation_id');
            $table->string('message_id')->unique();
            $table->enum('direction', ['inbound', 'outbound']);
            $table->string('from_phone', 20);
            $table->string('to_phone', 20);
            $table->enum('type', ['text', 'image', 'video', 'audio', 'document', 'location', 'contact', 'button', 'list', 'reaction', 'sticker']);
            $table->text('content')->nullable();
            $table->string('media_url', 500)->nullable();
            $table->string('media_type', 50)->nullable();
            $table->bigInteger('media_size')->nullable();
            $table->string('thumbnail_url', 500)->nullable();
            $table->text('caption')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->uuid('replied_to_message_id')->nullable();
            $table->json('metadata')->default('{}');
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('instance_id')
                ->references('id')
                ->on('whatsapp_instances')
                ->onDelete('cascade');

            $table->foreign('conversation_id')
                ->references('id')
                ->on('conversations')
                ->onDelete('cascade');

            $table->foreign('replied_to_message_id')
                ->references('id')
                ->on('messages')
                ->onDelete('set null');

            // Indexes
            $table->index('instance_id');
            $table->index('conversation_id');
            $table->index('message_id');
            $table->index('direction');
            $table->index('type');
            $table->index('status');
            $table->index('from_phone');
            $table->index('to_phone');
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
