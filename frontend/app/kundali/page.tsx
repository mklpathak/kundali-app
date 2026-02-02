'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface KundaliData {
    name: string;
    dob: string;
    tob: string;
    place: string;
    lat: string;
    lon: string;
}

interface BasicDetails {
    date_of_birth: string;
    time_of_birth: string;
    place_of_birth: string;
    latitude: string;
    longitude: string;
    timezone: string;
    ayanamsha: string;
    sunrise: string;
    sunset: string;
}

interface PanchangDetails {
    month: string;
    tithi: string;
    day: string;
    nakshatra: string;
    yog: string;
    karan: string;
    prahar: number;
}

interface GhatChakra {
    varna: string;
    vashya: string;
    yoni: string;
    gan: string;
    nadi: string;
}

interface AstrologicalDetails {
    sign: string;
    sign_lord: string;
    nakshatra: string;
    nakshatra_lord: string;
    charan: number;
    yunja: string;
    tatva: string;
    name_alphabet: string;
    paya: string;
    ascendant: string;
    ascendant_lord: string;
}

interface ApiResponse {
    basic_details: BasicDetails;
    panchang_details: PanchangDetails;
    ghat_chakra: GhatChakra;
    astrological_details: AstrologicalDetails;
    planets: Array<{
        planet: string;
        sign: string;
        degree_in_sign: number;
        nakshatra: string;
        retrograde: boolean;
    }>;
}

