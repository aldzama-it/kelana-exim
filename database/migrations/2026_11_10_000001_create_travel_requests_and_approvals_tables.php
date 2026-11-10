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
        // 1. Tabel Utama: Travel Requests
        Schema::create('travel_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number', 50)->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('purpose', 100);
            $table->string('project_name', 150)->nullable();
            $table->string('department', 100)->nullable();
            $table->string('origin_city', 100);
            $table->string('destination_city', 100);
            $table->date('departure_date');
            $table->string('departure_time', 10)->nullable();
            $table->date('return_date')->nullable();
            $table->string('priority', 20)->default('normal');
            $table->string('status', 40)->default('draft')->index();
            $table->unsignedSmallInteger('current_approval_tier')->default(1);
            $table->unsignedSmallInteger('total_approval_tiers')->default(1);
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Penumpang (Minimal 1 penumpang dengan NIK 16 digit & KTP)
        Schema::create('travel_request_passengers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_request_id')->constrained('travel_requests')->cascadeOnDelete();
            $table->string('name', 255);
            $table->string('nik', 20);
            $table->string('phone', 30)->nullable();
            $table->string('ktp_file_path', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Tabel Moda Transportasi (Pesawat, Kereta, Bus, Kapal, Feri)
        Schema::create('travel_request_transports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_request_id')->constrained('travel_requests')->cascadeOnDelete();
            $table->string('transport_mode', 50);
            $table->unsignedTinyInteger('priority_order')->default(1);
            $table->date('departure_date');
            $table->string('departure_time', 10)->nullable();
            $table->string('carrier_name', 100)->nullable();
            $table->string('booking_code_pnr', 50)->nullable();
            $table->string('ticket_file_path', 255)->nullable();
            $table->timestamps();
        });

        // 4. Tabel Rantai Approval Berjenjang (Wanda -> Ridho -> Rizky)
        Schema::create('travel_request_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_request_id')->constrained('travel_requests')->cascadeOnDelete();
            $table->foreignId('approver_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('tier')->default(1);
            $table->string('status', 30)->default('pending')->index();
            $table->string('token_hash', 64)->nullable()->index();
            $table->timestamp('token_expires_at')->nullable();
            $table->text('decision_notes')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            // Kombinasi unik satu approver per tahap pengajuan
            $table->unique(['travel_request_id', 'tier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('travel_request_approvals');
        Schema::dropIfExists('travel_request_transports');
        Schema::dropIfExists('travel_request_passengers');
        Schema::dropIfExists('travel_requests');
    }
};
