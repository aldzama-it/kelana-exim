# Kelana: Deskripsi & Gambaran Proyek (Project Overview)

## 1. Ringkasan Proyek

**Kelana** adalah sistem pengajuan dan pengelolaan perjalanan dinas untuk seluruh karyawan. Sistem ini mencakup alur lengkap mulai dari pengajuan mandiri oleh karyawan, persetujuan berjenjang oleh atasan dan jajaran direksi, verifikasi kelengkapan data dan pemilihan tiket oleh admin travel, pencatatan pembayaran (Transfer / Corporate Credit Card), penerbitan dokumen tiket (PNR, E-ticket, Ticket Receipt), hingga penyelesaian dan pengarsipan perjalanan dinas.

Dokumen ini merupakan deskripsi fungsional resmi sistem Kelana. Mockup HTML digunakan murni sebagai referensi alur interaksi dan tata letak visual awal, bukan sebagai kode produksi. Jika terdapat perbedaan antara mockup dan dokumen ini, acuan utama yang berlaku adalah dokumen ini.

---

## 2. Tujuan Sistem

1. **Digitalisasi & Efisiensi**: Menggantikan pengajuan perjalanan dinas manual yang sebelumnya tersebar lewat chat WhatsApp, email, atau formulir fisik terpisah.
2. **Akuntabilitas & Audit Trail**: Menjaga seluruh rantai persetujuan berjenjang tercatat secara otomatis, transparan, dan dapat diaudit setiap saat.
3. **Pusat Kendali Admin Travel**: Memberikan satu dashboard terpusat bagi admin travel untuk memantau posisi pengajuan dalam 9 tahap tanpa ada pengajuan yang terlewat.
4. **Sentralisasi Arsip & Dokumen**: Mengelola bukti tiket, bukti pembayaran, lampiran KTP, dan arsip laporan perjalanan yang telah selesai secara terintegrasi dan aman.

---

## 3. Pengguna dan Hak Akses (Role-Based Access Control)

Akses dibatasi secara ketat di sisi server (Laravel Policy/Gate) berdasarkan peran pengguna:

| Peran (Role) | Representasi di Mockup | Hak Utama & Batasan Akses |
| :--- | :--- | :--- |
| **Requester** | Requester A (`u4`) | Membuat pengajuan baru (wizard 3 bagian), memilih atasan langsung, memperbaiki pengajuan yang berstatus `Returned` atau `Ditolak`, mengajukan cancel atau reschedule untuk pengajuannya sendiri. *Hanya dapat melihat pengajuan miliknya sendiri.* |
| **Atasan (Approver)** | Manager (`u2`) | Menyetujui atau menolak pengajuan bawahan langsung melalui tautan WhatsApp (`wa.me`) dengan autentikasi form login. Hanya dapat melihat Dashboard dan pengajuan yang menunggu keputusannya. |
| **Admin Travel** | Johnathan (`u1`) | Memverifikasi kelengkapan data pengajuan, menginput jadwal dan harga tiket riil secara manual via modal, mengirim tautan approval ke Direktur dan Direktur Utama, mencatat pembayaran, menerbitkan tiket (PNR, e-ticket, receipt), menandai selesai, serta mengajukan cancel/reschedule. |
| **Finance** | Menu Pembayaran (`pay`) | Menerima permintaan dana untuk pembayaran metode Transfer (TF), mencatat dana yang telah diterima, dan mencatat penyelesaian pembayaran. |
| **Direktur** | Direktur (`u5`) | Melakukan persetujuan tahap kedua setelah tiket dipilih dan diverifikasi oleh admin travel. |
| **Direktur Utama** | Direktur Utama (`u6`) | Melakukan persetujuan tahap ketiga (tahap akhir persetujuan manajemen). |
| **Superadmin** | Superadmin (`u3`) | Mengelola manajemen pengguna, hak akses peran (RBAC), dan pemantauan sistem secara menyeluruh. |

---

