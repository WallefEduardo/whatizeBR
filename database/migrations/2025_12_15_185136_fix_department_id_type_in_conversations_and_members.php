<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fix conversations table
        Schema::table('conversations', function (Blueprint $table) {
            // Drop index first if exists
            $table->dropIndex(['department_id']);
        });

        // Change column type from UUID to BIGINT
        DB::statement('ALTER TABLE conversations ALTER COLUMN department_id TYPE BIGINT USING NULL');

        Schema::table('conversations', function (Blueprint $table) {
            // Add foreign key constraint
            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->onDelete('set null');

            // Re-add index
            $table->index('department_id');
        });

        // Fix members table if it exists
        if (Schema::hasTable('members') && Schema::hasColumn('members', 'department_id')) {
            Schema::table('members', function (Blueprint $table) {
                // Drop index first if exists
                if (Schema::hasColumn('members', 'department_id')) {
                    $table->dropIndex(['department_id']);
                }
            });

            // Change column type from UUID to BIGINT
            DB::statement('ALTER TABLE members ALTER COLUMN department_id TYPE BIGINT USING NULL');

            Schema::table('members', function (Blueprint $table) {
                // Add foreign key constraint
                $table->foreign('department_id')
                    ->references('id')
                    ->on('departments')
                    ->onDelete('set null');

                // Re-add index
                $table->index('department_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert conversations table
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropIndex(['department_id']);
        });

        DB::statement('ALTER TABLE conversations ALTER COLUMN department_id TYPE UUID USING NULL');

        Schema::table('conversations', function (Blueprint $table) {
            $table->index('department_id');
        });

        // Revert members table if it exists
        if (Schema::hasTable('members') && Schema::hasColumn('members', 'department_id')) {
            Schema::table('members', function (Blueprint $table) {
                $table->dropForeign(['department_id']);
                $table->dropIndex(['department_id']);
            });

            DB::statement('ALTER TABLE members ALTER COLUMN department_id TYPE UUID USING NULL');

            Schema::table('members', function (Blueprint $table) {
                $table->index('department_id');
            });
        }
    }
};
