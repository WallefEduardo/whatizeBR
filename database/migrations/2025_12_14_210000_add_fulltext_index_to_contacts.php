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
        // Add full-text index for PostgreSQL
        DB::statement('CREATE INDEX contacts_fulltext_idx ON contacts USING GIN (to_tsvector(\'portuguese\', COALESCE(name, \'\') || \' \' || COALESCE(phone, \'\') || \' \' || COALESCE(email, \'\')))');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS contacts_fulltext_idx');
    }
};
