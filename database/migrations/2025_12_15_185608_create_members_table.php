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
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('user_id');
            $table->uuid('instance_id');
            $table->bigInteger('department_id')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('max_concurrent_chats')->default(5);
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('instance_id')
                ->references('id')
                ->on('whatsapp_instances')
                ->onDelete('cascade');

            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->onDelete('set null');

            // Indexes
            $table->index('user_id');
            $table->index('instance_id');
            $table->index('department_id');
            $table->index('is_active');

            // Unique constraint
            $table->unique(['user_id', 'instance_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
