from fastapi import FastAPI
from kundali_app.core.config import settings
from kundali_app.db.session import engine, Base
from kundali_app.api.routes import profiles, astro

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Headless Kundali API", version="2.0")

app.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])
app.include_router(astro.router, prefix="/astro", tags=["Astrology"])

@app.get("/")
def health_check():
    return {"status": "ok", "mode": "headless"}

if __name__ == "__main__":
    uvicorn.run("kundali_app.main:app", host="0.0.0.0", port=8000, reload=True)
