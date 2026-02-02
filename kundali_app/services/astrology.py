import ephem
import math
from kundali_app.domain.schemas import KundaliRequest

class AstrologyService:
    @staticmethod
    def decimal_to_dms(deg):
        """Convert decimal degrees to Degrees:Minutes:Seconds string."""
        d = int(deg)
        m = int((deg - d) * 60)
        s = int(((deg - d) * 60 - m) * 60)
        return f"{d:02d}° {m:02d}' {s:02d}\""

    @staticmethod
    def get_zodiac_sign(lon):
        """Return Zodiac sign index (0=Aries) and name from longitude."""
        signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        lon = lon % 360
        index = int(lon / 30)
        return index, signs[index]

    def calculate_chart_data(self, request: KundaliRequest):
        """
        Calculate planetary positions and Ascendant for a given birth time/place.
        Returns a dictionary of data for the PDF renderer.
        """
        
        # 1. Setup Observer (Ephem)
        local_time_str = f"{request.year}/{request.month}/{request.day} {request.hour}:{request.minute}:00"
        obs = ephem.Observer()
        obs.lat = str(request.lat)
        obs.lon = str(request.lon)
        
        # Adjust for Timezone manually
        # Local Time - Timezone = UTC
        dt_local = ephem.Date(local_time_str)
        dt_utc = ephem.Date(dt_local - (request.timezone / 24.0)) 
        
        obs.date = dt_utc

        # 2. Ayanamsa (Sidereal Correction)
        # Lahiri Approx: (Year - 285) * 50.2388475 / 3600
        ayanamsa = (dt_utc.tuple()[0] - 285) * 50.2388475 / 3600.0
        
        # 3. Calculate Planets
        planets_map = {
            "Sun": ephem.Sun(),
            "Moon": ephem.Moon(),
            "Mars": ephem.Mars(),
            "Mercury": ephem.Mercury(),
            "Jupiter": ephem.Jupiter(),
            "Venus": ephem.Venus(),
            "Saturn": ephem.Saturn(),
            "Rahu": ephem.Uranus(), # Placeholder for MVP
        }
        
        chart_data = []
        
        for p_name, p_obj in planets_map.items():
            p_obj.compute(obs)
            ecl = ephem.Ecliptic(p_obj)
            tropical_lon = math.degrees(ecl.lon)
            sidereal_lon = (tropical_lon - ayanamsa) % 360
            
            sign_idx, sign_name = self.get_zodiac_sign(sidereal_lon)
            degree_in_sign = sidereal_lon % 30
            
            chart_data.append({
                "planet": p_name,
                "lon": sidereal_lon,
                "sign": sign_name,
                "sign_id": sign_idx + 1,
                "degree": self.decimal_to_dms(degree_in_sign),
                "retro": False 
            })

        # 4. Calculate Ascendant (Lagna)
        sun = ephem.Sun()
        sun.compute(obs)
        sun_ecl = ephem.Ecliptic(sun)
        curr_sun_lon = math.degrees(sun_ecl.lon)
        
        hours_from_6 = (request.hour + request.minute/60.0) - 6.0
        lagna_lon_trop = (curr_sun_lon + (hours_from_6 * 15)) % 360
        lagna_lon_sid = (lagna_lon_trop - ayanamsa) % 360
        
        l_idx, l_name = self.get_zodiac_sign(lagna_lon_sid)
        l_deg = lagna_lon_sid % 30
        
        ascendant = {
            "planet": "Ascendant",
            "lon": lagna_lon_sid,
            "sign": l_name,
            "sign_id": l_idx + 1,
            "degree": self.decimal_to_dms(l_deg),
            "is_ascendant": True
        }
        
        chart_data.insert(0, ascendant)
        
        # 5. House Calculation
        asc_sign_idx = l_idx
        for planet in chart_data:
            p_sign_idx = planet["sign_id"] - 1
            
            # Nakshatra Logic
            abs_lon = planet["lon"]
            nak_idx = int(abs_lon / (360/27))
            degree_in_nak = abs_lon % (360/27)
            pada = int(degree_in_nak / (360/27/4)) + 1
            
            nakshatras_list = [
                "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
                "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
                "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
                "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
                "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
            ]
            
            planet["nakshatra"] = nakshatras_list[nak_idx]
            planet["pada"] = str(pada)
            
            # House Calculation (Whole Sign)
            house = ((p_sign_idx - asc_sign_idx) % 12) + 1
            planet["house"] = house

        # 6. Divisional Charts + Avakhada
        navamsha_chart = self.calculate_divisional_chart(chart_data, divisor=9)
        moon_chart = self.calculate_moon_chart(chart_data)
        avakhada = self.calculate_avakhada(chart_data)
        dashas = self.calculate_vimshottari_dashas(chart_data, request.year, request.month, request.day)
        
        return {
            "birth_details": {
                "name": request.name,
                "dob": f"{request.day}-{request.month}-{request.year}",
                "time": f"{request.hour:02d}:{request.minute:02d}",
                "place": f"{request.lat}, {request.lon}"
            },
            "planets": chart_data,
            "navamsha": navamsha_chart,
            "moon_chart": moon_chart,
            "avakhada": avakhada,
            "ayanamsa": f"{ayanamsa:.2f}",
            "dashas": dashas
        }

    def calculate_avakhada(self, planets):
        moon = next((p for p in planets if p["planet"] == "Moon"), None)
        if not moon: return {}
        
        nak = moon["nakshatra"]
        pada = moon["pada"]
        sign = moon["sign"]
        
        varna_map = {"Cancer":"Brahmin", "Scorpio":"Brahmin", "Pisces":"Brahmin",
                     "Aries":"Kshatriya", "Leo":"Kshatriya", "Sagittarius":"Kshatriya",
                     "Gemini":"Shudra", "Libra":"Shudra", "Aquarius":"Shudra",
                     "Taurus":"Vaishya", "Virgo":"Vaishya", "Capricorn":"Vaishya"}
                     
        deva_gana = ["Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta", "Swati", "Anuradha", "Shravana", "Revati"]
        manushya_gana = ["Bharani", "Rohini", "Ardra", "Purva Phalguni", "Uttara Phalguni", "Purva Ashadha", "Uttara Ashadha", "Purva Bhadrapada", "Uttara Bhadrapada"]
        
        gana = "Rakshasa"
        if nak in deva_gana: gana = "Deva"
        elif nak in manushya_gana: gana = "Manushya"
        
        yoni = "Ashwa" if nak == "Ashwini" else "Gaja" # simplified
        
        return {
            "Varna": varna_map.get(sign, "Unknown"),
            "Vashya": "Manav",
            "Tara": "Janma", 
            "Yoni": yoni,
            "Gana": gana,
            "Nadi": "Adi",
            "Sign": sign,
            "Nakshatra": f"{nak} ({pada} Pada)"
        }

    def calculate_moon_chart(self, original_planets):
        moon_p = next((p for p in original_planets if p["planet"] == "Moon"), None)
        if not moon_p: return original_planets
        
        moon_sign_idx = moon_p["sign_id"] - 1
        new_planets = []
        import copy
        for p in original_planets:
            p_new = copy.deepcopy(p)
            p_sign_idx = p["sign_id"] - 1
            new_house = ((p_sign_idx - moon_sign_idx) % 12) + 1
            p_new["house"] = new_house
            new_planets.append(p_new)
        return new_planets

    def calculate_divisional_chart(self, original_planets, divisor=9):
        d_planets = []
        movable = [0, 3, 6, 9]
        fixed = [1, 4, 7, 10]
        dual = [2, 5, 8, 11]
        
        for p in original_planets:
            lon_deg = p["lon"]
            sign_idx = p["sign_id"] - 1
            deg_in_sign = lon_deg % 30
            pada = int(deg_in_sign / (30/9))
            
            start_sign_idx = 0
            if sign_idx in movable: start_sign_idx = sign_idx
            elif sign_idx in fixed: start_sign_idx = (sign_idx + 8) % 12
            elif sign_idx in dual: start_sign_idx = (sign_idx + 4) % 12
            
            final_d9_sign_idx = (start_sign_idx + pada) % 12
            
            signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
            
            d_planets.append({
                "planet": p["planet"],
                "sign": signs[final_d9_sign_idx],
                "sign_id": final_d9_sign_idx + 1
            })

        asc_p = next((x for x in d_planets if x["planet"] == "Ascendant"), None)
        if asc_p:
            asc_idx = asc_p["sign_id"] - 1
            for p in d_planets:
                p_idx = p["sign_id"] - 1
                p["house"] = ((p_idx - asc_idx) % 12) + 1
                
        return d_planets

    def calculate_vimshottari_dashas(self, chart_data, birth_year, birth_month, birth_day):
        moon = next((p for p in chart_data if p["planet"] == "Moon"), None)
        if not moon: return []
        
        moon_lon = moon["lon"]
        nakshatra_idx = int(moon_lon / (360/27))
        deg_in_nak = moon_lon % (360/27)
        fraction_remaining = 1.0 - (deg_in_nak / (360/27))
        
        dasha_lords = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
        dasha_years = [7, 20, 6, 10, 7, 18, 16, 19, 17]
        
        start_lord_idx = nakshatra_idx % 9
        
        balance_years = dasha_years[start_lord_idx] * fraction_remaining
        start_year = birth_year + (birth_month/12.0) + (birth_day/365.0)
        end_year = start_year + balance_years
        
        dashas = [{
            "planet": dasha_lords[start_lord_idx],
            "start": f"{int(start_year)}",
            "end": f"{int(end_year)}",
            "duration": f"{balance_years:.1f}y"
        }]
        
        current_year = end_year
        for i in range(1, 10):
            idx = (start_lord_idx + i) % 9
            dur = dasha_years[idx]
            end_val = current_year + dur
            dashas.append({
                "planet": dasha_lords[idx],
                "start": f"{int(current_year)}",
                "end": f"{int(end_val)}",
                "duration": f"{dur}y"
            })
            current_year = end_val
            if current_year > birth_year + 100: break
            
        return dashas
