<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelRequestTransport extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_request_id',
        'direction',
        'transport_mode',
        'origin_location',
        'destination_location',
        'priority_order',
        'departure_date',
        'departure_time',
        'time_preference',
        'carrier_name',
        'class_preference',
        'notes',
        'booking_code_pnr',
        'ticket_file_path',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'priority_order' => 'integer',
    ];

    public function travelRequest(): BelongsTo
    {
        return $this->belongsTo(TravelRequest::class);
    }
}

