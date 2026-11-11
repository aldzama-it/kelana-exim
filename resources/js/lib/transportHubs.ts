export type TransportHubMode = 'Pesawat' | 'Kereta' | 'Bus' | 'Kapal' | 'Feri';

export interface TransportHubItem {
    name: string;        // Nama hub / bandara / stasiun / terminal / pelabuhan
    code?: string;       // Kode bandara (CGK) atau stasiun (GMR/SBI) jika ada
    city: string;        // Kota utama
    province: string;    // Provinsi
    mode: TransportHubMode;
    typeLabel: string;   // Label jenis (misal: "Bandara Internasional", "Stasiun Besar", "Terminal AKAP", "Pelabuhan ASDP")
}

export function formatHubDisplay(item: TransportHubItem): string {
    const codePart = item.code ? ` (${item.code})` : '';
    return `${item.city} - ${item.name}${codePart}`;
}

/**
 * Dataset Lengkap Titik Hub Transportasi Indonesia (Bandara, Stasiun, Terminal, Pelabuhan)
 */
export const TRANSPORT_HUBS: TransportHubItem[] = [
    // =========================================================================
    // 1. PESAWAT (BANDARA UDARA KOMERSIAL)
    // =========================================================================
    // DKI Jakarta & Banten
    { name: 'Bandara Internasional Soekarno-Hatta', code: 'CGK', city: 'Jakarta / Tangerang', province: 'Banten / DKI Jakarta', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Halim Perdanakusuma', code: 'HLP', city: 'Jakarta', province: 'DKI Jakarta', mode: 'Pesawat', typeLabel: 'Bandara Domestik / VIP' },
    // Jawa Timur
    { name: 'Bandara Internasional Juanda', code: 'SUB', city: 'Surabaya / Sidoarjo', province: 'Jawa Timur', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Abdulrachman Saleh', code: 'MLG', city: 'Malang', province: 'Jawa Timur', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Banyuwangi', code: 'BWX', city: 'Banyuwangi', province: 'Jawa Timur', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Dhoho', code: 'DHX', city: 'Kediri', province: 'Jawa Timur', mode: 'Pesawat', typeLabel: 'Bandara Internasional / Domestik' },
    // Jawa Barat
    { name: 'Bandara Internasional Kertajati', code: 'KJT', city: 'Majalengka / Bandung', province: 'Jawa Barat', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Husein Sastranegara', code: 'BDO', city: 'Bandung', province: 'Jawa Barat', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    // Jawa Tengah & DI Yogyakarta
    { name: 'Bandara Internasional Jenderal Ahmad Yani', code: 'SRG', city: 'Semarang', province: 'Jawa Tengah', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Adi Soemarmo', code: 'SOC', city: 'Solo / Surakarta', province: 'Jawa Tengah', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Internasional Yogyakarta (YIA)', code: 'YIA', city: 'Yogyakarta / Kulon Progo', province: 'DI Yogyakarta', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Adisutjipto', code: 'JOG', city: 'Yogyakarta', province: 'DI Yogyakarta', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    // Bali & Nusa Tenggara
    { name: 'Bandara Internasional I Gusti Ngurah Rai', code: 'DPS', city: 'Denpasar / Bali', province: 'Bali', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Internasional Lombok (ZAM)', code: 'LOP', city: 'Lombok / Praya', province: 'Nusa Tenggara Barat', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Komodo', code: 'LBJ', city: 'Labuan Bajo', province: 'Nusa Tenggara Timur', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara El Tari', code: 'KOE', city: 'Kupang', province: 'Nusa Tenggara Timur', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    // Sumatera
    { name: 'Bandara Internasional Kualanamu', code: 'KNO', city: 'Medan / Deli Serdang', province: 'Sumatera Utara', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Hang Nadim', code: 'BTH', city: 'Batam', province: 'Kepulauan Riau', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Sultan Mahmud Badaruddin II', code: 'PLM', city: 'Palembang', province: 'Sumatera Selatan', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Sultan Syarif Kasim II', code: 'PKU', city: 'Pekanbaru', province: 'Riau', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Internasional Minangkabau', code: 'PDG', city: 'Padang', province: 'Sumatera Barat', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Radin Inten II', code: 'TKG', city: 'Bandar Lampung', province: 'Lampung', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Sultan Iskandar Muda', code: 'BTJ', city: 'Banda Aceh', province: 'Aceh', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Sultan Thaha', code: 'DJB', city: 'Jambi', province: 'Jambi', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Fatmawati Soekarno', code: 'BKS', city: 'Bengkulu', province: 'Bengkulu', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Depati Amir', code: 'PGK', city: 'Pangkalpinang', province: 'Bangka Belitung', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara H.A.S. Hanandjoeddin', code: 'TJQ', city: 'Tanjung Pandan / Belitung', province: 'Bangka Belitung', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Raja Haji Fisabilillah', code: 'TNJ', city: 'Tanjungpinang', province: 'Kepulauan Riau', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    // Kalimantan
    { name: 'Bandara Sultan Aji Muhammad Sulaiman Sepinggan', code: 'BPN', city: 'Balikpapan', province: 'Kalimantan Timur', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara APT Pranoto', code: 'AAP', city: 'Samarinda', province: 'Kalimantan Timur', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Syamsudin Noor', code: 'BDJ', city: 'Banjarmasin / Banjarbaru', province: 'Kalimantan Selatan', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Supadio', code: 'PNK', city: 'Pontianak / Kubu Raya', province: 'Kalimantan Barat', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Tjilik Riwut', code: 'PKY', city: 'Palangkaraya', province: 'Kalimantan Tengah', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Juwata', code: 'TRK', city: 'Tarakan', province: 'Kalimantan Utara', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Kalimarau', code: 'BEJ', city: 'Berau', province: 'Kalimantan Timur', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    // Sulawesi
    { name: 'Bandara Internasional Sultan Hasanuddin', code: 'UPG', city: 'Makassar / Maros', province: 'Sulawesi Selatan', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Sam Ratulangi', code: 'MDC', city: 'Manado', province: 'Sulawesi Utara', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Mutiara SIS Al-Jufrie', code: 'PLW', city: 'Palu', province: 'Sulawesi Tengah', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Haluoleo', code: 'KDI', city: 'Kendari', province: 'Sulawesi Tenggara', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Djalaluddin', code: 'GTO', city: 'Gorontalo', province: 'Gorontalo', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    // Maluku & Papua
    { name: 'Bandara Pattimura', code: 'AMQ', city: 'Ambon', province: 'Maluku', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Sultan Babullah', code: 'TTE', city: 'Ternate', province: 'Maluku Utara', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Sentani', code: 'DJJ', city: 'Jayapura', province: 'Papua', mode: 'Pesawat', typeLabel: 'Bandara Internasional' },
    { name: 'Bandara Domine Eduard Osok', code: 'SOQ', city: 'Sorong', province: 'Papua Barat Daya', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Rendani', code: 'MKW', city: 'Manokwari', province: 'Papua Barat', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Mozes Kilangin', code: 'TIM', city: 'Timika', province: 'Papua Tengah', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    { name: 'Bandara Mopah', code: 'MKQ', city: 'Merauke', province: 'Papua Selatan', mode: 'Pesawat', typeLabel: 'Bandara Domestik' },
    // Hub Internasional Terdekat
    { name: 'Singapore Changi Airport', code: 'SIN', city: 'Singapura', province: 'Singapura', mode: 'Pesawat', typeLabel: 'Hub Internasional' },
    { name: 'Kuala Lumpur International Airport', code: 'KUL', city: 'Kuala Lumpur', province: 'Malaysia', mode: 'Pesawat', typeLabel: 'Hub Internasional' },

    // =========================================================================
    // 2. KERETA (STASIUN KERETA API UTAMA KAI)
    // =========================================================================
    // Jakarta & Sekitarnya
    { name: 'Stasiun Gambir', code: 'GMR', city: 'Jakarta Pusat', province: 'DKI Jakarta', mode: 'Kereta', typeLabel: 'Stasiun Kereta Eksekutif' },
    { name: 'Stasiun Pasar Senen', code: 'PSE', city: 'Jakarta Pusat', province: 'DKI Jakarta', mode: 'Kereta', typeLabel: 'Stasiun Kereta Campuran/Ekonomi' },
    { name: 'Stasiun Jatinegara', code: 'JNG', city: 'Jakarta Timur', province: 'DKI Jakarta', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Manggarai', code: 'MRI', city: 'Jakarta Selatan', province: 'DKI Jakarta', mode: 'Kereta', typeLabel: 'Stasiun Sentral' },
    { name: 'Stasiun Halim (Kereta Cepat Whoosh)', code: 'HLM', city: 'Jakarta Timur', province: 'DKI Jakarta', mode: 'Kereta', typeLabel: 'Stasiun Kereta Cepat' },
    { name: 'Stasiun Bekasi', code: 'BKS', city: 'Bekasi', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Cikarang', code: 'CKR', city: 'Cikarang / Bekasi', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    // Jawa Timur (Termasuk Gresik & Sekitarnya)
    { name: 'Stasiun Surabaya Pasar Turi', code: 'SBI', city: 'Surabaya', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Besar Lintas Utara' },
    { name: 'Stasiun Surabaya Gubeng', code: 'SGU', city: 'Surabaya', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Besar Lintas Selatan' },
    { name: 'Stasiun Wonokromo', code: 'WO', city: 'Surabaya', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Indro', code: 'IDO', city: 'Gresik', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Komuter / Lokal Gresik' },
    { name: 'Stasiun Duduk', code: 'DD', city: 'Gresik', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Sidoarjo', code: 'SDA', city: 'Sidoarjo', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Malang', code: 'ML', city: 'Malang', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Malang Kotalama', code: 'MLK', city: 'Malang', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Mojokerto', code: 'MR', city: 'Mojokerto', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Jombang', code: 'JG', city: 'Jombang', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Kertosono', code: 'KTS', city: 'Nganjuk / Kertosono', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Madiun', code: 'MN', city: 'Madiun', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Kediri', code: 'KD', city: 'Kediri', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Blitar', code: 'BL', city: 'Blitar', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Jember', code: 'JR', city: 'Jember', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Ketapang (Banyuwangi)', code: 'KTG', city: 'Banyuwangi', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Pelabuhan Feri' },
    { name: 'Stasiun Banyuwangi Kota', code: 'BWI', city: 'Banyuwangi', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Probolinggo', code: 'PB', city: 'Probolinggo', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Bojonegoro', code: 'BJ', city: 'Bojonegoro', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Lamongan', code: 'LMG', city: 'Lamongan', province: 'Jawa Timur', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    // Jawa Barat & Banten
    { name: 'Stasiun Bandung', code: 'BD', city: 'Bandung', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Kiaracondong', code: 'KAC', city: 'Bandung', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Padalarang (Whoosh / KAI)', code: 'PDL', city: 'Bandung Barat', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Kereta Cepat / Antarkota' },
    { name: 'Stasiun Tegalluar Summarecon (Whoosh)', code: 'TGL', city: 'Bandung', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Kereta Cepat' },
    { name: 'Stasiun Cirebon', code: 'CN', city: 'Cirebon', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Cirebon Prujakan', code: 'CNP', city: 'Cirebon', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Karawang', code: 'KW', city: 'Karawang', province: 'Jawa Barat', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Rangkasbitung', code: 'RK', city: 'Lebak / Banten', province: 'Banten', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Merak', code: 'MER', city: 'Cilegon / Merak', province: 'Banten', mode: 'Kereta', typeLabel: 'Stasiun Pelabuhan Feri' },
    // Jawa Tengah & DI Yogyakarta
    { name: 'Stasiun Semarang Tawang Bank Jateng', code: 'SMT', city: 'Semarang', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Semarang Poncol', code: 'SMC', city: 'Semarang', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Solo Balapan', code: 'SLO', city: 'Solo / Surakarta', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Purwosari', code: 'PWS', city: 'Solo / Surakarta', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Solo Jebres', code: 'SK', city: 'Solo / Surakarta', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Yogyakarta (Tugu)', code: 'YK', city: 'Yogyakarta', province: 'DI Yogyakarta', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Lempuyangan', code: 'LPN', city: 'Yogyakarta', province: 'DI Yogyakarta', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Purwokerto', code: 'PWT', city: 'Purwokerto / Banyumas', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Tegal', code: 'TG', city: 'Tegal', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Pekalongan', code: 'PK', city: 'Pekalongan', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Cilacap', code: 'CP', city: 'Cilacap', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Kroya', code: 'KYA', city: 'Cilacap / Kroya', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Percabangan' },
    { name: 'Stasiun Kutoarjo', code: 'KTA', city: 'Purworejo / Kutoarjo', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    { name: 'Stasiun Klaten', code: 'KT', city: 'Klaten', province: 'Jawa Tengah', mode: 'Kereta', typeLabel: 'Stasiun Antarkota' },
    // Sumatera
    { name: 'Stasiun Medan', code: 'MDN', city: 'Medan', province: 'Sumatera Utara', mode: 'Kereta', typeLabel: 'Stasiun Besar Kereta Bandara / Antarkota' },
    { name: 'Stasiun Kertapati', code: 'KPT', city: 'Palembang', province: 'Sumatera Selatan', mode: 'Kereta', typeLabel: 'Stasiun Besar' },
    { name: 'Stasiun Tanjungkarang', code: 'TNK', city: 'Bandar Lampung', province: 'Lampung', mode: 'Kereta', typeLabel: 'Stasiun Besar' },

    // =========================================================================
    // 3. BUS / TRAVEL (TERMINAL BUS AKAP & POOL SHUTTLE POPULER)
    // =========================================================================
    // Jabodetabek & Banten
    { name: 'Terminal Terpadu Pulo Gebang', city: 'Jakarta Timur', province: 'DKI Jakarta', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Kampung Rambutan', city: 'Jakarta Timur', province: 'DKI Jakarta', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Kalideres', city: 'Jakarta Barat', province: 'DKI Jakarta', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Tanjung Priok', city: 'Jakarta Utara', province: 'DKI Jakarta', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Poris Plawad', city: 'Tangerang', province: 'Banten', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Baranangsiang', city: 'Bogor', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Bekasi', city: 'Bekasi', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Jatijajar', city: 'Depok', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    // Jawa Timur (Termasuk Gresik)
    { name: 'Terminal Purabaya (Bungurasih)', city: 'Surabaya / Sidoarjo', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Terbesar Tipe A' },
    { name: 'Terminal Tambak Osowilangun (TOW)', city: 'Surabaya', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Bunder', city: 'Gresik', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe B' },
    { name: 'Terminal Arjosari', city: 'Malang', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Purboyo', city: 'Madiun', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Tamanan', city: 'Kediri', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Rajekwesi', city: 'Bojonegoro', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Tawangalun', city: 'Jember', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Sritanjung', city: 'Banyuwangi', province: 'Jawa Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    // Jawa Barat
    { name: 'Terminal Leuwipanjang', city: 'Bandung', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Cicaheum', city: 'Bandung', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Harjamukti', city: 'Cirebon', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Indihiang', city: 'Tasikmalaya', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Guntur', city: 'Garut', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Klari', city: 'Karawang', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe B' },
    // Jawa Tengah & DI Yogyakarta
    { name: 'Terminal Mangkang', city: 'Semarang', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Terboyo', city: 'Semarang', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Antarkota' },
    { name: 'Terminal Tirtonadi', city: 'Solo / Surakarta', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Giwangan', city: 'Yogyakarta', province: 'DI Yogyakarta', mode: 'Bus', typeLabel: 'Terminal Bus Terbesar Tipe A' },
    { name: 'Terminal Jombor', city: 'Yogyakarta / Sleman', province: 'DI Yogyakarta', mode: 'Bus', typeLabel: 'Terminal Bus Tipe B' },
    { name: 'Terminal Bulupitu', city: 'Purwokerto', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Kota Tegal', city: 'Tegal', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Pekalongan', city: 'Pekalongan', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Bangga Mbangun Desa', city: 'Cilacap', province: 'Jawa Tengah', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    // Luar Jawa
    { name: 'Terminal Mengwi', city: 'Denpasar / Badung', province: 'Bali', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Mandalika', city: 'Mataram', province: 'Nusa Tenggara Barat', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Rajabasa', city: 'Bandar Lampung', province: 'Lampung', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Alang-Alang Lebar', city: 'Palembang', province: 'Sumatera Selatan', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Amplas', city: 'Medan', province: 'Sumatera Utara', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Daya', city: 'Makassar', province: 'Sulawesi Selatan', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    { name: 'Terminal Batu Ampar', city: 'Balikpapan', province: 'Kalimantan Timur', mode: 'Bus', typeLabel: 'Terminal Bus Tipe A' },
    // Pool Shuttle Eksekutif & Travel Populer
    { name: 'Pool DayTrans (Jakarta / Bandung / Jateng)', city: 'Nasional', province: 'Antarkota', mode: 'Bus', typeLabel: 'Pool Travel Executive Shuttle' },
    { name: 'Pool CitiTrans (Jakarta / Bandung / Surabaya)', city: 'Nasional', province: 'Antarkota', mode: 'Bus', typeLabel: 'Pool Travel Executive Shuttle' },
    { name: 'Pool Baraya Travel (Jakarta - Bandung)', city: 'Jakarta / Bandung', province: 'Jawa Barat / DKI', mode: 'Bus', typeLabel: 'Pool Travel Executive Shuttle' },
    { name: 'Pool Jackal Holidays (Bandung - Jakarta)', city: 'Bandung / Jakarta', province: 'Jawa Barat / DKI', mode: 'Bus', typeLabel: 'Pool Travel Executive Shuttle' },
    { name: 'Pool Lintas Shuttle (Jabodetabek - Bandung)', city: 'Bandung / Jabodetabek', province: 'Jawa Barat / DKI', mode: 'Bus', typeLabel: 'Pool Travel Executive Shuttle' },
    { name: 'Pool Bhinneka Shuttle (Cirebon - Bandung - Jakarta)', city: 'Cirebon / Bandung', province: 'Jawa Barat', mode: 'Bus', typeLabel: 'Pool Travel Executive Shuttle' },

    // =========================================================================
    // 4. KAPAL (PELABUHAN LAUT UTAMA / PELNI / KAPAL CEPAT)
    // =========================================================================
    { name: 'Pelabuhan Tanjung Perak', city: 'Surabaya', province: 'Jawa Timur', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Utama / Penumpang PELNI' },
    { name: 'Pelabuhan Tanjung Priok', city: 'Jakarta Utara', province: 'DKI Jakarta', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Utama / Penumpang PELNI' },
    { name: 'Pelabuhan Tanjung Emas', city: 'Semarang', province: 'Jawa Tengah', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang PELNI' },
    { name: 'Pelabuhan Belawan', city: 'Medan', province: 'Sumatera Utara', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Utama / Penumpang' },
    { name: 'Pelabuhan Soekarno-Hatta (Makassar)', city: 'Makassar', province: 'Sulawesi Selatan', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Utama Kawasan Timur' },
    { name: 'Pelabuhan Semayang', city: 'Balikpapan', province: 'Kalimantan Timur', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang PELNI' },
    { name: 'Pelabuhan Batu Ampar', city: 'Batam', province: 'Kepulauan Riau', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang PELNI' },
    { name: 'Pelabuhan Harbour Bay (Ferry Cepat Batam-SG)', city: 'Batam', province: 'Kepulauan Riau', mode: 'Kapal', typeLabel: 'Pelabuhan Ferry Internasional' },
    { name: 'Pelabuhan Batam Centre', city: 'Batam', province: 'Kepulauan Riau', mode: 'Kapal', typeLabel: 'Pelabuhan Ferry Internasional' },
    { name: 'Pelabuhan Sri Bintan Pura', city: 'Tanjungpinang', province: 'Kepulauan Riau', mode: 'Kapal', typeLabel: 'Pelabuhan Penumpang / Ferry' },
    { name: 'Pelabuhan Trisakti', city: 'Banjarmasin', province: 'Kalimantan Selatan', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang PELNI' },
    { name: 'Pelabuhan Dwikora', city: 'Pontianak', province: 'Kalimantan Barat', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang PELNI' },
    { name: 'Pelabuhan Samarinda', city: 'Samarinda', province: 'Kalimantan Timur', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang' },
    { name: 'Pelabuhan Bitung', city: 'Bitung / Manado', province: 'Sulawesi Utara', mode: 'Kapal', typeLabel: 'Pelabuhan Hub Laut Pasifik' },
    { name: 'Pelabuhan Yos Sudarso', city: 'Ambon', province: 'Maluku', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Utama Maluku' },
    { name: 'Pelabuhan Ahmad Yani', city: 'Ternate', province: 'Maluku Utara', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang' },
    { name: 'Pelabuhan Jayapura', city: 'Jayapura', province: 'Papua', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Utama Papua' },
    { name: 'Pelabuhan Sorong', city: 'Sorong', province: 'Papua Barat Daya', mode: 'Kapal', typeLabel: 'Pelabuhan Hub Laut Papua Barat' },
    { name: 'Pelabuhan Tenau', city: 'Kupang', province: 'Nusa Tenggara Timur', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang PELNI' },
    { name: 'Pelabuhan Boom Baru', city: 'Palembang', province: 'Sumatera Selatan', mode: 'Kapal', typeLabel: 'Pelabuhan Sungai & Laut' },
    { name: 'Pelabuhan Dumai', city: 'Dumai', province: 'Riau', mode: 'Kapal', typeLabel: 'Pelabuhan Penumpang / Ferry Internasional' },
    { name: 'Pelabuhan Tarakan (Malundung)', city: 'Tarakan', province: 'Kalimantan Utara', mode: 'Kapal', typeLabel: 'Pelabuhan Laut Penumpang' },
    { name: 'Pelabuhan Benoa', city: 'Denpasar / Bali', province: 'Bali', mode: 'Kapal', typeLabel: 'Pelabuhan Kapal Pesiar & Penumpang PELNI' },

    // =========================================================================
    // 5. FERI (PELABUHAN PENYEBERANGAN ASDP FERRY)
    // =========================================================================
    // Selat Sunda (Jawa - Sumatera)
    { name: 'Pelabuhan Penyeberangan Merak', city: 'Cilegon / Merak', province: 'Banten', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Utama (Jawa-Sumatera)' },
    { name: 'Pelabuhan Penyeberangan Bakauheni', city: 'Lampung Selatan', province: 'Lampung', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Utama (Sumatera-Jawa)' },
    // Selat Bali & Lombok (Jawa - Bali - Lombok)
    { name: 'Pelabuhan Penyeberangan Ketapang', city: 'Banyuwangi', province: 'Jawa Timur', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Jawa-Bali' },
    { name: 'Pelabuhan Penyeberangan Gilimanuk', city: 'Jembrana / Gilimanuk', province: 'Bali', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Bali-Jawa' },
    { name: 'Pelabuhan Penyeberangan Padangbai', city: 'Karangasem / Padangbai', province: 'Bali', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Bali-Lombok' },
    { name: 'Pelabuhan Penyeberangan Lembar', city: 'Lombok Barat', province: 'Nusa Tenggara Barat', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Lombok-Bali / Surabaya' },
    { name: 'Pelabuhan Penyeberangan Kayangan', city: 'Lombok Timur', province: 'Nusa Tenggara Barat', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Lombok-Sumbawa' },
    { name: 'Pelabuhan Penyeberangan Pototano', city: 'Sumbawa Barat', province: 'Nusa Tenggara Barat', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Sumbawa-Lombok' },
    { name: 'Pelabuhan Penyeberangan Sape', city: 'Bima', province: 'Nusa Tenggara Barat', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Sumbawa-Flores' },
    { name: 'Pelabuhan Penyeberangan Labuan Bajo', city: 'Labuan Bajo', province: 'Nusa Tenggara Timur', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Flores-Sumbawa' },
    // Jawa Timur (Surabaya - Madura & Kepulauan)
    { name: 'Pelabuhan Penyeberangan Ujung (Surabaya)', city: 'Surabaya', province: 'Jawa Timur', mode: 'Feri', typeLabel: 'Dermaga Ferry Surabaya-Madura' },
    { name: 'Pelabuhan Penyeberangan Kamal (Bangkalan)', city: 'Bangkalan / Madura', province: 'Jawa Timur', mode: 'Feri', typeLabel: 'Dermaga Ferry Madura-Surabaya' },
    { name: 'Pelabuhan Jangkar (Situbondo)', city: 'Situbondo', province: 'Jawa Timur', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Situbondo-Madura/Lembar' },
    // Kepulauan Riau
    { name: 'Pelabuhan Telaga Punggur (Batam)', city: 'Batam', province: 'Kepulauan Riau', mode: 'Feri', typeLabel: 'Dermaga Roro Batam-Bintan/Dabo' },
    { name: 'Pelabuhan Tanjung Uban (Bintan)', city: 'Bintan', province: 'Kepulauan Riau', mode: 'Feri', typeLabel: 'Dermaga Roro Bintan-Batam' },
    // Kalimantan & Sulawesi
    { name: 'Pelabuhan Penyeberangan Kariangau', city: 'Balikpapan', province: 'Kalimantan Timur', mode: 'Feri', typeLabel: 'Dermaga Ferry Roro Balikpapan-Penajam/Mamuju' },
    { name: 'Pelabuhan Penyeberangan Penajam', city: 'Penajam Paser Utara', province: 'Kalimantan Timur', mode: 'Feri', typeLabel: 'Dermaga Ferry Roro Penajam-Balikpapan' },
    { name: 'Pelabuhan Penyeberangan Bajoe', city: 'Bone', province: 'Sulawesi Selatan', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Bone-Kolaka' },
    { name: 'Pelabuhan Penyeberangan Kolaka', city: 'Kolaka', province: 'Sulawesi Tenggara', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Kolaka-Bone' },
    { name: 'Pelabuhan Penyeberangan Bira', city: 'Bulukumba', province: 'Sulawesi Selatan', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Bira-Selayar' },
    { name: 'Pelabuhan Penyeberangan Pamatata', city: 'Selayar', province: 'Sulawesi Selatan', mode: 'Feri', typeLabel: 'Dermaga Penyeberangan Selayar-Bira' },
];

/**
 * Normalisasi string pencarian untuk mencocokkan kata kunci
 */
function cleanSearchToken(str: string): string {
    return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Filter daftar hub transportasi berdasarkan moda aktif dan kata kunci query
 */
export function searchTransportHubs(
    mode: TransportHubMode,
    query: string = ''
): TransportHubItem[] {
    const modeHubs = TRANSPORT_HUBS.filter((h) => h.mode === mode);
    const cleanQ = cleanSearchToken(query);

    if (!cleanQ) {
        return modeHubs;
    }

    return modeHubs.filter((item) => {
        const matchName = cleanSearchToken(item.name).includes(cleanQ);
        const matchCity = cleanSearchToken(item.city).includes(cleanQ);
        const matchProv = cleanSearchToken(item.province).includes(cleanQ);
        const matchCode = item.code ? cleanSearchToken(item.code).includes(cleanQ) : false;
        const matchType = cleanSearchToken(item.typeLabel).includes(cleanQ);

        return matchName || matchCity || matchProv || matchCode || matchType;
    });
}