## 4. Alur Utama Pengajuan (Main Workflow)

1. **Pengajuan (Form Wizard 3 Bagian)**:
   * **Bagian 1 (Data Perjalanan)**: Tujuan perjalanan (*Business Trip*, *Site Visit*, *Training*, *Meeting*, *Working on site*), Departemen, Nama Project, Kota Keberangkatan, Kota Tujuan, Tanggal & Jam Berangkat, Prioritas (*Normal* / *Urgent*), Pemilihan Atasan Langsung, dan Keterangan.
   * **Bagian 2 (Detail Penumpang)**: Minimal 1 penumpang. Setiap penumpang memiliki Nama Lengkap, NIK (wajib 16 digit angka), No HP, Keterangan, Tanggal Keberangkatan, Moda Transportasi, Jam, serta wajib melampirkan file KTP yang disimpan di disk privat.
   * **Bagian 3 (Transportasi)**: Moda 1 wajib diisi, Moda 2 opsional. Moda 1 dan Moda 2 harus berbeda. Pilihan moda: **Pesawat, Kereta, Bus, Kapal, Feri** (hanya kendaraan eksternal; armada internal tidak ada). Detail mencakup jenis kendaraan/moda, tanggal, jam, maskapai/penyedia, dan keterangan.
2. **Persetujuan Atasan (Approver)**:
   * Requester memilih atasan langsung saat pengajuan.
   * Sistem menghasilkan tautan WhatsApp (`wa.me`) khusus untuk atasan yang memuat token acak ter-hash dengan masa berlaku 48 jam.
   * Atasan membuka link, login via form autentikasi, meninjau data pengajuan, lalu memutuskan *Setujui* atau *Tolak*.
   * Jika ditolak, status berubah menjadi `Ditolak` dan kembali ke Requester untuk diperbaiki dan dikirim ulang.
3. **Verifikasi Admin**:
   * Admin memeriksa keabsahan dan kelengkapan data (status `Diajukan`, tampil di antrean sebagai *Verifikasi admin*).
   * Jika data salah atau tidak lengkap, admin mengembalikan pengajuan (status `Returned`). Requester memperbaikinya langsung dari dashboard mereka.
4. **Pemilihan & Input Tiket Manual**:
   * Admin mencari opsi tiket/jadwal yang tersedia dan menginput jadwal riil serta harga per penumpang secara manual lewat modal sistem.
   * Sistem mencatat `user_id` admin dan timestamp input tiket.
   * Setelah tiket diinput, status pengajuan menjadi `Terverifikasi`.
5. **Persetujuan Berjenjang Direksi**:
   * Admin mengirim tautan approval WhatsApp ber-token ke **Direktur**, lalu setelah disetujui, dikirim ke **Direktur Utama**. Urutan ini baku dan tidak boleh dibalik.
   * Jika Direktur menolak pengajuan, status menjadi `Ditolak` dan pengajuan langsung **kembali ke Requester** untuk diperbaiki.
6. **Perubahan Harga Setelah Disetujui (Koreksi Harga)**:
   * Jika terdapat selisih harga dari penyedia sebelum tiket diterbitkan, admin melakukan koreksi harga di sistem.
   * Perubahan harga ini memicu **persetujuan ulang (re-approval)** yang dimulai kembali dari awal rantai: Atasan Requester → Direktur → Direktur Utama.
7. **Proses Pembayaran (Payment Queue)**:
   * **Transfer (TF)**: Admin membuat permintaan dana ke Finance (status `Menunggu Finance`). Finance mencatat penerimaan dana, lalu admin/finance mencatat pembayaran selesai beserta bukti transfer/VA (status `Sudah Dibayar`).
   * **Corporate Credit Card (CC)**: Admin melakukan pembayaran langsung dengan kartu kredit perusahaan dan mengunggah bukti bayar (status `Sudah Dibayar`).
   * *Catatan*: Pembayaran riil dilakukan di luar sistem, tetapi status, antrean, nomor referensi, dan bukti bayar wajib dicatat di dalam sistem.
