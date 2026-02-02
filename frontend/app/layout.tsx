import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kundali - Vedic Astrology",
  description: "Generate your personalized Kundali with Vedic astrology charts, Vimshottari Dasha, and detailed predictions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-[#8B0000] to-[#5C0000] text-white py-4 px-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl om-symbol">ॐ</span>
              <div>
                <h1 className="text-2xl font-bold tracking-wide">Kundali</h1>
                <p className="text-xs text-[#FFD700] tracking-widest">वैदिक ज्योतिष</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="hover:text-[#FFD700] transition-colors">Home</a>
              <a href="/kundali" className="hover:text-[#FFD700] transition-colors">My Kundali</a>
              <a href="/charts" className="hover:text-[#FFD700] transition-colors">Charts</a>
              <a href="/dasha" className="hover:text-[#FFD700] transition-colors">Dasha</a>
              <a href="/ascendant" className="hover:text-[#FFD700] transition-colors">Ascendant</a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-screen mandala-bg">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-[#2D1810] text-[#FFF8E7] py-8 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-2xl mb-2">🙏</p>
            <p className="text-sm text-[#D4C4B0]">
              Kundali - Powered by Vedic Astrology & Ancient Wisdom
            </p>
            <p className="text-xs text-[#8B7355] mt-2">
              © 2026 All rights reserved
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
