from pydantic import BaseModel, Field

class KundaliRequest(BaseModel):
    name: str = Field(..., description="Name of the person")
    year: int = Field(..., ge=1900, le=2100, description="Birth Year")
    month: int = Field(..., ge=1, le=12, description="Birth Month")
    day: int = Field(..., ge=1, le=31, description="Birth Day")
    hour: int = Field(..., ge=0, le=23, description="Birth Hour (24h format)")
    minute: int = Field(..., ge=0, le=59, description="Birth Minute")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    timezone: float = Field(5.5, description="Timezone offset from UTC (default IST)")
