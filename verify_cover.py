import fitz # pymupdf
import sys

def convert_cover():
    pdf_path = "kundali_traditional_cover.pdf"
    img_path = "kundali_cover_preview.png"
    
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        pix = page.get_pixmap()
        pix.save(img_path)
        print(f"Saved cover preview to {img_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    convert_cover()