export default function KundaliPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<KundaliData | null>(null);
    const [kundali, setKundali] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const stored = sessionStorage.getItem('kundaliData');
        if (!stored) {
            router.push('/');
            return;
        }

        const data = JSON.parse(stored) as KundaliData;
        setFormData(data);

        // Format date for API (dd/mm/yyyy)
        const dobParts = data.dob.split('-');
        const formattedDob = `${dobParts[2]}/${dobParts[1]}/${dobParts[0]}`;

        // Call API
        fetch(`http://127.0.0.1:8000/astro/calculate?dob=${formattedDob}&tob=${data.tob}&lat=${data.lat}&lon=${data.lon}&place=${data.place}`, {
            method: 'POST'
        })
            .then(res => res.json())
            .then(data => {
                setKundali(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch Kundali data');
                setLoading(false);
            });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="loader-vedic mb-4"></div>
                <p className="text-[#8B0000] font-medium">Calculating your Kundali...</p>
                <p className="text-sm text-[#8B7355]">कुण्डली की गणना हो रही है...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={() => router.push('/')} className="btn-primary">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="py-10 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        {formData?.name}&apos;s Kundali
                    </h1>
                    <p className="text-[#8B7355]">जन्म कुण्डली</p>
                </div>

                {/* Quick Navigation */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    <a href="/charts" className="btn-secondary text-sm py-2 px-4">📊 Charts</a>
                    <a href="/dasha" className="btn-secondary text-sm py-2 px-4">🌙 Dasha</a>
                    <a href="/ascendant" className="btn-secondary text-sm py-2 px-4">⭐ Ascendant</a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Details Card */}
                    <div className="card-vedic p-6">
                        <h2 className="section-title mb-6">Basic Details</h2>
                        <div className="space-y-3">
                            <DetailRow label="Date of Birth" value={kundali?.basic_details.date_of_birth} />
                            <DetailRow label="Time of Birth" value={kundali?.basic_details.time_of_birth} />
                            <DetailRow label="Place of Birth" value={kundali?.basic_details.place_of_birth} />
                            <DetailRow label="Latitude" value={kundali?.basic_details.latitude} />
                            <DetailRow label="Longitude" value={kundali?.basic_details.longitude} />
                            <DetailRow label="Timezone" value={kundali?.basic_details.timezone} />
                            <DetailRow label="Ayanamsha" value={kundali?.basic_details.ayanamsha} />
                            <DetailRow label="Sunrise" value={kundali?.basic_details.sunrise} />
                            <DetailRow label="Sunset" value={kundali?.basic_details.sunset} />
                        </div>
                    </div>

                    {/* Panchang Details Card */}
                    <div className="card-vedic p-6">
                        <h2 className="section-title mb-6">Panchang Details</h2>
                        <p className="text-sm text-[#8B7355] mb-4">पंचांग विवरण</p>
                        <div className="space-y-3">
                            <DetailRow label="Month" value={kundali?.panchang_details.month} />
                            <DetailRow label="Tithi" value={kundali?.panchang_details.tithi} />
                            <DetailRow label="Day" value={kundali?.panchang_details.day} />
                            <DetailRow label="Nakshatra" value={kundali?.panchang_details.nakshatra} />
                            <DetailRow label="Yog" value={kundali?.panchang_details.yog} />
                            <DetailRow label="Karan" value={kundali?.panchang_details.karan} />
                            <DetailRow label="Prahar" value={kundali?.panchang_details.prahar?.toString()} />
                        </div>
                    </div>

                    {/* Ghat Chakra Card */}
                    <div className="card-vedic p-6">
                        <h2 className="section-title mb-6">Ghat Chakra</h2>
                        <p className="text-sm text-[#8B7355] mb-4">घात चक्र</p>
                        <div className="grid grid-cols-2 gap-4">
                            <GhatItem label="Varna" value={kundali?.ghat_chakra.varna} />
                            <GhatItem label="Vashya" value={kundali?.ghat_chakra.vashya} />
                            <GhatItem label="Yoni" value={kundali?.ghat_chakra.yoni} />
                            <GhatItem label="Gan" value={kundali?.ghat_chakra.gan} />
                            <GhatItem label="Nadi" value={kundali?.ghat_chakra.nadi} />
                        </div>
                    </div>

                    {/* Astrological Details Card */}
                    <div className="card-vedic p-6">
                        <h2 className="section-title mb-6">Astrological Details</h2>
                        <p className="text-sm text-[#8B7355] mb-4">ज्योतिषीय विवरण</p>
                        <div className="space-y-3">
                            <DetailRow label="Sign" value={kundali?.astrological_details.sign} />
                            <DetailRow label="Sign Lord" value={kundali?.astrological_details.sign_lord} />
                            <DetailRow label="Nakshatra" value={kundali?.astrological_details.nakshatra} />
                            <DetailRow label="Nakshatra Lord" value={kundali?.astrological_details.nakshatra_lord} />
                            <DetailRow label="Charan (Pada)" value={kundali?.astrological_details.charan?.toString()} />
                            <DetailRow label="Tatva" value={kundali?.astrological_details.tatva} />
                            <DetailRow label="Name Alphabet" value={kundali?.astrological_details.name_alphabet} />
                            <DetailRow label="Paya" value={kundali?.astrological_details.paya} />
                            <DetailRow label="Ascendant" value={kundali?.astrological_details.ascendant} highlight />
                            <DetailRow label="Ascendant Lord" value={kundali?.astrological_details.ascendant_lord} highlight />
                        </div>
                    </div>
                </div>

                {/* Planetary Positions */}
                <div className="card-vedic p-6 mt-6">
                    <h2 className="section-title mb-6">Planetary Positions</h2>
                    <p className="text-sm text-[#8B7355] mb-4">ग्रह स्थिति</p>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-[#FFD700]">
                                    <th className="text-left py-3 px-4 text-[#8B0000]">Planet</th>
                                    <th className="text-left py-3 px-4 text-[#8B0000]">Sign</th>
                                    <th className="text-left py-3 px-4 text-[#8B0000]">Degree</th>
                                    <th className="text-left py-3 px-4 text-[#8B0000]">Nakshatra</th>
                                    <th className="text-left py-3 px-4 text-[#8B0000]">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {kundali?.planets?.map((planet, idx) => (
                                    <tr key={idx} className="border-b border-[#F5E6C8] hover:bg-[#FFF8E7]">
                                        <td className="py-3 px-4 font-medium">{planet.planet || '-'}</td>
                                        <td className="py-3 px-4">{planet.sign || '-'}</td>
                                        <td className="py-3 px-4">{typeof planet.degree_in_sign === 'number' ? planet.degree_in_sign.toFixed(2) : '-'}°</td>
                                        <td className="py-3 px-4">{planet.nakshatra || '-'}</td>
                                        <td className="py-3 px-4">
                                            {planet.retrograde ? (
                                                <span className="text-[#1A237E] font-medium">Retrograde ↺</span>
                                            ) : (
                                                <span className="text-green-600">Direct</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value, highlight = false }: { label: string; value?: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-[#F5E6C8]">
            <span className="text-[#5C4033]">{label}</span>
            <span className={`font-medium ${highlight ? 'text-[#8B0000] text-lg' : 'text-[#2D1810]'}`}>
                {value || '-'}
            </span>
        </div>
    );
}

function GhatItem({ label, value }: { label: string; value?: string }) {
    return (
        <div className="text-center p-3 bg-[#FFF8E7] rounded-lg border border-[#FFD700]">
            <p className="text-xs text-[#8B7355] mb-1">{label}</p>
            <p className="font-bold text-[#8B0000]">{value || '-'}</p>
        </div>
    );
}
