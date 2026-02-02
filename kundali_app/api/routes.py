from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from kundali_app.domain.schemas import KundaliRequest
from kundali_app.services.astrology import AstrologyService
from kundali_app.services.pdf import PDFGenerator
from kundali_app.core.config import settings
import os

router = APIRouter()

# Dependency Injection
def get_astrology_service():
    return AstrologyService()

@router.post("/generate_kundali")
async def generate_kundali(
    request: KundaliRequest, 
    background_tasks: BackgroundTasks,
    astro_service: AstrologyService = Depends(get_astrology_service)
):
    try:
        # 1. Calculate Data (Domain Logic)
        chart_data = astro_service.calculate_chart_data(request)
        
        # 2. Generate PDF (Infrastructure)
        os.makedirs(settings.OUTPUT_DIR, exist_ok=True)
        filename = f"{request.name.replace(' ', '_')}_kundali.pdf"
        filepath = os.path.join(settings.OUTPUT_DIR, filename)
        
        pdf_gen = PDFGenerator(filepath, chart_data)
        pdf_gen.generate()
        
        # 3. Return File
        return FileResponse(filepath, media_type='application/pdf', filename=filename)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
