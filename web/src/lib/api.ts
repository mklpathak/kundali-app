import { KundaliRequest } from '@/types/kundali';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Build form data for POST requests (FastAPI expects query params in body for POST)
function buildFormData(data: KundaliRequest): URLSearchParams {
    return new URLSearchParams({
        dob: data.dob,
        tob: data.tob,
        lat: data.lat.toString(),
        lon: data.lon.toString(),
        place: data.place,
        timezone: data.timezone.toString(),
    });
}

export async function calculateKundali(data: KundaliRequest) {
    // Backend expects POST with query params
    const params = buildFormData(data);

    const response = await fetch(`${API_BASE}/astro/calculate?${params}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to calculate Kundali: ${response.status}`);
    }
    return response.json();
}

export async function getCharts(data: KundaliRequest) {
    const params = buildFormData(data);

    const response = await fetch(`${API_BASE}/astro/calculate/charts?${params}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to get charts: ${response.status}`);
    }
    return response.json();
}

export async function getDasha(data: KundaliRequest) {
    const params = buildFormData(data);

    const response = await fetch(`${API_BASE}/astro/calculate/dasha?${params}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to get Dasha: ${response.status}`);
    }
    return response.json();
}

export async function getCurrentDasha(data: KundaliRequest) {
    const params = buildFormData(data);

    const response = await fetch(`${API_BASE}/astro/calculate/dasha/current?${params}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to get current Dasha: ${response.status}`);
    }
    return response.json();
}

export async function getAscendantReport(data: KundaliRequest) {
    const params = buildFormData(data);

    const response = await fetch(`${API_BASE}/astro/calculate/ascendant-report?${params}`, {
        method: 'POST',
    });

    if (!response.ok) {
        throw new Error(`Failed to get ascendant report: ${response.status}`);
    }
    return response.json();
}

export async function downloadPdf(data: Record<string, unknown>) {
    const response = await fetch(`${API_BASE}/astro/download-pdf`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to generate PDF');
    }

    return response.blob();
}
