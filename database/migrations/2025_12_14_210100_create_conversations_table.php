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
        Schema::create('conversations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('instance_id');
            $table->uuid('contact_id');
            $table->uuid('assigned_to')->nullable();
            $table->uuid('department_id')->nullable();
            $table->enum('status', ['open', 'pending', 'closed'])->default('open');
            $table->boolean('is_group')->default(false);
            $table->string('group_name')->nullable();
            $table->string('group_avatar_url', 500)->nullable();
            $table->integer('unread_count')->default(0);
            $table->uuid('last_message_id')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('instance_id')
                ->references('id')
                ->on('whatsapp_instances')
                ->onDelete('cascade');

            $table->foreign('contact_id')
                ->references('id')
                ->on('contacts')
                ->onDelete('cascade');

            $table->foreign('assigned_to')
                ->references('id')
                ->on('users')
                ->onDelete('set null');

            // TODO: Add department foreign key when departments table is created
            // $table->foreign('department_id')
            //     ->references('id')
            //     ->on('departments')
            //     ->onDelete('set null');

            // Indexes
            $table->index('instance_id');
            $table->index('contact_id');
            $table->index('assigned_to');
            $table->index('department_id');
            $table->index('status');
            $table->index('last_message_at');
            $table->index('unread_count');
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
