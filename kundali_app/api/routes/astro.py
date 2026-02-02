from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from kundali_app.db.session import get_db
from kundali_app.models import Profile, PlanetaryPosition, ChartType

router = APIRouter()

@router.get("/{profile_id}/planets")
def get_planets(profile_id: str, chart: str = "D1", db: Session = Depends(get_db)):
    """
    Get planetary positions for a specific chart (D1, D9, etc.)
    """
    positions = db.query(PlanetaryPosition).filter(
        PlanetaryPosition.profile_id == profile_id,
        PlanetaryPosition.chart_type == chart
    ).all()
    
    if not positions and chart == "D1":
        raise HTTPException(status_code=404, detail="No planetary data found. Profile might still be processing.")
        
    return positions

@router.get("/{profile_id}/dashas")
def get_dashas(profile_id: str, db: Session = Depends(get_db)):
    # Placeholder for Dasha Logic which would be computed on the fly or stored
    # For now, return static not implemented or compute on fly using AstrologyService
    return {"message": "Dasha calculation endpoint"}

@router.get("/{profile_id}/birth_details")
def get_birth_details(profile_id: str, db: Session = Depends(get_db)):
    """
    Get comprehensive Birth Particulars and Panchang details.
    """
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    # Instantiate Service (or DI)
    from kundali_app.services.astrology import AstrologyService
    service = AstrologyService()
    
    details = service.calculate_extended_birth_details(
        lat=profile.lat, lon=profile.lon,
        year=profile.dob.year, month=profile.dob.month, day=profile.dob.day,
        hour=profile.tob.hour, minute=profile.tob.minute, timezone=5.5 # Hardcoded for now, add to Profile model in future
    )
    # Inject Profile Specifics
    details['birth_particulars']['sex'] = profile.gender
    details['birth_particulars']['place'] = profile.location_name or "Unknown"
    
    # Family Inject (Overwrite empty dict from service)
    details['family_particulars'] = {
        "father": profile.father_name,
        "mother": profile.mother_name,
        "grandfather": profile.grandfather_name,
        "caste": profile.caste,
        "gotra": profile.gotra
    }
    
    return details

@router.get("/{profile_id}/planets_detailed")
def get_planets_detailed(profile_id: str, db: Session = Depends(get_db)):
    """
    Get comprehensive planetary positions with Sign Lord, Nakshatra, Nakshatra Lord, etc.
    This endpoint calculates fresh data rather than reading from DB.
    """
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    from kundali_app.services.astrology import AstrologyService
    service = AstrologyService()
    
    planets = service._calculate_planets_full(
        lat=profile.lat, lon=profile.lon,
        year=profile.dob.year, month=profile.dob.month, day=profile.dob.day,
        hour=profile.tob.hour, minute=profile.tob.minute, timezone=5.5
    )
    
    return {"planets": planets}

