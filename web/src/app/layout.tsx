import type { Metadata } from "next";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from './theme';
import "./globals.css";

export const metadata: Metadata = {
  title: "कुंडली.AI - Your Personal Vedic Astrology",
  description: "Professional Kundali generation with accurate planetary positions, Vimshottari Dasha, and detailed horoscope analysis",
  keywords: "kundali, horoscope, vedic astrology, jyotish, birth chart, dasha, nakshatra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
