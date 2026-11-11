import React, { useState, useRef, useEffect } from 'react';
import {
    Plane,
    Train,
    Bus,
    Ship,
    Anchor,
    Search,
    ChevronDown,
    Check,
    AlertCircle,
    MapPin,
    Building2,
} from 'lucide-react';
import {
    TransportHubMode,
    TransportHubItem,
    searchTransportHubs,
    formatHubDisplay,
} from '@/lib/transportHubs';

interface TransportHubComboboxProps {
    id?: string;
    label: string;
    mode: TransportHubMode;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    excludeValue?: string;
    hasError?: boolean;
    errorMessage?: string;
    helperText?: string;
}

export default function TransportHubCombobox({
    id,
    label,
    mode,
    value,
    onChange,
    placeholder,
    required = false,
    excludeValue,
    hasError = false,
    errorMessage,
    helperText,
}: TransportHubComboboxProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<TransportHubItem[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sinkronkan query dengan value eksternal
    useEffect(() => {
        setQuery(value);
    }, [value]);

    // Cari daftar hub berdasarkan moda dan teks query
    useEffect(() => {
        setResults(searchTransportHubs(mode, query));
    }, [mode, query]);

    // Tutup dropdown jika klik di luar komponen
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectHub = (item: TransportHubItem) => {
        const formatted = formatHubDisplay(item);
        setQuery(formatted);
        onChange(formatted);
        setIsOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        setQuery(newVal);
        onChange(newVal);
        setIsOpen(true);
    };

    // Placeholder dinamis berdasarkan moda jika tidak disuplai
    const dynamicPlaceholder =
        placeholder ||
        (mode === 'Pesawat'
            ? 'Ketik nama bandara, kode (CGK/SUB), atau kota...'
            : mode === 'Kereta'
            ? 'Ketik nama stasiun, kode (GMR/SBI), atau kota...'
            : mode === 'Bus'
            ? 'Ketik nama terminal, pool shuttle, atau kota...'
            : mode === 'Kapal'
            ? 'Ketik nama pelabuhan laut, PELNI, atau kota...'
            : 'Ketik dermaga feri penyeberangan atau kota...');

    // Ikon dinamis berdasarkan moda
    const renderModeIcon = () => {
        const iconClasses = 'w-4 h-4';
        switch (mode) {
            case 'Pesawat':
                return <Plane className={iconClasses} />;
            case 'Kereta':
                return <Train className={iconClasses} />;
            case 'Bus':
                return <Bus className={iconClasses} />;
            case 'Kapal':
                return <Ship className={iconClasses} />;
            case 'Feri':
                return <Anchor className={iconClasses} />;
            default:
                return <MapPin className={iconClasses} />;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <label htmlFor={id} className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                {label} {required && <span className="text-rose-500">*</span>}
            </label>

            <div className="relative">
                <div
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition ${
                        hasError ? 'text-rose-500' : 'text-[#3152A3]'
                    } pointer-events-none`}
                >
                    {renderModeIcon()}
                </div>

                <input
                    id={id}
                    type="text"
                    required={required}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={dynamicPlaceholder}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className={`w-full h-[40px] pl-10 pr-9 py-2.5 text-xs text-[#0F172A] placeholder-[#94A3B8] border rounded-xl focus:outline-none transition ${
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

            {/* Helper Text Informasi */}
            {helperText && !hasError && (
                <span className="text-[10px] text-[#64748B] mt-1 block">
                    {helperText}
                </span>
            )}

            {/* Error Message Inline */}
            {hasError && errorMessage && (
                <div className="text-rose-600 text-[11px] font-medium flex items-center gap-1.5 mt-1.5 animate-in fade-in duration-100">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Dropdown Menu Hasil Pencarian Hub */}
            {isOpen && (
                <div className="absolute left-0 right-0 mt-1.5 max-h-64 bg-white rounded-xl shadow-xl border border-[#CBD5E1] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-[#F1F5F9]">
                    <div className="px-3 py-1.5 bg-[#F8FAFC] text-[10px] font-semibold text-[#64748B] flex items-center justify-between">
                        <span>Pilihan {mode} Populer</span>
                        <span>{results.length} lokasi</span>
                    </div>

                    {results.length > 0 ? (
                        results.slice(0, 40).map((item, idx) => {
                            const formatted = formatHubDisplay(item);
                            const isSelected = value.trim() === formatted;
                            const isExcluded = Boolean(
                                excludeValue &&
                                    excludeValue.trim().toLowerCase() === formatted.trim().toLowerCase()
                            );

                            return (
                                <button
                                    key={`${item.name}-${idx}`}
                                    type="button"
                                    onClick={() => handleSelectHub(item)}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition cursor-pointer ${
                                        isExcluded
                                            ? 'opacity-60 bg-[#FFF1F2] text-rose-600 hover:bg-[#FFE4E6]'
                                            : isSelected
                                            ? 'bg-[#EEF2F6] font-semibold text-[#3152A3]'
                                            : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                                    }`}
                                >
                                    <div className="flex items-start gap-2.5 overflow-hidden">
                                        <div className="p-1 rounded bg-[#EEF2F6] text-[#3152A3] shrink-0 mt-0.5">
                                            {renderModeIcon()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="truncate flex items-center gap-1.5">
                                                <span className="font-bold text-[#0F172A]">{item.city}</span>
                                                <span className="text-[#475569]">- {item.name}</span>
                                                {item.code && (
                                                    <span className="text-[10px] text-[#3152A3] bg-[#E0E7FF] font-bold px-1.5 py-0.2 rounded shrink-0">
                                                        {item.code}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[10px] text-[#64748B] truncate flex items-center gap-1.5 mt-0.5">
                                                <span>{item.province}</span>
                                                <span>•</span>
                                                <span className="text-[#94A3B8]">{item.typeLabel}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <Check className="w-3.5 h-3.5 text-[#3152A3] shrink-0 ml-2" />
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="p-3 text-center text-xs text-[#64748B]">
                            Tidak ditemukan {mode.toLowerCase()} yang sesuai dengan "{query}".
                        </div>
                    )}

                    {/* Opsi Gunakan Teks Kustom jika user mengetik terminal/stasiun lokal atau site proyek */}
                    {query.trim().length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                onChange(query.trim());
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3.5 py-2.5 text-xs bg-[#F8FAFC] hover:bg-[#EEF2F6] text-[#3152A3] font-medium transition cursor-pointer flex items-center gap-2 border-t border-[#E2E8F0]"
                        >
                            <Building2 className="w-3.5 h-3.5 text-[#3152A3] shrink-0" />
                            <div className="overflow-hidden">
                                <span className="text-[11px] text-[#64748B] block">Gunakan lokasi khusus / remote:</span>
                                <strong className="underline truncate block text-[#3152A3]">"{query}"</strong>
                            </div>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
