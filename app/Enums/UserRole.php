<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPERADMIN = 'superadmin';
    case ADMIN = 'admin';
    case APPROVER = 'approver';
    case REQUESTER = 'requester';

    /**
     * Label peran yang ramah pengguna dalam Bahasa Indonesia.
     */
    public function label(): string
    {
        return match ($this) {
            self::SUPERADMIN => 'Superadmin',
            self::ADMIN => 'Admin',
            self::APPROVER => 'Approver',
            self::REQUESTER => 'Requester',
        };
    }

    /**
     * Apakah peran ini merupakan bagian dari rantai persetujuan (Approver).
     */
    public function isApproverRole(): bool
    {
        return $this === self::APPROVER;
    }
}

