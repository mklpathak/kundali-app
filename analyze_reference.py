import fitz  # PyMuPDF
import sys

def analyze_pdf(path):
    try:
        doc = fitz.open(path)
        print(f"File: {path}")
        print(f"Pages: {len(doc)}")
        print("-" * 20)
        
        # Analyze first 3 pages
        for i in range(min(3, len(doc))):
            page = doc[i]
            text = page.get_text("text")
            print(f"--- Page {i+1} ---")
            print(text[:500].replace('\n', ' ')) # Print first 500 chars flattened
            print("...")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_pdf("refrence-pdf/basic-janampatri.pdf")
