'use client';

import React from 'react';
import { Card } from 'antd';
import styles from './KundaliChart.module.css';

interface Planet {
    name?: string;
    planet?: string;
    abbr?: string;
    isRetrograde?: boolean;
    retrograde?: boolean;
}

interface House {
    house_number: number;
    sign: string;
    sign_hindi?: string;
    planets: Planet[] | string[];
    is_ascendant?: boolean;
}

// Houses can be either array format or object format {"1": [...], "2": [...]}
type HousesData = House[] | Record<string, Planet[] | string[]>;

interface KundaliChartProps {
    title: string;
    houses: HousesData;
    ascendantSign: string;
}

// North Indian Chart Layout - The classic diamond pattern
// The chart is a 4x4 grid with diagonal lines creating triangular houses
// House arrangement (looking at the reference):
//   Top row: 12 | 1 | 2
//   Left: 11, 10, 9 | Right: 3, 4, 5
//   Bottom row: 8 | 7 | 6

const getPlanetAbbr = (planet: string | Planet): string => {
    if (typeof planet !== 'string' && planet.abbr) return planet.abbr;
    const name = typeof planet === 'string' ? planet : (planet.planet || planet.name || '');
    const abbrs: Record<string, string> = {
        'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
        'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa', 'Rahu': 'Ra', 'Ketu': 'Ke',
        'Ascendant': 'As', 'Lagna': 'As',
    };
    return abbrs[name] || name.substring(0, 2);
};

const isRetrograde = (planet: string | Planet): boolean => {
    if (typeof planet === 'string') return false;
    return planet.isRetrograde || planet.retrograde || false;
};

export default function KundaliChart({ title, houses, ascendantSign }: KundaliChartProps) {
    // Handle both array format and object format for houses
    const getHousePlanets = (houseNum: number): string => {
        let planets: (Planet | string)[] = [];

        // If houses is an object (like {"1": [...], "2": [...]})
        if (houses && !Array.isArray(houses)) {
            planets = houses[houseNum.toString()] || [];
        } else if (Array.isArray(houses)) {
            const house = houses.find(h => h.house_number === houseNum);
            planets = house?.planets || [];
        }

        return planets.map(p => {
            const abbr = getPlanetAbbr(p);
            return isRetrograde(p) ? `${abbr}(R)` : abbr;
        }).join(' ');
    };

    // SVG dimensions
    const size = 300;
    const padding = 2;

    return (
        <Card className={styles.chartCard} title={<span className="gold-text">{title}</span>}>
            <div className={styles.chartContainer}>
                <svg viewBox={`0 0 ${size} ${size}`} className={styles.chartSvg}>
                    {/* Cream/Yellow background */}
                    <rect
                        x={padding}
                        y={padding}
                        width={size - 2 * padding}
                        height={size - 2 * padding}
                        fill="#FFF8DC"
                        stroke="#E65100"
                        strokeWidth="3"
                    />

                    {/* Orange outer border */}
                    <rect
                        x={padding}
                        y={padding}
                        width={size - 2 * padding}
                        height={size - 2 * padding}
                        fill="none"
                        stroke="#FF6F00"
                        strokeWidth="4"
                    />

                    {/* Purple diagonal lines - Main diamond */}
                    {/* Outer diamond */}
                    <line x1="150" y1="0" x2="0" y2="150" stroke="#6A1B9A" strokeWidth="2" />
                    <line x1="150" y1="0" x2="300" y2="150" stroke="#6A1B9A" strokeWidth="2" />
                    <line x1="0" y1="150" x2="150" y2="300" stroke="#6A1B9A" strokeWidth="2" />
                    <line x1="300" y1="150" x2="150" y2="300" stroke="#6A1B9A" strokeWidth="2" />

                    {/* Inner diamond (center) */}
                    <line x1="75" y1="75" x2="225" y2="75" stroke="#6A1B9A" strokeWidth="1.5" />
                    <line x1="225" y1="75" x2="225" y2="225" stroke="#6A1B9A" strokeWidth="1.5" />
                    <line x1="225" y1="225" x2="75" y2="225" stroke="#6A1B9A" strokeWidth="1.5" />
                    <line x1="75" y1="225" x2="75" y2="75" stroke="#6A1B9A" strokeWidth="1.5" />

                    {/* Diagonal lines inside inner square */}
                    <line x1="75" y1="75" x2="150" y2="150" stroke="#6A1B9A" strokeWidth="1.5" />
                    <line x1="225" y1="75" x2="150" y2="150" stroke="#6A1B9A" strokeWidth="1.5" />
                    <line x1="225" y1="225" x2="150" y2="150" stroke="#6A1B9A" strokeWidth="1.5" />
                    <line x1="75" y1="225" x2="150" y2="150" stroke="#6A1B9A" strokeWidth="1.5" />

                    {/* House 1 - Top center diamond */}
                    <text x="150" y="55" textAnchor="middle" className={styles.houseNumber}>1</text>
                    <text x="150" y="75" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(1)}
                    </text>

                    {/* House 2 - Top right triangle */}
                    <text x="240" y="40" textAnchor="middle" className={styles.houseNumber}>2</text>
                    <text x="240" y="60" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(2)}
                    </text>

                    {/* House 3 - Right upper */}
                    <text x="255" y="105" textAnchor="middle" className={styles.houseNumber}>3</text>
                    <text x="255" y="125" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(3)}
                    </text>

                    {/* House 4 - Right center */}
                    <text x="260" y="180" textAnchor="middle" className={styles.houseNumber}>4</text>
                    <text x="260" y="200" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(4)}
                    </text>

                    {/* House 5 - Right lower / center right */}
                    <text x="195" y="140" textAnchor="middle" className={styles.houseNumber}>5</text>
                    <text x="195" y="160" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(5)}
                    </text>

                    {/* House 6 - Bottom right triangle */}
                    <text x="240" y="260" textAnchor="middle" className={styles.houseNumber}>6</text>
                    <text x="240" y="280" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(6)}
                    </text>

                    {/* House 7 - Bottom center */}
                    <text x="150" y="245" textAnchor="middle" className={styles.houseNumber}>7</text>
                    <text x="150" y="265" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(7)}
                    </text>

                    {/* House 8 - Bottom left triangle */}
                    <text x="60" y="260" textAnchor="middle" className={styles.houseNumber}>8</text>
                    <text x="60" y="280" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(8)}
                    </text>

                    {/* House 9 - Left lower */}
                    <text x="40" y="180" textAnchor="middle" className={styles.houseNumber}>9</text>
                    <text x="40" y="200" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(9)}
                    </text>

                    {/* House 10 - Left upper */}
                    <text x="40" y="105" textAnchor="middle" className={styles.houseNumber}>10</text>
                    <text x="40" y="125" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(10)}
                    </text>

                    {/* House 11 - Center left */}
                    <text x="105" y="140" textAnchor="middle" className={styles.houseNumber}>11</text>
                    <text x="105" y="160" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(11)}
                    </text>

                    {/* House 12 - Top left triangle */}
                    <text x="60" y="40" textAnchor="middle" className={styles.houseNumber}>12</text>
                    <text x="60" y="60" textAnchor="middle" className={styles.planetText}>
                        {getHousePlanets(12)}
                    </text>
                </svg>
            </div>
            <div className={styles.chartFooter}>
                <span>Ascendant: <strong className="gold-text">{ascendantSign}</strong></span>
            </div>
        </Card>
    );
}
