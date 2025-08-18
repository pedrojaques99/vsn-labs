import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wave Effects",
  description: "Interactive wave effects with ASCII and elliptical lines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10 mb-50">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Link 
              href="/"
              className="text-white font-mono font-semibold hover:text-gray-300 transition-colors"
            >
              ← Back
            </Link>
          </div>
        </nav>
        
        {children}
      </body>
    </html>
  );
}
