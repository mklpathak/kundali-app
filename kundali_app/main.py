from fastapi import FastAPI
from kundali_app.api.routes import router
from kundali_app.core.config import settings
import uvicorn

app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)

# Include Routes
app.include_router(router)

if __name__ == "__main__":
    uvicorn.run("kundali_app.main:app", host="0.0.0.0", port=8000, reload=True)
