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
  title: "THE UNWRITTEN — Every Choice Leaves a Trace",
  description:
    "Six chapters. Unexpected decisions. A story that becomes your own. An interactive narrative experience.",
  openGraph: {
    title: "THE UNWRITTEN",
    description:
      "Every choice leaves a trace. Six chapters. Unexpected decisions. A story that becomes your own.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${sansFont.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#E7E0D3] selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
