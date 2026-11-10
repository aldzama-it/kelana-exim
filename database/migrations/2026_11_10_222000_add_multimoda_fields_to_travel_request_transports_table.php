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
        Schema::table('travel_request_transports', function (Blueprint $table) {
            $table->string('direction', 20)->default('departure')->after('travel_request_id');
            $table->string('origin_location', 150)->nullable()->after('transport_mode');
            $table->string('destination_location', 150)->nullable()->after('origin_location');
            $table->string('time_preference', 50)->nullable()->after('departure_time');
            $table->string('class_preference', 50)->nullable()->after('carrier_name');
            $table->text('notes')->nullable()->after('class_preference');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('travel_request_transports', function (Blueprint $table) {
            $table->dropColumn([
                'direction',
                'origin_location',
                'destination_location',
                'time_preference',
                'class_preference',
                'notes',
            ]);
        });
    }
};

