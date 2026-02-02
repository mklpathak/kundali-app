from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from kundali_app.db.session import get_db
from kundali_app.models import Profile, PlanetaryPosition
from kundali_app.services.astrology import AstrologyService
from pydantic import BaseModel
from datetime import date, time

router = APIRouter()
astro_service = AstrologyService()

class ProfileCreate(BaseModel):
    name: str
    gender: str = "Male"
    dob: date
    tob: time
    lat: float
    lon: float
    location_name: str = ""
    grandfather_name: str = ""
    father_name: str = ""
    mother_name: str = ""
    caste: str = ""
    gotra: str = ""

@router.post("/")
def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    # 1. Save Profile
    db_profile = Profile(**profile.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    # 2. Calculate & Save Planets (Async ideally, Sync for now)
    planets_data = astro_service.calculate_planets(
        lat=profile.lat, lon=profile.lon,
        year=profile.dob.year, month=profile.dob.month, day=profile.dob.day,
        hour=profile.tob.hour, minute=profile.tob.minute
    )
    
    for p_data in planets_data:
        db_planet = PlanetaryPosition(**p_data, profile_id=db_profile.id)
        db.add(db_planet)
    
    db.commit()
    
    return {"id": db_profile.id, "message": "Profile created and calculated"}

@router.get("/{profile_id}")
def get_profile(profile_id: str, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile
