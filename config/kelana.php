<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Approval Token TTL (Hours)
    |--------------------------------------------------------------------------
    |
    | Masa berlaku token persetujuan berjenjang via WhatsApp link (wa.me).
    | Default: 48 jam.
    |
    */
    'approval_token_ttl_hours' => (int) env('KELANA_APPROVAL_TOKEN_TTL_HOURS', 48),

    /*
    |--------------------------------------------------------------------------
    | Superadmin Credentials
    |--------------------------------------------------------------------------
    |
    | Kredensial Superadmin bersumber dari environment (.env).
    | Akun ini mengontrol hak akses, pengguna, dan RBAC sistem.
    |
    */
    'superadmin' => [
        'username' => env('SUPERADMIN_USERNAME', 'superadmin'),
        'password' => env('SUPERADMIN_PASSWORD', 'superadmin123'),
        'name' => env('SUPERADMIN_NAME', 'Superadmin Kelana'),
        'email' => env('SUPERADMIN_EMAIL', 'superadmin@kelana.id'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Transport Modes
    |--------------------------------------------------------------------------
    |
    | Moda transportasi eksternal yang didukung oleh sistem Kelana.
    |
    */
    'transport_modes' => [
        'Pesawat',
        'Kereta',
        'Bus',
        'Kapal',
        'Feri',
    ],

    /*
    |--------------------------------------------------------------------------
    | Private Storage Settings
    |--------------------------------------------------------------------------
    |
    | Konfigurasi penyimpanan lampiran sensitif (misal: scan KTP penumpang).
    | Wajib berada di disk privat, bukan direktori publik.
    |
    */
    'ktp_storage_path' => 'private/ktp',
];
