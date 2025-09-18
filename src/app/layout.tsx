import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BackButton from "./components/BackButton";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Visant Labs®",
  description: "Experimental interactive design lab",
  keywords: ["brazilian", "pedro jaques", "pedro xavier", "visant co. studio", "wave effects", "audio visualizer", "ASCII art", "interactive", "visual effects", "experimental", "design", "lab"],
  authors: [{ name: "Visant Co. Studio" }],
  creator: "Visant Studio",
  publisher: "Visant Co. Studio",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://vsn-labs.vercel.app",
    siteName: "Visant Labs®",
    title: "Visant Labs®",
  },
  twitter: {
    card: "summary",
    title: "Visant Labs®",
    creator: "@visant.co",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#0a0a0a",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {/* Navigation back button - only show on non-home pages */}
          <BackButton />
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
