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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://iris-puce.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Iris — Real-Time Multimodal AI Studio",
    template: "%s · Iris",
  },
  description:
    "Voice + vision AI studio with streaming image generation, TTS narration, and production observability. See. Speak. Create.",
  keywords: ["AI", "multimodal", "GenAI", "voice", "vision", "portfolio"],
  authors: [{ name: "Md. Jahidul Islam", url: "https://github.com/jahidbappi" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Iris — See. Speak. Create.",
    description: "Real-time multimodal AI studio for creative direction.",
    siteName: "Iris",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iris — Real-Time Multimodal AI Studio",
    description: "Voice + vision creative studio with production observability.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#07070d]`}>
        {children}
      </body>
    </html>
  );
}
