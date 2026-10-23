import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AW GYMS 2.0 — Immersive Strength Flagship",
  description: "Pakistan's flagship strength & supplement house. Authentic supplements, commercial-grade iron, a 24/7 neural concierge, and cinematic scrollytelling. There is no shortcut.",
  keywords: ["AW GYMS", "gym Pakistan", "supplements", "fitness", "strength", "Lahore gym", "Karachi gym", "whey", "creatine", "treadmill"],
  authors: [{ name: "AW GYMS" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "AW GYMS 2.0 — There Is No Shortcut",
    description: "Pakistan's immersive strength flagship. Authentic supplements, commercial iron, 24/7 AI concierge.",
    siteName: "AW GYMS",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AW GYMS 2.0",
    description: "Pakistan's immersive strength flagship.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
