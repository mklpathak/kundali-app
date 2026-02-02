'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChartData {
    chart_code: string;
    chart_name: string;
    houses: Record<string, Array<{ planet: string; abbr: string; retrograde: boolean }>>;
    house_display: Record<string, string>;
}

interface ChartsResponse {
    lagna_chart: ChartData;
    moon_chart: ChartData;
    navamsha_chart: ChartData;
}

export default function ChartsPage() {
    const router = useRouter();
    const [charts, setCharts] = useState<ChartsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeChart, setActiveChart] = useState<'lagna' | 'moon' | 'navamsha'>('lagna');

    useEffect(() => {
        const stored = sessionStorage.getItem('kundaliData');
        if (!stored) {
            router.push('/');
            return;
        }

        const data = JSON.parse(stored);
        const dobParts = data.dob.split('-');
        const formattedDob = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

        fetch(`http://127.0.0.1:8000/astro/calculate/charts?dob=${formattedDob}&tob=${data.tob}&lat=${data.lat}&lon=${data.lon}`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                setCharts(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="loader-vedic mb-4"></div>
                <p className="text-[#8B0000]">Loading Charts...</p>
            </div>
        );
    }

    const currentChart = activeChart === 'lagna'
        ? charts?.lagna_chart
        : activeChart === 'moon'
            ? charts?.moon_chart
            : charts?.navamsha_chart;

    return (
        <div className="py-10 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">Horoscope Charts</h1>
                    <p className="text-[#8B7355]">जन्म कुण्डली चार्ट</p>
                </div>

                {/* Chart Selector */}
                <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    <button
                        onClick={() => setActiveChart('lagna')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeChart === 'lagna'
                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#8B0000] text-white shadow-lg'
                                : 'bg-white border-2 border-[#FFD700] text-[#8B0000] hover:bg-[#FFF8E7]'
                            }`}
                    >
                        🌟 Lagna Chart
                    </button>
                    <button
                        onClick={() => setActiveChart('moon')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeChart === 'moon'
                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#8B0000] text-white shadow-lg'
                                : 'bg-white border-2 border-[#FFD700] text-[#8B0000] hover:bg-[#FFF8E7]'
                            }`}
                    >
                        🌙 Moon Chart
                    </button>
                    <button
                        onClick={() => setActiveChart('navamsha')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeChart === 'navamsha'
                                ? 'bg-gradient-to-r from-[#FF6B35] to-[#8B0000] text-white shadow-lg'
                                : 'bg-white border-2 border-[#FFD700] text-[#8B0000] hover:bg-[#FFF8E7]'
                            }`}
                    >
                        ♦️ Navamsha (D9)
                    </button>
                </div>

                {/* Chart Display */}
                <div className="card-vedic p-8">
                    <h2 className="text-xl font-bold text-[#FF6B35] text-center mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                        {currentChart?.chart_name}
                    </h2>
                    <p className="text-center text-[#8B7355] text-sm mb-8">
                        {activeChart === 'lagna' && 'Birth Chart - Ascendant Based'}
                        {activeChart === 'moon' && 'Moon Sign Based Chart'}
                        {activeChart === 'navamsha' && 'Divisional Chart for Marriage & Spirituality'}
                    </p>

                    {/* North Indian Style Chart */}
                    <div className="flex justify-center">
                        <NorthIndianChart houses={currentChart?.house_display || {}} />
                    </div>

                    {/* House Legend */}
                    <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((house) => (
                            <div key={house} className="p-2 bg-[#FFFACD] rounded border border-[#FFD700] text-center">
                                <span className="text-xs text-[#666]">H{house}: </span>
                                <span className="font-bold text-[#8B0000] text-sm">
                                    {currentChart?.house_display?.[house.toString()] || '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function NorthIndianChart({ houses }: { houses: Record<string, string> }) {
    // Correct North Indian Chart Geometry:
    // 1. Square Bounding Box
    // 2. Main Diagonals X
    // 3. Inscribed Diamond (Midpoint Connectors)
    // This combination automatically creates the 12 houses segments correctly.

    const s = 360; // Total size
    const m = 5;   // Margin
    const w = s - 2 * m; // Inner width
    const h = w / 2; // Half point (180 if m=0)

    // Adjusted midpoints with margin
    const c = s / 2;     // Center

    // Vertices for lines
    // Top-Left: m,m
    // Top-Right: s-m, m
    // Bottom-Left: m, s-m
    // Bottom-Right: s-m, s-m

    // Midpoints
    // Top-Mid: c, m
    // Bottom-Mid: c, s-m
    // Left-Mid: m, c
    // Right-Mid: s-m, c

    // Text positioning
    const P = (x: number, y: number) => ({ x, y });

    // Coordinates relative to absolute size
    const pos = {
        // 4 Center Rhombuses (Planets closer to center)
        '1': P(c, c - 70),       // Top Center
        '4': P(c - 70, c),       // Left Center
        '7': P(c, c + 80),       // Bottom Center
        '10': P(c + 70, c),      // Right Center

        // 8 Triangles
        '2': P(c - 50, c - 120), // Top Left (Upper)
        '3': P(c - 120, c - 50), // Top Left (Lower/Left)
        '12': P(c + 50, c - 120),// Top Right (Upper)
        '11': P(c + 120, c - 50),// Top Right (Rightside)
        '5': P(c - 120, c + 50), // Bottom Left (Upper/Left)
        '6': P(c - 50, c + 120), // Bottom Left (Lower)
        '8': P(c + 120, c + 120),// Bottom Right (Lower)
        '9': P(c + 120, c + 50), // Bottom Right (Upper/Right)
    };

    // Small House Numbers positioning
    const numPos = {
        '1': P(c, c - 30),
        '4': P(c - 30, c),
        '7': P(c, c + 30),
        '10': P(c + 30, c),
        '2': P(c - 30, c - 140),
        '3': P(c - 140, c - 30),
        '12': P(c + 30, c - 140),
        '11': P(c + 140, c - 30),
        '5': P(c - 140, c + 35),
        '6': P(c - 30, c + 145),
        '8': P(c + 140, c + 145), // Adjusted
        '9': P(c + 140, c + 35),
    };

    return (
        <svg
            width={s}
            height={s}
            viewBox={`0 0 ${s} ${s}`}
            className="drop-shadow-lg scale-100" // Reset scale
            style={{ maxWidth: '100%', height: 'auto' }}
        >
            {/* Background */}
            <rect x="0" y="0" width={s} height={s} fill="#FFFACD" />

            {/* Outer red border */}
            <rect x={m} y={m} width={w} height={w} fill="none" stroke="#FF6B35" strokeWidth="4" />

            {/* GEOMETRY: The 6 lines that make the chart */}

            {/* Diagonals (Corner to Corner) */}
            <line x1={m} y1={m} x2={s - m} y2={s - m} stroke="#FF6B35" strokeWidth="2" />
            <line x1={s - m} y1={m} x2={m} y2={s - m} stroke="#FF6B35" strokeWidth="2" />

            {/* Inscribed Diamond (Midpoint to Midpoint) */}
            {/* This automatically creates the correct North Indian layout */}
            <polygon
                points={`${c},${m} ${s - m},${c} ${c},${s - m} ${m},${c}`}
                fill="none"
                stroke="#FF6B35"
                strokeWidth="2"
            />

            {/* House numbers and planets */}
            {Object.entries(pos).map(([houseNum, p]) => (
                <g key={houseNum}>
                    {/* House Number (small, grey) */}
                    <text
                        x={numPos[houseNum as keyof typeof numPos].x}
                        y={numPos[houseNum as keyof typeof numPos].y}
                        fontSize="12"
                        fill="#999"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {houseNum}
                    </text>

                    {/* Planets (larger, maroon) */}
                    <text
                        x={p.x}
                        y={p.y}
                        fontSize="14"
                        fill="#8B0000"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                    >
                        {houses[houseNum] || ''}
                    </text>
                </g>
            ))}
        </svg>
    );
}
