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
  title: "Iris — Real-Time Multimodal AI Studio",
  description:
    "Voice + vision creative studio with streaming image generation, TTS narration, and production observability.",
  openGraph: {
    title: "Iris — See. Speak. Create.",
    description: "Real-time multimodal AI studio for creative direction.",
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
