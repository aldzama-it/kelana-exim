<?php

namespace App\Services;

use App\Enums\UserRole;

class RbacService
{
    /**
     * Mengembalikan daftar modul dan fitur yang dapat dikonfigurasi hak aksesnya.
     */
    public function getFeatureDefinitions(): array
    {
        return [
            [
                'module' => 'Travel Request',
                'description' => 'Pengajuan dan pengelolaan form perjalanan dinas',
                'features' => [
                    ['key' => 'travel_request.create', 'label' => 'Buat Pengajuan Baru', 'description' => 'Membuat draf dan mengirim form pengajuan dinas baru'],
                    ['key' => 'travel_request.view_own', 'label' => 'Lihat Pengajuan Sendiri', 'description' => 'Melihat status pengajuan yang dibuat sendiri'],
                    ['key' => 'travel_request.view_all', 'label' => 'Lihat Seluruh Pengajuan', 'description' => 'Melihat pengajuan seluruh departemen di perusahaan'],
                    ['key' => 'travel_request.cancel_own', 'label' => 'Batalkan Pengajuan Mandiri', 'description' => 'Membatalkan draf sebelum proses approval berlangsung'],
                ],
            ],
            [
                'module' => 'Akomodasi & Tiket',
                'description' => 'Pencarian, pemilihan, dan koreksi tiket perjalanan dinas',
                'features' => [
                    ['key' => 'ticket.select_and_correct', 'label' => 'Pilih & Koreksi Tiket', 'description' => 'Admin menentukan tiket pesawat/kereta dan memperbarui estimasi'],
                    ['key' => 'ticket.input_pnr', 'label' => 'Input PNR & Kode Booking', 'description' => 'Memasukkan kode booking dan detail penerbangan'],
                    ['key' => 'ticket.upload_document', 'label' => 'Upload E-Ticket & Receipt', 'description' => 'Mengunggah file PDF tiket resmi yang telah diterbitkan'],
                ],
            ],
            [
                'module' => 'Persetujuan (Approval)',
                'description' => 'Persetujuan perjalanan dinas dan tautan aksi WhatsApp',
                'features' => [
                    ['key' => 'approval.approve', 'label' => 'Persetujuan Pengajuan Dinas', 'description' => 'Verifikasi dan persetujuan penugasan dinas oleh Approver'],
                    ['key' => 'approval.wa_action_token', 'label' => 'Aksi Cepat via WhatsApp Token', 'description' => 'Menyetujui/menolak langsung via tautan aman wa.me'],
                ],
            ],
            [
                'module' => 'Keuangan & Pembayaran',
                'description' => 'Pencatatan dan verifikasi pembayaran tiket',
                'features' => [
                    ['key' => 'payment.process_transfer', 'label' => 'Proses Transfer Bank', 'description' => 'Mencatat bukti transfer ke rekening vendor/travel agent'],
                    ['key' => 'payment.confirm_credit_card', 'label' => 'Konfirmasi Corporate Credit Card', 'description' => 'Verifikasi pembayaran menggunakan kartu kredit perusahaan'],
                ],
            ],
            [
                'module' => 'Reschedule & Refund',
                'description' => 'Pengajuan perubahan tanggal atau pembatalan tiket dinas',
                'features' => [
                    ['key' => 'reschedule.request', 'label' => 'Ajukan Reschedule / Refund', 'description' => 'Mengajukan permohonan perubahan jadwal atau pembatalan tiket'],
                    ['key' => 'reschedule.approve', 'label' => 'Setujui Reschedule / Refund', 'description' => 'Memproses persetujuan perubahan jadwal atau pembatalan'],
                ],
            ],
            [
                'module' => 'Laporan & Arsip',
                'description' => 'Rekapitulasi anggaran, statistik, dan arsip digital',
                'features' => [
                    ['key' => 'reports.view_analytics', 'label' => 'Lihat Laporan & Statistik', 'description' => 'Melihat ringkasan biaya perjalanan dinas'],
                    ['key' => 'reports.export_data', 'label' => 'Ekspor Laporan PDF/Excel', 'description' => 'Mendownload laporan rekapitulasi dinas'],
                    ['key' => 'archive.view_all', 'label' => 'Akses Arsip Perjalanan', 'description' => 'Melihat dokumen dan riwayat perjalanan yang telah selesai'],
                ],
            ],
            [
                'module' => 'Pengaturan & RBAC',
                'description' => 'Manajemen hak akses, akun pengguna, dan konfigurasi sistem',
                'features' => [
                    ['key' => 'settings.manage_users', 'label' => 'Kelola Data Pengguna', 'description' => 'Menambah, mengubah, dan menonaktifkan akun karyawan'],
                    ['key' => 'settings.manage_rbac', 'label' => 'Atur Matriks Hak Akses (RBAC)', 'description' => 'Menentukan fitur mana saja yang dapat dibuka oleh tiap peran'],
                    ['key' => 'settings.system_config', 'label' => 'Konfigurasi Sistem Kelana', 'description' => 'Mengatur masa berlaku token, moda transportasi, dan integrasi'],
                ],
            ],
        ];
    }

    /**
     * Mengembalikan matriks default hak akses untuk setiap peran resmi (4 peran).
     */
    public function getDefaultRolePermissions(): array
    {
        return [
            UserRole::SUPERADMIN->value => [
                'travel_request.create', 'travel_request.view_own', 'travel_request.view_all', 'travel_request.cancel_own',
                'ticket.select_and_correct', 'ticket.input_pnr', 'ticket.upload_document',
                'approval.approve', 'approval.wa_action_token',
                'payment.process_transfer', 'payment.confirm_credit_card',
                'reschedule.request', 'reschedule.approve',
                'reports.view_analytics', 'reports.export_data', 'archive.view_all',
                'settings.manage_users', 'settings.manage_rbac', 'settings.system_config',
            ],
            UserRole::ADMIN->value => [
                'travel_request.create', 'travel_request.view_own', 'travel_request.view_all', 'travel_request.cancel_own',
                'ticket.select_and_correct', 'ticket.input_pnr', 'ticket.upload_document',
                'payment.process_transfer', 'payment.confirm_credit_card',
                'reschedule.request', 'reschedule.approve',
                'reports.view_analytics', 'reports.export_data', 'archive.view_all',
            ],
            UserRole::APPROVER->value => [
                'travel_request.create', 'travel_request.view_own', 'travel_request.cancel_own',
                'approval.approve', 'approval.wa_action_token',
                'reschedule.request', 'reschedule.approve',
                'archive.view_all',
            ],
            UserRole::REQUESTER->value => [
                'travel_request.create', 'travel_request.view_own', 'travel_request.cancel_own',
                'reschedule.request',
            ],
        ];
    }
}

