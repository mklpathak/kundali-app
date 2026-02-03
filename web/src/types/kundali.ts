// Types for Kundali API responses

export interface KundaliRequest {
    name: string;
    dob: string; // DD/MM/YYYY
    tob: string; // HH:MM
    lat: number;
    lon: number;
    place: string;
    timezone: number;
}

export interface PlanetPosition {
    name: string;
    sign: string;
    sign_hindi?: string;
    degree: number;
    degree_dms: string;
    nakshatra: string;
    nakshatra_lord: string;
    pada: number;
    sign_lord: string;
    is_retrograde: boolean;
    house?: number;
}

export interface PanchangDetails {
    tithi: string;
    tithi_end_time: string;
    nakshatra: string;
    nakshatra_end_time: string;
    yoga: string;
    karana: string;
    sunrise: string;
    sunset: string;
    day: string;
    var: string;
}

export interface BirthDetails {
    name?: string;
    dob: string;
    tob: string;
    place: string;
    lat: number;
    lon: number;
    timezone: number;
    ayanamsha: number;
}

export interface ChartHouse {
    house_number: number;
    sign: string;
    sign_hindi: string;
    planets: string[];
    is_ascendant?: boolean;
}

export interface Chart {
    chart_type: string;
    chart_name: string;
    ascendant_sign: string;
    houses: ChartHouse[];
}

export interface DashaPeriod {
    lord: string;
    start_date: string;
    end_date: string;
    years: number;
    is_current?: boolean;
    antardashas?: DashaPeriod[];
}

export interface CurrentDasha {
    mahadasha: {
        lord: string;
        start: string;
        end: string;
    };
    antardasha: {
        lord: string;
        start: string;
        end: string;
    };
    pratyantardasha: {
        lord: string;
        start: string;
        end: string;
    };
    effects?: string;
}

export interface AvakhadaChakra {
    varna: string;
    vashya: string;
    yoni: string;
    gana: string;
    nadi: string;
    tatva: string;
    name_letter: string;
}

export interface AscendantReport {
    sign: string;
    sign_hindi: string;
    lord: string;
    symbol: string;
    lucky_gem: string;
    lucky_color: string;
    lucky_day: string;
    fast_day: string;
    description: string;
    positive_traits: string[];
    negative_traits: string[];
    spiritual_lesson: string;
}

export interface KundaliResponse {
    basic_details: BirthDetails;
    panchang: PanchangDetails;
    avakhada_chakra: AvakhadaChakra;
    planets: PlanetPosition[];
    charts: {
        lagna: Chart;
        moon: Chart;
        navamsha: Chart;
    };
    vimshottari_dasha: DashaPeriod[];
    current_dasha: CurrentDasha;
    ascendant_report: AscendantReport;
}
