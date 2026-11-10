export interface CityItem {
    city: string;
    region: string;
    country: string;
    code?: string;
}

/**
 * Daftar kota bisnis utama domestik (Indonesia) dan internasional.
 */
export const POPULAR_CITIES: CityItem[] = [
    // Indonesia - Jawa
    { city: 'Jakarta', region: 'DKI Jakarta', country: 'Indonesia', code: 'CGK / HLP' },
    { city: 'Surabaya', region: 'Jawa Timur', country: 'Indonesia', code: 'SUB' },
    { city: 'Bandung', region: 'Jawa Barat', country: 'Indonesia', code: 'BDO' },
    { city: 'Semarang', region: 'Jawa Tengah', country: 'Indonesia', code: 'SRG' },
    { city: 'Yogyakarta', region: 'DI Yogyakarta', country: 'Indonesia', code: 'YIA' },
    { city: 'Solo (Surakarta)', region: 'Jawa Tengah', country: 'Indonesia', code: 'SOC' },
    { city: 'Malang', region: 'Jawa Timur', country: 'Indonesia', code: 'MLG' },
    { city: 'Cilegon', region: 'Banten', country: 'Indonesia' },
    { city: 'Cikarang / Bekasi', region: 'Jawa Barat', country: 'Indonesia' },
    { city: 'Karawang', region: 'Jawa Barat', country: 'Indonesia' },
    { city: 'Cirebon', region: 'Jawa Barat', country: 'Indonesia' },

    // Indonesia - Sumatera
    { city: 'Medan', region: 'Sumatera Utara', country: 'Indonesia', code: 'KNO' },
    { city: 'Batam', region: 'Kepulauan Riau', country: 'Indonesia', code: 'BTH' },
    { city: 'Palembang', region: 'Sumatera Selatan', country: 'Indonesia', code: 'PLM' },
    { city: 'Pekanbaru', region: 'Riau', country: 'Indonesia', code: 'PKU' },
    { city: 'Padang', region: 'Sumatera Barat', country: 'Indonesia', code: 'PDG' },
    { city: 'Bandar Lampung', region: 'Lampung', country: 'Indonesia', code: 'TKG' },
    { city: 'Banda Aceh', region: 'Aceh', country: 'Indonesia', code: 'BTJ' },
    { city: 'Jambi', region: 'Jambi', country: 'Indonesia', code: 'DJB' },
    { city: 'Bengkulu', region: 'Bengkulu', country: 'Indonesia', code: 'BKS' },
    { city: 'Pangkal Pinang', region: 'Bangka Belitung', country: 'Indonesia', code: 'PGK' },
    { city: 'Tanjung Pinang', region: 'Kepulauan Riau', country: 'Indonesia', code: 'TNJ' },

    // Indonesia - Kalimantan
    { city: 'Balikpapan', region: 'Kalimantan Timur', country: 'Indonesia', code: 'BPN' },
    { city: 'Samarinda', region: 'Kalimantan Timur', country: 'Indonesia', code: 'AAP' },
    { city: 'Banjarmasin', region: 'Kalimantan Selatan', country: 'Indonesia', code: 'BDJ' },
    { city: 'Pontianak', region: 'Kalimantan Barat', country: 'Indonesia', code: 'PNK' },
    { city: 'Palangkaraya', region: 'Kalimantan Tengah', country: 'Indonesia', code: 'PKY' },
    { city: 'Tarakan', region: 'Kalimantan Utara', country: 'Indonesia', code: 'TRK' },
    { city: 'Bontang', region: 'Kalimantan Timur', country: 'Indonesia' },

    // Indonesia - Sulawesi
    { city: 'Makassar', region: 'Sulawesi Selatan', country: 'Indonesia', code: 'UPG' },
    { city: 'Manado', region: 'Sulawesi Utara', country: 'Indonesia', code: 'MDC' },
    { city: 'Palu', region: 'Sulawesi Tengah', country: 'Indonesia', code: 'PLW' },
    { city: 'Kendari', region: 'Sulawesi Tenggara', country: 'Indonesia', code: 'KDI' },
    { city: 'Gorontalo', region: 'Gorontalo', country: 'Indonesia', code: 'GTO' },
    { city: 'Morowali', region: 'Sulawesi Tengah', country: 'Indonesia', code: 'MOH' },

    // Indonesia - Bali & Nusa Tenggara
    { city: 'Denpasar (Bali)', region: 'Bali', country: 'Indonesia', code: 'DPS' },
    { city: 'Mataram (Lombok)', region: 'Nusa Tenggara Barat', country: 'Indonesia', code: 'LOP' },
    { city: 'Kupang', region: 'Nusa Tenggara Timur', country: 'Indonesia', code: 'KOE' },
    { city: 'Labuan Bajo', region: 'Nusa Tenggara Timur', country: 'Indonesia', code: 'LBJ' },

    // Indonesia - Maluku & Papua
    { city: 'Ambon', region: 'Maluku', country: 'Indonesia', code: 'AMQ' },
    { city: 'Ternate', region: 'Maluku Utara', country: 'Indonesia', code: 'TTE' },
    { city: 'Jayapura', region: 'Papua', country: 'Indonesia', code: 'DJJ' },
    { city: 'Sorong', region: 'Papua Barat Daya', country: 'Indonesia', code: 'SOQ' },
    { city: 'Timika', region: 'Papua Tengah', country: 'Indonesia', code: 'TIM' },
    { city: 'Merauke', region: 'Papua Selatan', country: 'Indonesia', code: 'MKQ' },

    // Internasional - Asia Tenggara
    { city: 'Singapore', region: 'Singapore', country: 'Singapore', code: 'SIN' },
    { city: 'Kuala Lumpur', region: 'Federal Territory', country: 'Malaysia', code: 'KUL' },
    { city: 'Penang', region: 'Penang', country: 'Malaysia', code: 'PEN' },
    { city: 'Johor Bahru', region: 'Johor', country: 'Malaysia', code: 'JHB' },
    { city: 'Bangkok', region: 'Bangkok', country: 'Thailand', code: 'BKK / DMK' },
    { city: 'Phuket', region: 'Phuket', country: 'Thailand', code: 'HKT' },
    { city: 'Manila', region: 'Metro Manila', country: 'Philippines', code: 'MNL' },
    { city: 'Ho Chi Minh City', region: 'Ho Chi Minh', country: 'Vietnam', code: 'SGN' },
    { city: 'Hanoi', region: 'Hanoi', country: 'Vietnam', code: 'HAN' },
    { city: 'Phnom Penh', region: 'Phnom Penh', country: 'Cambodia', code: 'PNH' },
    { city: 'Yangon', region: 'Yangon', country: 'Myanmar', code: 'RGN' },
    { city: 'Bandar Seri Begawan', region: 'Brunei-Muara', country: 'Brunei', code: 'BWN' },

    // Internasional - Asia Timur
    { city: 'Tokyo', region: 'Kanto', country: 'Japan', code: 'HND / NRT' },
    { city: 'Osaka', region: 'Kansai', country: 'Japan', code: 'KIX' },
    { city: 'Seoul', region: 'Seoul Capital Area', country: 'South Korea', code: 'ICN / GMP' },
    { city: 'Beijing', region: 'Beijing', country: 'China', code: 'PEK / PKX' },
    { city: 'Shanghai', region: 'Shanghai', country: 'China', code: 'PVG / SHA' },
    { city: 'Guangzhou', region: 'Guangdong', country: 'China', code: 'CAN' },
    { city: 'Shenzhen', region: 'Guangdong', country: 'China', code: 'SZX' },
    { city: 'Hong Kong', region: 'Hong Kong', country: 'Hong Kong', code: 'HKG' },
    { city: 'Taipei', region: 'Taipei', country: 'Taiwan', code: 'TPE / TSA' },

    // Internasional - Timur Tengah
    { city: 'Dubai', region: 'Dubai', country: 'United Arab Emirates', code: 'DXB' },
    { city: 'Abu Dhabi', region: 'Abu Dhabi', country: 'United Arab Emirates', code: 'AUH' },
    { city: 'Doha', region: 'Doha', country: 'Qatar', code: 'DOH' },
    { city: 'Riyadh', region: 'Riyadh', country: 'Saudi Arabia', code: 'RUH' },
    { city: 'Jeddah', region: 'Makkah', country: 'Saudi Arabia', code: 'JED' },

    // Internasional - Australia & Pasifik
    { city: 'Sydney', region: 'New South Wales', country: 'Australia', code: 'SYD' },
    { city: 'Melbourne', region: 'Victoria', country: 'Australia', code: 'MEL' },
    { city: 'Perth', region: 'Western Australia', country: 'Australia', code: 'PER' },
    { city: 'Brisbane', region: 'Queensland', country: 'Australia', code: 'BNE' },
    { city: 'Auckland', region: 'North Island', country: 'New Zealand', code: 'AKL' },

    // Internasional - Eropa
    { city: 'London', region: 'England', country: 'United Kingdom', code: 'LHR / LGW' },
    { city: 'Paris', region: 'Île-de-France', country: 'France', code: 'CDG' },
    { city: 'Amsterdam', region: 'North Holland', country: 'Netherlands', code: 'AMS' },
    { city: 'Frankfurt', region: 'Hesse', country: 'Germany', code: 'FRA' },
    { city: 'Munich', region: 'Bavaria', country: 'Germany', code: 'MUC' },
    { city: 'Zurich', region: 'Zurich', country: 'Switzerland', code: 'ZRH' },
    { city: 'Istanbul', region: 'Marmara', country: 'Turkey', code: 'IST' },

    // Internasional - Amerika
    { city: 'New York', region: 'New York', country: 'United States', code: 'JFK / EWR' },
    { city: 'Los Angeles', region: 'California', country: 'United States', code: 'LAX' },
    { city: 'San Francisco', region: 'California', country: 'United States', code: 'SFO' },
    { city: 'Chicago', region: 'Illinois', country: 'United States', code: 'ORD' },
    { city: 'Houston', region: 'Texas', country: 'United States', code: 'IAH' },
    { city: 'Toronto', region: 'Ontario', country: 'Canada', code: 'YYZ' },
];

/**
 * Mencari kota yang cocok dengan query teks.
 */
export function searchCities(query: string): CityItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR_CITIES.slice(0, 15);

    return POPULAR_CITIES.filter((item) => {
        return (
            item.city.toLowerCase().includes(q) ||
            item.region.toLowerCase().includes(q) ||
            item.country.toLowerCase().includes(q) ||
            (item.code && item.code.toLowerCase().includes(q))
        );
    }).slice(0, 15);
}