@router.get("/{profile_id}/kundali")
def get_kundali(profile_id: str, db: Session = Depends(get_db)):
    """
    Get complete Kundali data including:
    - Basic Details (DOB, Time, Place, Lat/Lon, Timezone, Ayanamsha, Sunrise/Sunset)
    - Panchang Details (Month, Tithi, Day, Nakshatra, Yog, Karan, Prahar)
    - Ghat Chakra (Varna, Vashya, Yoni, Gan, Nadi)
    - Astrological Details (Sign, Sign Lord, Nakshatra, Nakshatra Lord, Charan, Tatva, etc.)
    - Planetary Positions
    """
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    from kundali_app.services.astrology import AstrologyService
    service = AstrologyService()
    
    # Get all birth details
    details = service.calculate_extended_birth_details(
        lat=profile.lat, lon=profile.lon,
        year=profile.dob.year, month=profile.dob.month, day=profile.dob.day,
        hour=profile.tob.hour, minute=profile.tob.minute, timezone=5.5
    )
    
    # Get planets
    planets = service._calculate_planets_full(
        lat=profile.lat, lon=profile.lon,
        year=profile.dob.year, month=profile.dob.month, day=profile.dob.day,
        hour=profile.tob.hour, minute=profile.tob.minute, timezone=5.5
    )
    
    # Calculate Prahar (3-hour periods from sunrise)
    from datetime import datetime, timedelta
    birth_hour = profile.tob.hour + profile.tob.minute / 60.0
    # Assuming sunrise ~5:30 for now (should use actual sunrise)
    sunrise_hour = 5.5  # Approx
    prahar = int((birth_hour - sunrise_hour) / 3) + 1
    if prahar < 1: prahar = 8 + prahar
    
    # Calculate Day Lord (based on weekday)
    day_lords = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]
    day_lord = day_lords[profile.dob.weekday()]
    
    # Find Moon and Ascendant for astrological details
    moon_data = next((p for p in planets if p["planet"] == "Moon"), None)
    asc_data = next((p for p in planets if p["planet"] == "Ascendant"), None)
    
    # Tatva (Element) mapping
    tatva_map = {
        "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
        "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
        "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
        "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
    }
    
    # Yunja (odd/even pada)
    yunja = "Poorva" if moon_data and moon_data["nakshatra_pada"] <= 2 else "Uttara"
    
    return {
        "basic_details": {
            "date_of_birth": profile.dob.strftime("%d/%m/%Y"),
            "time_of_birth": profile.tob.strftime("%H:%M"),
            "place_of_birth": profile.location_name or "Unknown",
            "latitude": details["birth_particulars"]["lat"],
            "longitude": details["birth_particulars"]["lon"],
            "timezone": "+05:30",
            "ayanamsha": details["sun_moon_params"]["ayanamsha"],
            "sunrise": details["sun_moon_params"]["sunrise"],
            "sunset": details["sun_moon_params"]["sunset"]
        },
        "panchang_details": {
            "month": details["tamil_calendar"]["tamil_month"],
            "tithi": details["panchang"]["tithi"]["at_birth"],
            "day": day_lord,
            "nakshatra": details["panchang"]["nakshatra"]["at_birth"],
            "yog": details["panchang"]["yoga"]["at_birth"],
            "karan": details["panchang"]["karana"]["at_birth"],
            "prahar": prahar,
            "moon_sign": moon_data["sign"] if moon_data else "Unknown"
        },
        "ghat_chakra": {
            "varna": details["avakhada_chakra"]["varna"],
            "vashya": details["avakhada_chakra"]["vashya"],
            "yoni": details["avakhada_chakra"]["yoni"],
            "gan": details["avakhada_chakra"]["gana"],
            "nadi": details["avakhada_chakra"]["nadi"]
        },
        "astrological_details": {
            "sign": moon_data["sign"] if moon_data else "Unknown",
            "sign_lord": moon_data["sign_lord"] if moon_data else "Unknown",
            "nakshatra": moon_data["nakshatra"] if moon_data else "Unknown",
            "nakshatra_lord": moon_data["nakshatra_lord"] if moon_data else "Unknown",
            "charan": moon_data["nakshatra_pada"] if moon_data else 0,
            "yunja": yunja,
            "tatva": tatva_map.get(moon_data["sign"], "Unknown") if moon_data else "Unknown",
            "name_alphabet": details["avakhada_chakra"]["naamakshar"],
            "paya": details["avakhada_chakra"]["paya_nakshatra"],
            "ascendant": asc_data["sign"] if asc_data else "Unknown",
            "ascendant_lord": asc_data["sign_lord"] if asc_data else "Unknown"
        },
        "planets": planets,
        "dasha_balance": details["sun_moon_params"]["dasha_balance"]
    }

