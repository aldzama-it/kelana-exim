<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_number',
        'user_id',
        'purpose',
        'project_name',
        'department',
        'origin_city',
        'destination_city',
        'departure_date',
        'departure_time',
        'return_date',
        'priority',
        'status',
        'current_approval_tier',
        'total_approval_tiers',
        'estimated_cost',
        'actual_cost',
        'notes',
    ];

    protected $casts = [
        'departure_date' => 'date',
        'return_date' => 'date',
        'current_approval_tier' => 'integer',
        'total_approval_tiers' => 'integer',
        'estimated_cost' => 'decimal:2',
        'actual_cost' => 'decimal:2',
    ];

    /**
     * Karyawan pemohon perjalanan dinas (Requester).
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Daftar penumpang dalam pengajuan ini.
     */
    public function passengers(): HasMany
    {
        return $this->hasMany(TravelRequestPassenger::class);
    }

    /**
     * Kebutuhan moda transportasi dalam pengajuan ini.
     */
    public function transports(): HasMany
    {
        return $this->hasMany(TravelRequestTransport::class);
    }

    /**
     * Rantai persetujuan berjenjang untuk pengajuan ini.
     */
    public function approvals(): HasMany
    {
        return $this->hasMany(TravelRequestApproval::class)->orderBy('tier');
    }

    /**
     * Tahap approval aktif yang saat ini sedang menunggu keputusan.
     */
    public function currentApproval(): ?TravelRequestApproval
    {
        return $this->approvals()->where('tier', $this->current_approval_tier)->first();
    }
}

