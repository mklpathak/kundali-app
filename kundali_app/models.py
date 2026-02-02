from sqlalchemy import Column, Integer, String, Float, Date, Time, DateTime, ForeignKey, Boolean, Enum as SqlEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db.session import Base
import uuid
import enum

class ChartType(str, enum.Enum):
    D1 = "D1"
    D9 = "D9"
    D10 = "D10"
    # Add other Vargas as needed

class PlanetName(str, enum.Enum):
    SUN = "Sun"
    MOON = "Moon"
    MARS = "Mars"
    MERCURY = "Mercury"
    JUPITER = "Jupiter"
    VENUS = "Venus"
    SATURN = "Saturn"
    RAHU = "Rahu"
    KETU = "Ketu"
    ASCENDANT = "Ascendant"

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True)
    gender = Column(String, default="Male") # Sex
    dob = Column(Date)
    tob = Column(Time)
    lat = Column(Float)
    lon = Column(Float)
    location_name = Column(String, nullable=True)
    
    # Family Particulars
    grandfather_name = Column(String, nullable=True)
    father_name = Column(String, nullable=True)
    mother_name = Column(String, nullable=True)
    caste = Column(String, nullable=True)
    gotra = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    planetary_positions = relationship("PlanetaryPosition", back_populates="profile", cascade="all, delete-orphan")

class PlanetaryPosition(Base):
    __tablename__ = "planetary_positions"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(String, ForeignKey("profiles.id"))
    chart_type = Column(String, default=ChartType.D1.value) # Storing Enum as String for SQLite compatibility simplicity
    planet = Column(String) 
    sign_id = Column(Integer) # 1=Aries, 12=Pisces
    degree = Column(Float) # 0-30
    absolute_degree = Column(Float) # 0-360
    house = Column(Integer) # 1-12
    nakshatra_id = Column(Integer) # 1-27
    nakshatra_pada = Column(Integer) # 1-4
    is_retrograde = Column(Boolean, default=False)

    profile = relationship("Profile", back_populates="planetary_positions")