8. **Penerbitan Tiket (Ticketing)**:
   * Setelah pembayaran berstatus `Sudah Dibayar`, admin menerbitkan tiket dengan mengunggah dan mengisi: PNR / Kode Booking, file E-ticket per penumpang, Ticket Receipt per penumpang, dan Bukti Pembayaran (status berubah menjadi `Tiket Diterbitkan`).
9. **Selesai dan Pengarsipan**:
   * Setelah tanggal perjalanan selesai terlaksana, admin menandai pengajuan sebagai `Selesai`.
   * Hanya pengajuan dengan status `Selesai` yang masuk ke menu **Reports & Archive**.

---

## 5. Status Pengajuan Resmi

Sistem memiliki 12 status operasional:
1. `Diajukan`: Pengajuan baru dibuat atau diperbaiki, menunggu verifikasi data oleh admin travel.
2. `Returned`: Pengajuan dikembalikan oleh admin karena data belum lengkap/salah; menunggu perbaikan oleh requester.
3. `Terverifikasi`: Data telah diverifikasi admin dan detail jadwal/tiket telah diinput; siap dikirim ke rantai approval direksi.
4. `Menunggu Approver`: Tautan approval telah dikirimkan dan sistem sedang menunggu keputusan approver aktif (Atasan, Direktur, atau Dirut).
5. `Ditolak`: Pengajuan ditolak oleh atasan atau direksi; kembali ke requester dengan alasan penolakan wajib.
6. `Disetujui`: Pengajuan telah disetujui oleh seluruh approver dalam rantai; menunggu pemrosesan pembayaran.
7. `Menunggu Finance`: Permintaan dana diajukan ke finance untuk metode pembayaran Transfer (TF).
8. `Sudah Dibayar`: Pembayaran tiket telah selesai dan bukti pembayaran telah diunggah.
9. `Tiket Diterbitkan`: Dokumen PNR, E-ticket, dan Ticket Receipt telah diterbitkan dan diunggah oleh admin.
10. `Selesai`: Perjalanan dinas telah selesai; pengajuan diarsipkan ke menu laporan.
11. `Batal`: Pengajuan dibatalkan sebelum pembayaran dilakukan.
12. `Refund`: Pengajuan dibatalkan setelah pembayaran tiket dilakukan (proses refund dicatat secara administratif).

---

## 6. Alur Pembatalan (Cancel) dan Penjadwalan Ulang (Reschedule)

* Requester atau Admin dapat mengajukan cancel atau reschedule dengan **alasan wajib**.
* **Rantai Persetujuan Fleksibel**: Mengikuti daftar approver yang sudah pernah dicapai oleh pengajuan tersebut.
  * Jika pengajuan baru mencapai Atasan: approval cancel/reschedule hanya diajukan ke Atasan.
  * Jika sudah disetujui Direktur: approval cancel/reschedule diajukan ke Atasan lalu Direktur.
  * Jika sudah disetujui Direktur Utama atau dibayar: rantai approval melibatkan Atasan → Direktur → Direktur Utama.
* **Perbedaan Cancel**:
  * Cancel yang diajukan *sebelum* tiket dibayar akan menghasilkan status akhir `Batal`.
  * Cancel yang diajukan *setelah* pembayaran tiket dilakukan akan menghasilkan status akhir `Refund`.
* **Reschedule**:
  * Pengajuan reschedule dengan tanggal baru yang disetujui akan mengembalikan status pengajuan ke `Terverifikasi` untuk pemilihan/penyesuaian tiket ulang oleh admin.

---

## 7. Daftar Layar Aplikasi

1. **Dashboard**: Ringkasan metrik dan tugas berdasarkan peran pengguna aktif (tugas verifikasi untuk admin, notifikasi approval untuk approver, pengajuan aktif untuk requester).
2. **Travel Request**: Daftar pengajuan dengan *summary cards* (dapat diklik untuk filter cepat), pencarian teks bebas (ID/nama penumpang), filter multi-kriteria, dan paginasi.
3. **Approval**: Antrean daftar pengajuan yang sedang menunggu keputusan dari peran aktif yang sedang login.
4. **Pembayaran**: Antrean verifikasi dana TF dan pembayaran CC (menggunakan tata letak tabel yang konsisten dengan Travel Request).
5. **Tiket**: Antrean pengajuan yang berstatus `Sudah Dibayar` (menunggu penerbitan tiket) dan `Tiket Diterbitkan`.
6. **Reports & Archive**: Menu tunggal yang khusus memuat pengajuan dengan status `Selesai` untuk keperluan pelaporan dan audit.
7. **Formulir Pengajuan (Wizard)**: Form terpandu 3 bagian dengan pratinjau dokumen dan ekspor PDF.
8. **Halaman Aksi Approval**: Halaman tujuan dari tautan WhatsApp, menampilkan ringkasan pengajuan secara aman (GET non-konsumtif) dan memproses aksi *Approve*/*Reject* via POST setelah autentikasi.
9. **Settings & RBAC**: Manajemen pengguna, hak akses peran, dan log audit untuk Superadmin.

---

## 8. Draf Formulir Pengajuan & Spesifikasi Cetak PDF

Formulir pengajuan di sistem terdiri dari 3 bagian input utama:

### Bagian 1 : Deskripsi Perjalanan
* Tujuan Perjalanan: *Business Trip / Site Visit / Training / Meeting / Working on site*
* Departemen
* Nama Project
* Kota Keberangkatan & Kota Tujuan
* Tanggal & Jam Keberangkatan
* Prioritas: *Normal / Urgent*
* Pemilihan Atasan Langsung
* Keterangan

### Bagian 2 : Detail Penumpang
| No | Nama | NIK (16 Digit) | No HP | Tanggal | Transportasi | Pukul | Keterangan | Lampiran KTP |
|---|---|---|---|---|---|---|---|---|
| 1..n | Wajib | Wajib (Angka) | Wajib | Sesuai jadwal | Moda 1 / Moda 2 | Jam | Opsional | File KTP (Privat) |

### Bagian 3 : Transportasi
Moda 1 wajib diisi, Moda 2 opsional (harus berbeda). Hanya kendaraan eksternal, armada internal tidak ada.
* Pilihan Moda: **Pesawat, Kereta, Bus, Kapal, Feri**
* Detail Moda: Jenis Kendaraan/Armada Eksternal, Maskapai/Penyedia, Tanggal, Pukul, Keterangan/Catatan Transportasi

---

## 9. Dokumentasi Layout Dokumen PDF (Placeholder Draf template.docx)

Dokumen cetak PDF yang di-generate oleh `PdfDocumentService` menggunakan layout draf dari `template.docx` dan `contoh-ticket-booking.pdf`. 

> [!NOTE]
> Seluruh elemen kop surat, stempel, dan kolom tanda tangan di bawah ini murni merupakan **placeholder tata letak visual dokumen cetak PDF**. Elemen ini bukan bagian dari alur persetujuan sistem digital (sistem menggunakan persetujuan digital via token WhatsApp: Atasan → Direktur → Direktur Utama).

### Elemen Cetak PDF:
* **Kop Surat Perusahaan**: [PLACEHOLDER - Menunggu template resmi]
* **Data Perjalanan & Tabel Penumpang**: Mengambil data dinamis dari pengajuan.
* **Tabel Transportasi**: Mengambil data moda eksternal yang dipilih.
* **Halaman Lampiran**: Foto/scan KTP penumpang.
* **Kolom Tanda Tangan Cetak (Visual Placeholder template.docx)**:
  1. ADMIN
  2. SPV / MANAGER (Atasan)
  3. DIREKTUR
  4. TRAVEL DEPT (Nurkholis)
  5. DIREKTUR GA (M. Achyad)
  6. DIREKTUR UTAMA (Agus Jayana)

