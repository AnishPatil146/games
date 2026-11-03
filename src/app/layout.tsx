import type { Metadata } from "next";
import { Newsreader, Inter } from "next/font/google";
import "./globals.css";

const serifFont = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const sansFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THE UNWRITTEN — An Interactive Narrative Experience",
  description:
    "An interactive experiment in choices, curiosity, observation, and imagination. Six chapters. No perfect answers. Just your decisions.",
  openGraph: {
    title: "THE UNWRITTEN",
    description: "Every choice leaves a trace. Every story reveals something.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF8F5] text-[#1C1917] selection:bg-[#E0D7CB] selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
