'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DashaLevel {
    lord: string;
    start_date: string;
    end_date: string;
    effects?: {
        general: string;
        positive: string;
        negative: string;
    };
}

interface CurrentDasha {
    as_of_date: string;
    mahadasha: DashaLevel;
    antardasha: DashaLevel;
    pratyantardasha: DashaLevel;
    sookshma_dasha: DashaLevel;
    combined_period: string;
}

interface Antardasha {
    lord: string;
    start_date: string;
    end_date: string;
    duration_years: number;
}

interface Mahadasha {
    lord: string;
    start_date: string;
    end_date: string;
    years: number;
    antardashas: Antardasha[];
}

interface DashaResponse {
    dasha_system: string;
    birth_nakshatra: string;
    birth_lord: string;
    balance_at_birth: string;
    mahadashas: Mahadasha[];
}

export default function DashaPage() {
    const router = useRouter();
    const [currentDasha, setCurrentDasha] = useState<CurrentDasha | null>(null);
    const [fullDasha, setFullDasha] = useState<DashaResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedMD, setExpandedMD] = useState<string | null>(null);

    const planetColors: Record<string, string> = {
        'Sun': '#FF6B35',
        'Moon': '#C0C0C0',
        'Mars': '#DC143C',
        'Mercury': '#32CD32',
        'Jupiter': '#FFD700',
        'Venus': '#FF69B4',
        'Saturn': '#4169E1',
        'Rahu': '#8B4513',
        'Ketu': '#808080'
    };

    useEffect(() => {
        const stored = sessionStorage.getItem('kundaliData');
        if (!stored) {
            router.push('/');
            return;
        }

        const data = JSON.parse(stored);
        const dobParts = data.dob.split('-');
        const formattedDob = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

        // Fetch current dasha
        fetch(`http://127.0.0.1:8000/astro/calculate/dasha/current?dob=${formattedDob}&tob=${data.tob}&lat=${data.lat}&lon=${data.lon}`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => setCurrentDasha(data))
            .catch(() => { });

        // Fetch full dasha
        fetch(`http://127.0.0.1:8000/astro/calculate/dasha?dob=${formattedDob}&tob=${data.tob}&lat=${data.lat}&lon=${data.lon}`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                setFullDasha(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    const scrollToCurrent = () => {
        if (currentDasha && expandedMD !== currentDasha.mahadasha.lord) {
            setExpandedMD(currentDasha.mahadasha.lord);
            setTimeout(() => {
                const el = document.getElementById(`md-${currentDasha.mahadasha.lord}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="loader-vedic mb-4"></div>
                <p className="text-[#8B0000]">Loading Vimshottari Dasha...</p>
            </div>
        );
    }

    return (
        <div className="py-10 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Vimshottari Dasha</h1>
                    <p className="text-[#8B7355]">विंशोत्तरी दशा - 120 Year Cycle</p>
                </div>

                {/* Birth Info */}
                <div className="card-vedic p-6 mb-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
                    <div>
                        <p className="text-sm text-[#8B7355]">Birth Nakshatra</p>
                        <p className="text-xl font-bold text-[#8B0000]">{fullDasha?.birth_nakshatra}</p>
                    </div>
                    <div>
                        <p className="text-sm text-[#8B7355]">Dasha Balance</p>
                        <p className="text-xl font-bold text-[#8B0000]">{fullDasha?.balance_at_birth}</p>
                    </div>
                    <button
                        onClick={scrollToCurrent}
                        className="px-4 py-2 bg-[#8B0000] text-white rounded-full text-sm hover:bg-[#A52A2A] transition-colors"
                    >
                        Jump to Current
                    </button>
                </div>

                {/* Current Dasha Highlights */}
                {currentDasha && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <CurrentCard level="Mahadasha" data={currentDasha.mahadasha} color={planetColors} />
                        <CurrentCard level="Antardasha" data={currentDasha.antardasha} color={planetColors} />
                        <CurrentCard level="Pratyantar" data={currentDasha.pratyantardasha} color={planetColors} />
                        <CurrentCard level="Sookshma" data={currentDasha.sookshma_dasha} color={planetColors} />
                    </div>
                )}

                {/* Main Timeline Table */}
                <div className="card-vedic overflow-hidden">
                    <div className="bg-[#8B0000] text-white p-4 grid grid-cols-12 font-bold text-sm md:text-base">
                        <div className="col-span-4 md:col-span-3">Planet (Lord)</div>
                        <div className="col-span-2 text-center">Duration</div>
                        <div className="col-span-6 md:col-span-7 text-right pr-4">Period</div>
                    </div>

                    <div className="divide-y divide-[#F5E6C8]">
                        {fullDasha?.mahadashas?.map((md, idx) => (
                            <div key={idx} id={`md-${md.lord}`} className={`transition-colors ${expandedMD === md.lord ? 'bg-[#FFF8E7]' : 'bg-white hover:bg-[#FFFDF5]'}`}>
                                {/* Mahadasha Row */}
                                <div
                                    className="p-4 grid grid-cols-12 items-center cursor-pointer"
                                    onClick={() => setExpandedMD(expandedMD === md.lord ? null : md.lord)}
                                >
                                    <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs md:hidden`}
                                            style={{ backgroundColor: planetColors[md.lord] }}>
                                            {md.lord[0]}
                                        </div>
                                        <div className="hidden md:flex w-8 h-8 rounded-full items-center justify-center text-white font-bold text-xs"
                                            style={{ backgroundColor: planetColors[md.lord] }}>
                                            {md.lord.substring(0, 2)}
                                        </div>
                                        <span className="font-bold text-[#2D1810]">{md.lord}</span>
                                        {currentDasha?.mahadasha.lord === md.lord && (
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] rounded-full font-bold uppercase tracking-wider">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-center text-sm text-[#8B7355]">
                                        {md.years}y
                                    </div>
                                    <div className="col-span-6 md:col-span-7 text-right font-medium text-[#5C4033] text-sm pr-4">
                                        {md.start_date.split(' ')[0]} — {md.end_date.split(' ')[0]}
                                    </div>
                                </div>

                                {/* Antardasha Expansion */}
                                {expandedMD === md.lord && (
                                    <div className="bg-[#FFFDE7] border-y border-[#FFE4B5]">
                                        <div className="px-4 py-2 text-xs font-bold text-[#B8860B] uppercase tracking-widest pl-12 border-b border-[#F5E6C8]">
                                            Antardasha (Sub-Period)
                                        </div>
                                        {md.antardashas?.map((ad, adIdx) => (
                                            <div key={adIdx} className="grid grid-cols-12 py-2 px-4 pl-12 items-center hover:bg-[#FFF8E1] text-sm border-b border-dashed border-[#F5E6C8] last:border-0">
                                                <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: planetColors[ad.lord] }}></div>
                                                    <span className="text-[#4A3B32]">{ad.lord}</span>
                                                    {currentDasha?.mahadasha.lord === md.lord && currentDasha?.antardasha.lord === ad.lord && (
                                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" title="Current"></span>
                                                    )}
                                                </div>
                                                <div className="col-span-2 text-center text-xs text-[#8B7355]">
                                                    -
                                                </div>
                                                <div className="col-span-6 md:col-span-7 text-right text-[#5C4033] text-xs pr-4 font-mono">
                                                    {ad.end_date.split(' ')[0]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CurrentCard({ level, data, color }: { level: string; data?: DashaLevel; color: Record<string, string> }) {
    if (!data) return null;
    return (
        <div className="bg-white p-3 rounded-lg border-t-4 shadow-sm" style={{ borderColor: color[data.lord] || '#8B0000' }}>
            <p className="text-[10px] uppercase tracking-wider text-[#8B7355] mb-1">{level}</p>
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold text-[#2D1810]">{data.lord}</span>
            </div>
            <p className="text-xs text-[#5C4033] truncate">Ends: {data.end_date.split(' ')[0]}</p>
        </div>
    );
}
