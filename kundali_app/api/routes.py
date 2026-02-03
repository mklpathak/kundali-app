from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import HTMLResponse
from kundali_app.domain.schemas import KundaliRequest
from kundali_app.services.astrology import AstrologyService
from kundali_app.services.html_renderer import HTMLGenerator
from kundali_app.core.config import settings
import os

router = APIRouter()

# Dependency Injection
def get_astrology_service():
    return AstrologyService()

@router.post("/generate_kundali")
async def generate_kundali(
    request: KundaliRequest, 
    astro_service: AstrologyService = Depends(get_astrology_service)
):
    try:
        # 1. Calculate Data (Domain Logic)
        chart_data = astro_service.calculate_chart_data(request)
        
        # 2. Return Data (JSON)
        return chart_data
        
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse
from typing import Dict, Any
from kundali_app.services.pdf_generator import pdf_generator

@router.post("/download-pdf")
async def download_pdf(data: Dict[str, Any]):
    try:
        pdf_buffer = pdf_generator.generate(data)
        filename = f"{data.get('name', 'Report')}_kundali.pdf".replace(" ", "_")
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
