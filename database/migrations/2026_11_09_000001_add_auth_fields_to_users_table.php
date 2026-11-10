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
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 100)->unique()->after('name');
            $table->string('role', 50)->default('requester')->index()->after('password');
            $table->string('department', 100)->nullable()->after('role');
            $table->string('phone', 30)->nullable()->after('department');
            $table->foreignId('supervisor_id')
                ->nullable()
                ->after('phone')
                ->constrained('users')
                ->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('supervisor_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['supervisor_id']);
            $table->dropColumn([
                'username',
                'role',
                'department',
                'phone',
                'supervisor_id',
                'is_active',
            ]);
        });
    }
};

