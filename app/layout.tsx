import type { Metadata } from "next";
import { Inter, Space_Mono, Urbanist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavbarWrapper from "@/components/NavbarWrapper";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
  title: 'Raptor.Fitt - Hunt Your Potential',
  description: 'The Intelligence Layer for Your Body. Track. Train. Transform.',
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Raptor.Fitt",
  },
  icons: {
    icon: [
      { url: '/raptor-logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/raptor-logo.svg', type: 'image/svg+xml' },
    ],
  },
  applicationName: 'Raptor.Fitt',
  keywords: ['fitness', 'workout', 'strength', 'training', 'progressive overload', 'gym'],
};

export const viewport = {
  themeColor: "#14F1C0",
  width: "device-width",
  initialScale: 1,
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
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
