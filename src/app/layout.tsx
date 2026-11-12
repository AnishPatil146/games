import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "THE UNWRITTEN — Where Silence Speaks",
  description:
    "An atmospheric psychological mystery and rigorous academic reasoning experience. Choose your journey: Junior Academy or Senior Solo Investigation.",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/logo-header.png",
  },
  openGraph: {
    title: "THE UNWRITTEN — Where Silence Speaks",
    description:
      "Where silence speaks. Psychological mystery, high-stakes deduction, and rigorous academic reasoning.",
    type: "website",
    images: ["/brand/logo-circular.png"],
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
      className={`${serifFont.variable} ${sansFont.variable} h-full w-full`}
    >
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-[#FAF7F2] text-[#1C1917] selection:bg-[#E7E0D3] selection:text-[#1C1917]">
        {children}
      </body>
    </html>
  );
}