@router.post("/calculate")
def calculate_kundali_adhoc(
    dob: str,  # Format: DD/MM/YYYY
    tob: str,  # Format: HH:MM
    lat: float,
    lon: float,
    place: str = "Unknown",
    timezone: float = 5.5
):
    """
    Calculate Kundali without storing in database.
    Useful for quick calculations or testing.
    """
    from datetime import datetime
    from kundali_app.services.astrology import AstrologyService
    
    # Parse date and time
    dob_parts = dob.split("/")
    tob_parts = tob.split(":")
    
    day = int(dob_parts[0])
    month = int(dob_parts[1])
    year = int(dob_parts[2])
    hour = int(tob_parts[0])
    minute = int(tob_parts[1])
    
    service = AstrologyService()
    
    # Get birth details
    details = service.calculate_extended_birth_details(
        lat=lat, lon=lon,
        year=year, month=month, day=day,
        hour=hour, minute=minute, timezone=timezone
    )
    
    # Get planets
    planets = service._calculate_planets_full(
        lat=lat, lon=lon,
        year=year, month=month, day=day,
        hour=hour, minute=minute, timezone=timezone
    )
    
    # Day Lord
    birth_dt = datetime(year, month, day)
    day_lords = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]
    day_lord = day_lords[birth_dt.weekday()]
    
    # Prahar
    sunrise_hour = 5.5
    prahar = int((hour + minute/60.0 - sunrise_hour) / 3) + 1
    if prahar < 1: prahar = 8 + prahar
    
    # Moon and Ascendant
    moon_data = next((p for p in planets if p["planet"] == "Moon"), None)
    asc_data = next((p for p in planets if p["planet"] == "Ascendant"), None)
    
    tatva_map = {
        "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
        "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
        "Gemini": "Air", "Libra": "Air", "Aquarius": "Air",
        "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
    }
    yunja = "Poorva" if moon_data and moon_data["nakshatra_pada"] <= 2 else "Uttara"
    
    return {
        "basic_details": {
            "date_of_birth": dob,
            "time_of_birth": tob,
            "place_of_birth": place,
            "latitude": service.decimal_to_dms(lat),
            "longitude": service.decimal_to_dms(lon),
            "timezone": f"+{int(timezone):02d}:{int((timezone%1)*60):02d}",
            "ayanamsha": details["sun_moon_params"]["ayanamsha"],
            "sunrise": details["sun_moon_params"]["sunrise"],
            "sunset": details["sun_moon_params"]["sunset"]
        },
        "panchang_details": {
            "month": details["tamil_calendar"]["tamil_month"],
            "tithi": details["panchang"]["tithi"]["at_birth"],
            "day": day_lord,
            "nakshatra": details["panchang"]["nakshatra"]["at_birth"],
            "yog": details["panchang"]["yoga"]["at_birth"],
            "karan": details["panchang"]["karana"]["at_birth"],
            "prahar": prahar
        },
        "ghat_chakra": {
            "varna": details["avakhada_chakra"]["varna"],
            "vashya": details["avakhada_chakra"]["vashya"],
            "yoni": details["avakhada_chakra"]["yoni"],
            "gan": details["avakhada_chakra"]["gana"],
            "nadi": details["avakhada_chakra"]["nadi"]
        },
        "astrological_details": {
            "sign": moon_data["sign"] if moon_data else "Unknown",
            "sign_lord": moon_data["sign_lord"] if moon_data else "Unknown",
            "nakshatra": moon_data["nakshatra"] if moon_data else "Unknown",
            "nakshatra_lord": moon_data["nakshatra_lord"] if moon_data else "Unknown",
            "charan": moon_data["nakshatra_pada"] if moon_data else 0,
            "yunja": yunja,
            "tatva": tatva_map.get(moon_data["sign"], "Unknown") if moon_data else "Unknown",
            "name_alphabet": details["avakhada_chakra"]["naamakshar"],
            "paya": details["avakhada_chakra"]["paya_nakshatra"],
            "ascendant": asc_data["sign"] if asc_data else "Unknown",
            "ascendant_lord": asc_data["sign_lord"] if asc_data else "Unknown"
        },
        "planets": planets,
        "dasha_balance": details["sun_moon_params"]["dasha_balance"]
    }
