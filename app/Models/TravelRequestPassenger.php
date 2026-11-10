<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelRequestPassenger extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_request_id',
        'name',
        'nik',
        'phone',
        'department',
        'division',
        'ktp_file_path',
        'notes',
    ];

    public function travelRequest(): BelongsTo
    {
        return $this->belongsTo(TravelRequest::class);
    }
}

