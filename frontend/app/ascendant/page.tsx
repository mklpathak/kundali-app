'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AscendantReport {
    sign: string;
    lord: string;
    symbol: string;
    characteristics: string;
    lucky_gems: string;
    day_of_fast: string;
    description: string;
    spiritual_lesson: string;
    positive_traits: string[];
    negative_traits: string[];
}

interface AscendantResponse {
    ascendant: string;
    degree: number;
    nakshatra: string;
    nakshatra_pada: number;
    report: AscendantReport;
}

export default function AscendantPage() {
    const router = useRouter();
    const [data, setData] = useState<AscendantResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const signSymbols: Record<string, string> = {
        'Aries': '♈',
        'Taurus': '♉',
        'Gemini': '♊',
        'Cancer': '♋',
        'Leo': '♌',
        'Virgo': '♍',
        'Libra': '♎',
        'Scorpio': '♏',
        'Sagittarius': '♐',
        'Capricorn': '♑',
        'Aquarius': '♒',
        'Pisces': '♓'
    };

    useEffect(() => {
        const stored = sessionStorage.getItem('kundaliData');
        if (!stored) {
            router.push('/');
            return;
        }

        const formData = JSON.parse(stored);
        const dobParts = formData.dob.split('-');
        const formattedDob = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

        fetch(`http://127.0.0.1:8000/astro/calculate/ascendant-report?dob=${formattedDob}&tob=${formData.tob}&lat=${formData.lat}&lon=${formData.lon}`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="loader-vedic mb-4"></div>
                <p className="text-[#8B0000]">Loading Ascendant Report...</p>
            </div>
        );
    }

    const report = data?.report;

    return (
        <div className="py-10 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4">{signSymbols[data?.ascendant || ''] || '⭐'}</div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        Ascendant Report - {data?.ascendant}
                    </h1>
                    <p className="text-[#8B7355]">लग्न राशि फल</p>
                </div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <InfoCard label="Ascendant" value={data?.ascendant} />
                    <InfoCard label="Lord" value={report?.lord} />
                    <InfoCard label="Symbol" value={report?.symbol} />
                    <InfoCard label="Lucky Gems" value={report?.lucky_gems} />
                    <InfoCard label="Fast Day" value={report?.day_of_fast} />
                </div>

                {/* Characteristics */}
                <div className="card-vedic p-6 mb-6">
                    <h2 className="section-title mb-4">Characteristics</h2>
                    <div className="flex flex-wrap gap-2">
                        {report?.characteristics.split(', ').map((char, idx) => (
                            <span key={idx} className="px-4 py-2 bg-[#FFF8E7] border border-[#FFD700] rounded-full text-[#8B0000] font-medium">
                                {char}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Nakshatra Info */}
                <div className="card-vedic p-6 mb-6 bg-gradient-to-r from-[#1A237E] to-[#3949AB] text-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <p className="text-sm opacity-75">Nakshatra</p>
                            <p className="text-xl font-bold">{data?.nakshatra}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-75">Pada (Charan)</p>
                            <p className="text-xl font-bold">{data?.nakshatra_pada}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-75">Degree</p>
                            <p className="text-xl font-bold">{data?.degree?.toFixed(2)}°</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card-vedic p-6 mb-6">
                    <h2 className="section-title mb-4">Personality Analysis</h2>
                    <p className="text-[#5C4033] leading-relaxed whitespace-pre-line">
                        {report?.description}
                    </p>
                </div>

                {/* Spiritual Lesson */}
                <div className="card-vedic p-6 mb-6 text-center bg-gradient-to-br from-[#FFF8E7] to-[#FFE4B5]">
                    <div className="text-4xl mb-4">🙏</div>
                    <h2 className="text-lg font-bold text-[#8B0000] mb-2">Spiritual Lesson to Learn</h2>
                    <p className="text-sm text-[#8B7355]">आध्यात्मिक सीख</p>
                    <p className="text-2xl font-bold text-[#8B0000] mt-4">{report?.spiritual_lesson}</p>
                </div>

                {/* Traits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Positive Traits */}
                    <div className="card-vedic p-6">
                        <h2 className="section-title mb-4 text-green-700">✨ Positive Traits</h2>
                        <p className="text-sm text-[#8B7355] mb-4">सकारात्मक गुण</p>
                        <div className="space-y-3">
                            {report?.positive_traits.map((trait, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <span className="text-green-600 text-xl">✓</span>
                                    <span className="font-medium text-green-800">{trait}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Negative Traits */}
                    <div className="card-vedic p-6">
                        <h2 className="section-title mb-4 text-red-700">⚠️ Challenges to Overcome</h2>
                        <p className="text-sm text-[#8B7355] mb-4">सुधार के क्षेत्र</p>
                        <div className="space-y-3">
                            {report?.negative_traits.map((trait, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <span className="text-red-600 text-xl">!</span>
                                    <span className="font-medium text-red-800">{trait}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value?: string }) {
    return (
        <div className="card-vedic p-4 text-center">
            <p className="text-xs text-[#8B7355] mb-1">{label}</p>
            <p className="font-bold text-[#8B0000]">{value || '-'}</p>
        </div>
    );
}
