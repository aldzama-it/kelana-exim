import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { CityItem, searchCities } from '@/lib/cities';

interface CityComboboxProps {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    excludeCity?: string;
    hasError?: boolean;
    errorMessage?: string;
    onExcludedClick?: (item: CityItem) => void;
}

function normalizeCity(raw: string): string {
    if (!raw) return '';
    return raw.split(',')[0].trim().toLowerCase();
}

export default function CityCombobox({
    id,
    label,
    value,
    onChange,
    placeholder = 'Ketik atau pilih kota...',
    required = false,
    excludeCity,
    hasError = false,
    errorMessage,
    onExcludedClick,
}: CityComboboxProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<CityItem[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sinkronkan nilai eksternal jika berubah
    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        setResults(searchCities(query));
    }, [query]);

    // Tutup dropdown jika klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectCity = (item: CityItem) => {
        const display = `${item.city}, ${item.country}`;
        setQuery(display);
        onChange(display);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setQuery(newVal);
        onChange(newVal);
        setIsOpen(true);
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <label htmlFor={id} className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>

            <div className="relative">
                <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition ${
                        hasError ? 'text-rose-500' : 'text-[#94A3B8]'
                    } pointer-events-none`}
                >
                    <MapPin className="w-4 h-4" />
                </div>

                <input
                    id={id}
                    type="text"
                    required={required}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`w-full h-[38px] pl-10 pr-9 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] border rounded-xl focus:outline-none transition ${
                        hasError
                            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-[#CBD5E1] bg-white focus:ring-2 focus:ring-[#3152A3] focus:border-transparent'
                    }`}
                />

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] transition cursor-pointer"
                >
                    <ChevronDown className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Error Message Inline */}
            {hasError && errorMessage && (
                <div className="text-rose-600 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-100">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Dropdown Menu Hasil Pencarian */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-1.5 max-h-60 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-[#F1F5F9]">
                    {results.length > 0 ? (
                        results.map((item, idx) => {
                            const isSelected = value.toLowerCase().includes(item.city.toLowerCase());
                            const isExcluded = Boolean(
                                excludeCity && normalizeCity(item.city) === normalizeCity(excludeCity)
                            );

                            return (
                                <button
                                    key={`${item.city}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                        if (isExcluded) {
                                            if (onExcludedClick) {
                                                onExcludedClick(item);
                                            }
                                        } else {
                                            handleSelectCity(item);
                                        }
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition ${
                                        isExcluded
                                            ? 'opacity-70 bg-[#FFF1F2] text-rose-600 hover:bg-[#FFE4E6] cursor-pointer'
                                            : isSelected
                                            ? 'bg-[#EEF2F6] font-semibold text-[#3152A3] cursor-pointer'
                                            : 'text-[#0F172A] hover:bg-[#F8FAFC] cursor-pointer'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5 overflow-hidden">
                                        <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0 mt-0.5" />
                                        <div className="overflow-hidden">
                                            <div className="truncate flex items-center gap-1.5">
                                                <span>{item.city}</span>
                                                {item.code && (
                                                    <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-1.5 py-0.5 rounded">
                                                        {item.code}
                                                    </span>
                                                )}
                                                {isExcluded && (
                                                    <span className="text-[10px] text-rose-500 font-normal italic">
                                                        (Sama dengan kota asal)
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-[#64748B] truncate">
                                                {item.region ? `${item.region}, ` : ''}{item.country}
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && !isExcluded && (
                                        <Check className="w-3.5 h-3.5 text-[#3152A3] shrink-0" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-3 text-center text-xs text-[#64748B]">
                            Tidak ada kota yang cocok di daftar populer.
                        </div>
                    )}

                    {/* Opsi Gunakan Teks Kustom jika pengguna mengetik kota spesifik / remote site */}
                    {query.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange(query.trim());
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs bg-[#F8FAFC] hover:bg-[#EEF2F6] text-[#3152A3] font-medium transition cursor-pointer flex items-center gap-2"
                        >
                            <span>Gunakan lokasi khusus:</span>
                            <strong className="underline truncate">"{query}"</strong>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

