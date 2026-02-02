'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    tob: '',
    place: '',
    lat: '',
    lon: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Store form data in sessionStorage for use in other pages
    sessionStorage.setItem('kundaliData', JSON.stringify(formData));

    // Navigate to kundali page
    router.push('/kundali');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Popular places with coordinates
  const popularPlaces = [
    { name: 'Delhi', lat: '28.6139', lon: '77.2090' },
    { name: 'Mumbai', lat: '19.0760', lon: '72.8777' },
    { name: 'Bangalore', lat: '12.9716', lon: '77.5946' },
    { name: 'Kanpur', lat: '26.4499', lon: '80.3319' },
    { name: 'Lucknow', lat: '26.8467', lon: '80.9462' }
  ];

  const selectPlace = (place: typeof popularPlaces[0]) => {
    setFormData({
      ...formData,
      place: place.name,
      lat: place.lat,
      lon: place.lon
    });
  };

  return (
    <div className="py-12 px-6">
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto text-center mb-16">
        <div className="text-6xl mb-6 om-symbol">ॐ</div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
          जन्म कुण्डली
        </h1>
        <p className="text-xl text-[#5C4033] mb-2">
          Discover Your Cosmic Blueprint
        </p>
        <p className="text-[#8B7355] max-w-2xl mx-auto">
          Generate your personalized Vedic birth chart, explore planetary positions,
          understand your Vimshottari Dasha, and unlock the wisdom of ancient astrology.
        </p>
      </section>

      {/* Birth Details Form */}
      <section className="max-w-2xl mx-auto">
        <div className="card-vedic p-8">
          <h2 className="section-title mb-8">Enter Birth Details</h2>
          <p className="text-sm text-[#8B7355] mb-6">जन्म विवरण दर्ज करें</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#5C4033] mb-2">
                Full Name <span className="text-[#8B7355]">(पूरा नाम)</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="input-vedic"
              />
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C4033] mb-2">
                  Date of Birth <span className="text-[#8B7355]">(जन्म तिथि)</span>
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                  className="input-vedic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C4033] mb-2">
                  Time of Birth <span className="text-[#8B7355]">(जन्म समय)</span>
                </label>
                <input
                  type="time"
                  name="tob"
                  value={formData.tob}
                  onChange={handleChange}
                  required
                  className="input-vedic"
                />
              </div>
            </div>

            {/* Place of Birth */}
            <div>
              <label className="block text-sm font-medium text-[#5C4033] mb-2">
                Place of Birth <span className="text-[#8B7355]">(जन्म स्थान)</span>
              </label>
              <input
                type="text"
                name="place"
                value={formData.place}
                onChange={handleChange}
                required
                placeholder="Enter city name"
                className="input-vedic"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {popularPlaces.map((place) => (
                  <button
                    key={place.name}
                    type="button"
                    onClick={() => selectPlace(place)}
                    className="text-xs px-3 py-1 bg-[#FFF8E7] border border-[#FFD700] rounded-full text-[#8B0000] hover:bg-[#FFD700] transition-colors"
                  >
                    {place.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Lat/Lon Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#5C4033] mb-2">
                  Latitude <span className="text-[#8B7355]">(अक्षांश)</span>
                </label>
                <input
                  type="text"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 26.4499"
                  className="input-vedic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#5C4033] mb-2">
                  Longitude <span className="text-[#8B7355]">(देशांतर)</span>
                </label>
                <input
                  type="text"
                  name="lon"
                  value={formData.lon}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 80.3319"
                  className="input-vedic"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="loader-vedic w-6 h-6"></div>
                  <span>Generating Kundali...</span>
                </>
              ) : (
                <>
                  <span className="text-xl">🌟</span>
                  <span>Generate Kundali</span>
                  <span className="text-xl">🌟</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto mt-20">
        <h2 className="section-title text-center mx-auto block mb-12">
          What You&apos;ll Discover
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Birth Chart */}
          <div className="card-vedic p-6 text-center">
            <div className="text-4xl mb-4">♈</div>
            <h3 className="font-bold text-lg text-[#8B0000] mb-2">Birth Chart</h3>
            <p className="text-sm text-[#5C4033]">
              Lagna, Moon Chart, and Navamsha (D9) with planetary positions in North Indian style
            </p>
          </div>

          {/* Vimshottari Dasha */}
          <div className="card-vedic p-6 text-center">
            <div className="text-4xl mb-4">🌙</div>
            <h3 className="font-bold text-lg text-[#8B0000] mb-2">Vimshottari Dasha</h3>
            <p className="text-sm text-[#5C4033]">
              Complete 120-year dasha cycle with Mahadasha, Antardasha, Pratyantardasha & Sookshma
            </p>
          </div>

          {/* Ascendant Report */}
          <div className="card-vedic p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="font-bold text-lg text-[#8B0000] mb-2">Ascendant Report</h3>
            <p className="text-sm text-[#5C4033]">
              Detailed personality analysis, spiritual lessons, and life path guidance
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
