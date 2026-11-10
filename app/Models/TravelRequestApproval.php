<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelRequestApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'travel_request_id',
        'approver_id',
        'tier',
        'status',
        'token_hash',
        'token_expires_at',
        'decision_notes',
        'decided_at',
    ];

    protected $casts = [
        'tier' => 'integer',
        'token_expires_at' => 'datetime',
        'decided_at' => 'datetime',
    ];

    public function travelRequest(): BelongsTo
    {
        return $this->belongsTo(TravelRequest::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}

