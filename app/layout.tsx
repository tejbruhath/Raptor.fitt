import type { Metadata } from "next";
import { Inter, Space_Mono, Urbanist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

const urbanist = Urbanist({
  weight: ["600", "700"],
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Raptor.fitt - Hunt Your Potential',
  description: 'The Intelligence Layer for Your Body',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Raptor.fitt",
  },
};

export const viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceMono.variable} ${urbanist.variable} font-body bg-background text-white antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <NavbarWrapper />
        </Providers>
      </body>
    </html>
  );
}
