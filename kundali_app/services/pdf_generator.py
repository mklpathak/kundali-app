from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from io import BytesIO

class PDFGenerator:
    def __init__(self):
        self.width, self.height = A4
        self.styles = getSampleStyleSheet()
        self.create_custom_styles()

    def create_custom_styles(self):
        try:
            self.styles.add(ParagraphStyle(
                name='ReportTitle',  # Changed name to avoid conflict
                parent=self.styles['Heading1'],
                fontSize=24,
                spaceAfter=20,
                textColor=colors.HexColor('#8B0000'),
                alignment=1  # Center
            ))
        except KeyError: pass

        try:
            self.styles.add(ParagraphStyle(
                name='Subtitle',
                parent=self.styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#FF6B35'),
                spaceAfter=15,
                alignment=1
            ))
        except KeyError: pass

        try:
            self.styles.add(ParagraphStyle(
                name='SectionHeader',
                parent=self.styles['Heading3'],
                fontSize=16,
                textColor=colors.HexColor('#2D1810'),
                spaceBefore=15,
                spaceAfter=10,
                borderWidth=0,
                borderPadding=0
            ))
        except KeyError: pass

    def generate(self, data: dict) -> BytesIO:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        elements = []

        # 1. Title Page
        name = data.get('name', 'User')
        # Use safe get for styles
        title_style = self.styles.get('ReportTitle') or self.styles['Heading1']
        elements.append(Paragraph("Janma Kundali Report", title_style))
        elements.append(Paragraph(f"For {name}", self.styles['Subtitle']))
        elements.append(Spacer(1, 0.5 * inch))

        # 2. Birth Details
        elements.append(Paragraph("Birth Details", self.styles['SectionHeader']))
        bd = data.get('basic_details', {})
        bd_data = [
            ["Date of Birth", bd.get('date_of_birth', '-')],
            ["Time of Birth", bd.get('time_of_birth', '-')],
            ["Birth Place", "Lat: {:.2f}, Lon: {:.2f}".format(
                data.get('birth_details', {}).get('lat', 0),
                data.get('birth_details', {}).get('lon', 0)
            )]
        ]
        t = Table(bd_data, colWidths=[200, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFF8E7')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2D1810')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.3 * inch))

        # 3. Astrological Details
        elements.append(Paragraph("Astrological Details", self.styles['SectionHeader']))
        ad = data.get('astrological_details', {})
        pd = data.get('panchang_details', {})
        
        astro_data = [
            ["Ascendant", ad.get('ascendant', '-')],
            ["Moon Sign", ad.get('sign', '-')],
            ["Nakshatra", pd.get('nakshatra', '-')],
            ["Tithi", pd.get('tithi', '-')],
        ]
        t2 = Table(astro_data, colWidths=[200, 300])
        t2.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#FFF8E7')),
        ]))
        elements.append(t2)
        elements.append(Spacer(1, 0.3 * inch))

        # 4. Planetary Positions
        elements.append(Paragraph("Planetary Positions", self.styles['SectionHeader']))
        planets = data.get('planets', [])
        if planets:
            table_data = [["Planet", "Sign", "Degree", "Nakshatra", "House", "Status"]]
            for p in planets:
                is_retro = "Retrograde" if p.get('is_retrograde') else "Direct"
                degree = "{:.2f}".format(p.get('degree_decimal', 0))
                table_data.append([
                    p.get('planet', ''),
                    p.get('sign', ''),
                    degree,
                    p.get('nakshatra', ''),
                    str(p.get('house', '')),
                    is_retro
                ])
            
            t3 = Table(table_data, colWidths=[80, 80, 60, 100, 50, 80])
            t3.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B0000')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ]))
            elements.append(t3)

        doc.build(elements)
        buffer.seek(0)
        return buffer

pdf_generator = PDFGenerator()
