<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Adicionar índice GIN full-text em messages.content e messages.caption
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_messages_content_fulltext
            ON messages
            USING gin(to_tsvector('portuguese', COALESCE(content, '')))
        ");

        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_messages_caption_fulltext
            ON messages
            USING gin(to_tsvector('portuguese', COALESCE(caption, '')))
        ");

        // Adicionar índice GIN full-text em contacts (name, phone, email)
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_contacts_search_fulltext
            ON contacts
            USING gin(to_tsvector('portuguese',
                COALESCE(name, '') || ' ' ||
                COALESCE(phone, '') || ' ' ||
                COALESCE(email, '') || ' ' ||
                COALESCE(notes, '')
            ))
        ");

        // Adicionar índice GIN full-text em conversations.group_name
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_conversations_group_name_fulltext
            ON conversations
            USING gin(to_tsvector('portuguese', COALESCE(group_name, '')))
        ");

        // Adicionar índices compostos para melhorar performance de filtros
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_messages_instance_conversation
            ON messages(instance_id, conversation_id, created_at DESC)
        ");

        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_contacts_instance_name
            ON contacts(instance_id, name)
        ");

        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_conversations_instance_status
            ON conversations(instance_id, status, last_message_at DESC)
        ");

        // Adicionar índices para relações frequentemente usadas em buscas
        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_messages_from_phone
            ON messages(from_phone)
        ");

        DB::statement("
            CREATE INDEX IF NOT EXISTS idx_messages_to_phone
            ON messages(to_phone)
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS idx_messages_content_fulltext");
        DB::statement("DROP INDEX IF EXISTS idx_messages_caption_fulltext");
        DB::statement("DROP INDEX IF EXISTS idx_contacts_search_fulltext");
        DB::statement("DROP INDEX IF EXISTS idx_conversations_group_name_fulltext");
        DB::statement("DROP INDEX IF EXISTS idx_messages_instance_conversation");
        DB::statement("DROP INDEX IF EXISTS idx_contacts_instance_name");
        DB::statement("DROP INDEX IF EXISTS idx_conversations_instance_status");
        DB::statement("DROP INDEX IF EXISTS idx_messages_from_phone");
        DB::statement("DROP INDEX IF EXISTS idx_messages_to_phone");
    }
};
