<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->index(['status', 'last_message_at'], 'idx_conversations_status_last_msg');
            $table->index(['assigned_to', 'status'], 'idx_conversations_assigned_status');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->index(['conversation_id', 'created_at'], 'idx_messages_conversation_created');
            $table->index(['direction', 'status'], 'idx_messages_direction_status');
            $table->index(['to_phone', 'status'], 'idx_messages_to_phone_status');
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->index(['whatsapp_instance_id', 'phone'], 'idx_contacts_instance_phone');
        });

        Schema::table('broadcasts', function (Blueprint $table) {
            $table->index(['status', 'scheduled_at'], 'idx_broadcasts_status_scheduled');
            $table->index(['instance_id', 'status'], 'idx_broadcasts_instance_status');
        });

        Schema::table('whatsapp_instances', function (Blueprint $table) {
            $table->index(['user_id', 'status'], 'idx_instances_user_status');
            $table->index(['is_active', 'status'], 'idx_instances_active_status');
        });
    }

    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropIndex('idx_conversations_status_last_msg');
            $table->dropIndex('idx_conversations_assigned_status');
        });

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_messages_conversation_created');
            $table->dropIndex('idx_messages_direction_status');
            $table->dropIndex('idx_messages_to_phone_status');
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->dropIndex('idx_contacts_instance_phone');
        });

        Schema::table('broadcasts', function (Blueprint $table) {
            $table->dropIndex('idx_broadcasts_status_scheduled');
            $table->dropIndex('idx_broadcasts_instance_status');
        });

        Schema::table('whatsapp_instances', function (Blueprint $table) {
            $table->dropIndex('idx_instances_user_status');
            $table->dropIndex('idx_instances_active_status');
        });
    }
};
