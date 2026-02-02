import ephem
import math
import json
import os
from datetime import datetime, timedelta, date, time
from kundali_app.models import PlanetName, ChartType

# Load Lookup Data
_LOOKUP_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'astro_lookups.json')
with open(_LOOKUP_PATH, 'r') as f:
    ASTRO_LOOKUPS = json.load(f)

class AstrologyService:
    
    @staticmethod
    def _get_zodiac_sign(lon):
        signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
        lon = lon % 360
        index = int(lon / 30)
        return index, signs[index]

    @staticmethod
    def decimal_to_dms(deg):
        d = int(deg)
        m = int((deg - d) * 60)
        s = int(((deg - d) * 60 - m) * 60)
        return f"{d:02d}:{m:02d}:{s:02d}"

    @staticmethod
    def _time_diff_to_ghatis(dt_birth, dt_sunrise):
        """Calculate Ishtkaal: Time from sunrise to birth in Ghatis (1 hr = 2.5 ghatis)"""
        if dt_birth < dt_sunrise:
            pass
        
        diff = dt_birth - dt_sunrise
        seconds = diff.total_seconds()
        hours = seconds / 3600.0
        ghatis = hours * 2.5
        
        g = int(ghatis)
        p = int((ghatis - g) * 60)
        v = int(((ghatis - g) * 60 - p) * 60)
        return f"{g:02d}:{p:02d}:{v:02d}"

    def calculate_planets(self, lat, lon, year, month, day, hour, minute, timezone=5.5):
        return self._calculate_planets_full(lat, lon, year, month, day, hour, minute, timezone)

    def _calculate_planets_full(self, lat, lon, year, month, day, hour, minute, timezone):
        obs = ephem.Observer()
        obs.lat = str(lat)
        obs.lon = str(lon)
        local_dt = datetime(year, month, day, hour, minute)
        utc_dt = local_dt - timedelta(hours=timezone)
        obs.date = utc_dt
        
        # Ayanamsa
        t = (ephem.julian_date(obs.date) - 2451545.0) / 36525
        ayanamsa = 23.85 + 1.4 * t
        
        # Rahu/Ketu calculation (Mean Node)
        mean_node_lon = (125.04452 - 1934.136261 * t) % 360
        rahu_sid = (mean_node_lon - ayanamsa) % 360
        ketu_sid = (rahu_sid + 180) % 360
        
        bodies = {
            "Sun": ephem.Sun(), "Moon": ephem.Moon(), "Mars": ephem.Mars(),
            "Mercury": ephem.Mercury(), "Jupiter": ephem.Jupiter(), 
            "Venus": ephem.Venus(), "Saturn": ephem.Saturn()
        }
        
        results = []
        sun_lon = 0
        
        for name, body in bodies.items():
            body.compute(obs)
            ecl = ephem.Ecliptic(body)
            trop_lon = math.degrees(ecl.lon)
            sid_lon = (trop_lon - ayanamsa) % 360
            
            # Retrograde detection
            is_retro = False
            if name not in ["Sun", "Moon"]:
                obs_next = ephem.Observer()
                obs_next.lat, obs_next.lon = str(lat), str(lon)
                obs_next.date = ephem.Date(obs.date + 1)
                body.compute(obs_next)
                ecl_next = ephem.Ecliptic(body)
                lon_next = (math.degrees(ecl_next.lon) - ayanamsa) % 360
                diff = lon_next - sid_lon
                if diff > 180: diff -= 360
                if diff < -180: diff += 360
                is_retro = diff < 0
            
            results.append(self._build_planet_data(name, sid_lon, is_retro))
            if name == "Sun": sun_lon = sid_lon
        
        # Add Rahu and Ketu
        results.append(self._build_planet_data("Rahu", rahu_sid, False))
        results.append(self._build_planet_data("Ketu", ketu_sid, False))
        
        # Ascendant
        hours_from_6 = (hour + minute/60.0) - 6.0
        lagna_sid = (sun_lon + (hours_from_6 * 15)) % 360
        results.insert(0, self._build_planet_data("Ascendant", lagna_sid, False))
        
        # Calculate Houses (Whole Sign)
        asc_sign = int(lagna_sid / 30) + 1
        for p in results:
            if p["planet"] == "Ascendant":
                p["house"] = 1
            else:
                p["house"] = ((p["sign_id"] - asc_sign) % 12) + 1
            
        return results
    
    def _build_planet_data(self, name, sid_lon, is_retro):
        """Build comprehensive planet data object using JSON lookups."""
        sign_idx = int(sid_lon / 30)
        nak_idx = int(sid_lon / (360/27))
        pada = int((sid_lon % (360/27)) / (360/108)) + 1
        degree_in_sign = sid_lon % 30
        
        deg_d = int(degree_in_sign)
        deg_m = int((degree_in_sign - deg_d) * 60)
        deg_s = int(((degree_in_sign - deg_d) * 60 - deg_m) * 60)
        degree_str = f"{deg_d:02d}:{deg_m:02d}:{deg_s:02d}"
        
        rashi = ASTRO_LOOKUPS["rashis"][sign_idx]
        nak = ASTRO_LOOKUPS["nakshatras"][nak_idx]
        
        return {
            "planet": name,
            "is_retrograde": is_retro,
            "sign": rashi["name"],
            "sign_id": sign_idx + 1,
            "degrees": degree_str,
            "degree_decimal": round(degree_in_sign, 4),
            "absolute_degree": round(sid_lon, 4),
            "sign_lord": rashi["lord"],
            "nakshatra": nak["name"],
            "nakshatra_id": nak_idx + 1,
            "nakshatra_pada": pada,
            "nakshatra_lord": nak["lord"],
            "house": 0
        }

    def _find_event_end_time(self, obs, event_func, current_val, step_min=5, max_steps=400):
        start_date = ephem.Date(obs.date)
        for i in range(1, max_steps):
            obs.date = ephem.Date(start_date + (i * step_min / 1440.0))
            new_val = event_func(obs)
            if new_val != current_val:
                end_dt = obs.date.datetime() + timedelta(hours=5.5)
                return end_dt.strftime("%H:%M:%S")
        return "Unknown"

    def _get_tithi_index(self, obs):
        sun = ephem.Sun()
        moon = ephem.Moon()
        sun.compute(obs)
        moon.compute(obs)
        
        t = (ephem.julian_date(obs.date) - 2451545.0) / 36525
        ayanamsa = 23.85 + 1.4 * t
        
        sun_ecl = ephem.Ecliptic(sun)
        moon_ecl = ephem.Ecliptic(moon)
        s = (math.degrees(sun_ecl.lon) - ayanamsa) % 360
        m = (math.degrees(moon_ecl.lon) - ayanamsa) % 360
        diff = (m - s) % 360
        return int(diff / 12) + 1

    def _get_nak_index(self, obs):
        moon = ephem.Moon()
        moon.compute(obs)
        t = (ephem.julian_date(obs.date) - 2451545.0) / 36525
        ayanamsa = 23.85 + 1.4 * t
        
        moon_ecl = ephem.Ecliptic(moon)
        m = (math.degrees(moon_ecl.lon) - ayanamsa) % 360
        return int(m / (360/27))

    def calculate_extended_birth_details(self, lat, lon, year, month, day, hour, minute, timezone=5.5):
        obs = ephem.Observer()
        obs.lat, obs.lon = str(lat), str(lon)
        local_dt = datetime(year, month, day, hour, minute)
        utc_dt = local_dt - timedelta(hours=timezone)
        obs.date = utc_dt
        
        t = (ephem.julian_date(obs.date) - 2451545.0) / 36525
        ayanamsa = 23.85 + 1.4 * t
        
        s_body = ephem.Sun(); s_body.compute(obs)
        sun_lon = (math.degrees(ephem.Ecliptic(s_body).lon) - ayanamsa) % 360
        
        # Sunrise/Sunset
        sun = ephem.Sun()
        obs_mid = ephem.Observer()
        obs_mid.lat, obs_mid.lon = str(lat), str(lon)
        obs_mid.date = datetime(year, month, day) - timedelta(hours=timezone)
        try:
            sunrise_utc = obs_mid.next_rising(sun)
            sunset_utc = obs_mid.next_setting(sun)
            sunrise_dt = ephem.Date(sunrise_utc + (timezone/24.0)).datetime()
            sunset_dt = ephem.Date(sunset_utc + (timezone/24.0)).datetime()
        except:
            sunrise_dt = local_dt; sunset_dt = local_dt

        def get_yoga_idx(obs):
            s = ephem.Sun(); m = ephem.Moon(); s.compute(obs); m.compute(obs)
            t = (ephem.julian_date(obs.date) - 2451545.0) / 36525
            a = 23.85 + 1.4 * t
            sl = (math.degrees(ephem.Ecliptic(s).lon) - a) % 360
            ml = (math.degrees(ephem.Ecliptic(m).lon) - a) % 360
            return int((sl + ml) / 13.333333) + 1
            
        def get_karana_idx(obs):
            s = ephem.Sun(); m = ephem.Moon(); s.compute(obs); m.compute(obs)
            t = (ephem.julian_date(obs.date) - 2451545.0) / 36525
            a = 23.85 + 1.4 * t
            sl = (math.degrees(ephem.Ecliptic(s).lon) - a) % 360
            ml = (math.degrees(ephem.Ecliptic(m).lon) - a) % 360
            return int(((ml - sl) % 360) / 6) + 1

        # Panchang at Sunrise
        obs_sunrise = ephem.Observer()
        obs_sunrise.lat, obs_sunrise.lon = str(lat), str(lon)
        obs_sunrise.date = sunrise_utc
        
        tithi_at_sunrise_idx = self._get_tithi_index(obs_sunrise)
        nak_at_sunrise_idx = self._get_nak_index(obs_sunrise)
        yoga_at_sunrise_idx = get_yoga_idx(obs_sunrise)
        karana_at_sunrise_idx = get_karana_idx(obs_sunrise)
        
        # Next Sunrise
        try:
            next_sunrise_utc = obs_mid.next_rising(sun, start=sunrise_utc + 0.5)
            next_sunrise_dt = ephem.Date(next_sunrise_utc + (timezone/24.0)).datetime()
            next_sunrise_str = next_sunrise_dt.strftime("%H:%M:%S")
        except:
            next_sunrise_str = "Calc Error"

        # End Times
        obs_copy = ephem.Observer(); obs_copy.lat, obs_copy.lon = str(lat), str(lon); obs_copy.date = utc_dt
        curr_tithi = self._get_tithi_index(obs_copy)
        tithi_end_time = self._find_event_end_time(obs_copy, self._get_tithi_index, curr_tithi)
        
        obs_copy.date = utc_dt
        curr_nak = self._get_nak_index(obs_copy)
        nak_end_time = self._find_event_end_time(obs_copy, self._get_nak_index, curr_nak)
        
        obs_copy.date = utc_dt
        curr_yoga = get_yoga_idx(obs_copy)
        yoga_end_time = self._find_event_end_time(obs_copy, get_yoga_idx, curr_yoga)
        
        obs_copy.date = utc_dt
        curr_karana = get_karana_idx(obs_copy)
        karana_end_time = self._find_event_end_time(obs_copy, get_karana_idx, curr_karana)
        
        # Moon Nak Entry
        def find_nak_entry_time(obs, current_nak_idx, step_min=5, max_steps=400):
            start_date = ephem.Date(obs.date)
            for i in range(1, max_steps):
                obs.date = ephem.Date(start_date - (i * step_min / 1440.0))
                new_val = self._get_nak_index(obs)
                if new_val != current_nak_idx:
                    entry_dt = ephem.Date(obs.date + (step_min / 1440.0)).datetime() + timedelta(hours=timezone)
                    return entry_dt.strftime("%d %b %Y %H:%M:%S")
            return "Unknown"
        
        obs_copy.date = utc_dt
        moon_nak_entry_str = find_nak_entry_time(obs_copy, curr_nak)
        
        # Avakhada
        moon = ephem.Moon(); moon.compute(obs)
        moon_ecl = ephem.Ecliptic(moon)
        moon_lon = (math.degrees(moon_ecl.lon) - ayanamsa) % 360
        nak_idx = int(moon_lon / 13.333333)
        pada = int((moon_lon % 13.333333) / 3.333333) + 1
        sign_idx = int(moon_lon / 30) + 1
        
        avakhada = self._calculate_avakhada_full(nak_idx, sign_idx, pada)
        
        # Bhayat / Bhabhog & Dasha
        nak_len = 13.3333333
        moon_deg_in_nak = moon_lon % nak_len
        daily_motion = 13.176
        
        bhayat_ghatis = (moon_deg_in_nak / daily_motion) * 60
        bhabhog_ghatis = (nak_len / daily_motion) * 60
        
        bhayat_str = f"{int(bhayat_ghatis)}:{int((bhayat_ghatis%1)*60):02d} ghatis"
        bhabhog_str = f"{int(bhabhog_ghatis)}:{int((bhabhog_ghatis%1)*60):02d} ghatis"

        lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
        years = [7, 20, 6, 10, 7, 18, 16, 19, 17]
        lord = lords[nak_idx % 9]
        total_dur = years[nak_idx % 9]
        balance_years = (1 - (moon_deg_in_nak / nak_len)) * total_dur
        y = int(balance_years)
        m = int((balance_years - y) * 12)
        d = int(((balance_years - y) * 12 - m) * 30)
        dasha_balance = f"{lord} {y}y {m}m {d}d"
        
        # Time Corrections
        standard_meridian = 82.5
        diff_deg = lon - standard_meridian
        lmt_corr_min = diff_deg * 4
        
        # Maps
        tithi_list = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", 
            "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", 
            "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya"]
        tithi_name = tithi_list[(curr_tithi - 1) % 30]
        paksha = "Shukla" if curr_tithi <= 15 else "Krishna"
        
        nak_list = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
            "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
            "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
            "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
            "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"]
        nak_name = nak_list[nak_idx]
        
        yogas = ["Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Sobhana", "Atiganda", "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshan", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"]
        yoga_name = yogas[(curr_yoga - 1) % 27]
        
        karanas = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna"]
        karana_name = karanas[(curr_karana - 1) % 7] if curr_karana < 57 else karanas[7 + ((curr_karana-57)%4)]
        
        # Tamil
        tamil_months = ["Chithirai", "Vaikasi", "Aani", "Aadi", "Avani", "Puratasi", "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni"]
        tamil_month_real = tamil_months[int(sun_lon / 30) % 12]

        gmt_at_birth = utc_dt.strftime("%H:%M:%S")
        try:
            ishtkaal_str = self._time_diff_to_ghatis(local_dt, sunrise_dt)
        except:
            ishtkaal_str = "00:00:00"

        # Lagna
        hours_from_6 = (hour + minute/60.0) - 6.0
        lagna_sid = (sun_lon + (hours_from_6 * 15)) % 360
        lagna_sign_idx, lagna_sign_name = self._get_zodiac_sign(lagna_sid)
        lagna_deg = lagna_sid % 30
        lagna_str = f"{lagna_sign_name} {int(lagna_deg)}° {int((lagna_deg % 1)*60)}'"

        return {
            "birth_particulars": {
                "sex": "Male",
                "dob": local_dt.strftime("%d %B %Y"),
                "day_of_birth": local_dt.strftime("%A"),
                "tob": local_dt.strftime("%H:%M:%S"),
                "place": "User Location",
                "country": "India",
                "lat": self.decimal_to_dms(lat),
                "lon": self.decimal_to_dms(lon),
                "timezone": f"{timezone}",
                "war_daylight_corr": "00:00:00",
                "gmt_at_birth": gmt_at_birth,
                "lmt_correction": f"{lmt_corr_min:.1f} min",
                "local_mean_time": f"{(local_dt + timedelta(minutes=lmt_corr_min)).strftime('%H:%M:%S')}",
                "sidereal_time": str(obs.sidereal_time()),
                "ishtkaal": ishtkaal_str,
                "sunsign_western": self._get_western_sunsign(local_dt),
                "lagna": lagna_str
            },
            "family_particulars": { "grandfather": "", "father": "", "mother": "", "caste": "", "gotra": "" },
            "avakhada_chakra": avakhada,
            "tamil_calendar": {
                "tamil_year": ASTRO_LOOKUPS["samvatsaras"][(year - 1987) % 60],
                "tamil_month": tamil_month_real,
                "tamil_weekday": ["Thingal", "Chevvaai", "Pudhan", "Viyaazhan", "Velli", "Sani", "Nyaairu"][local_dt.weekday()], 
                "tamil_date": str(day)
            },
            "hindu_calendar": {
                "vikram_samvat": year + 57,
                "shaka_samvat": year - 78,
                "paksha": paksha,
                "tithi_birth": tithi_name,
                "tithi_end_time": tithi_end_time,
                "nakshatra_birth": nak_name,
                "nakshatra_end_time": nak_end_time,
                "yoga_end_time": yoga_end_time,
                "karana_end_time": karana_end_time
            },
            "panchang": {
                "tithi": { "at_sunrise": tithi_list[(tithi_at_sunrise_idx - 1) % 30], "ending_time": tithi_end_time, "at_birth": tithi_name },
                "nakshatra": { "at_sunrise": nak_list[nak_at_sunrise_idx], "ending_time": nak_end_time, "at_birth": nak_name },
                "yoga": { "at_sunrise": yogas[(yoga_at_sunrise_idx - 1) % 27], "ending_time": yoga_end_time, "at_birth": yoga_name },
                "karana": { "at_sunrise": karanas[(karana_at_sunrise_idx - 1) % 7], "ending_time": karana_end_time, "at_birth": karana_name }
            },
            "sun_moon_params": {
                "sunrise": sunrise_dt.strftime("%H:%M:%S"),
                "sunset": sunset_dt.strftime("%H:%M:%S"),
                "next_day_sunrise": next_sunrise_str,
                "moon_nak_entry": moon_nak_entry_str,
                "moon_nak_exit": nak_end_time,
                "bhayat": bhayat_str,
                "bhabhog": bhabhog_str,
                "dasha_balance": dasha_balance,
                "ayanamsha": f"{ayanamsa:.2f} Lahiri"
            }
        }

    def _calculate_avakhada_full(self, nak_idx, sign_idx, pada):
        nak_data = ASTRO_LOOKUPS["nakshatras"][nak_idx]
        rashi_data = ASTRO_LOOKUPS["rashis"][sign_idx - 1]
        
        naamakshar = nak_data["padas"][pada - 1] if pada <= 4 else "?"
        
        paya_map = ASTRO_LOOKUPS.get("paya", {})
        if nak_idx in paya_map.get("gold", []):
            paya = "Gold"
        elif nak_idx in paya_map.get("silver", []):
            paya = "Silver"
        elif nak_idx in paya_map.get("copper", []):
            paya = "Copper"
        else:
            paya = "Iron"
        
        hansak = rashi_data.get("element", "Fire").capitalize()
        
        return {
            "varna": rashi_data["varna"],
            "vashya": rashi_data["vashya"],
            "rashish": rashi_data["lord"],
            "yoni": nak_data["yoni"],
            "gana": nak_data["gana"],
            "nadi": nak_data["nadi"],
            "hansak": hansak,
            "naamakshar": naamakshar,
            "paya_nakshatra": paya,
            "nakshatra": f"{nak_data['name']} - {pada}"
        }

    def _get_western_sunsign(self, dt):
        md = dt.month * 100 + dt.day
        if 321 <= md <= 419: return "Aries"
        elif 420 <= md <= 520: return "Taurus"
        elif 521 <= md <= 621: return "Gemini"
        elif 622 <= md <= 722: return "Cancer"
        elif 723 <= md <= 822: return "Leo"
        elif 823 <= md <= 922: return "Virgo"
        elif 923 <= md <= 1023: return "Libra"
        elif 1024 <= md <= 1121: return "Scorpio"
        elif 1122 <= md <= 1221: return "Sagittarius"
        elif 1222 <= md <= 1231 or 101 <= md <= 119: return "Capricorn"
        elif 120 <= md <= 218: return "Aquarius"
        elif 219 <= md <= 320: return "Pisces"
        return "Unknown"
