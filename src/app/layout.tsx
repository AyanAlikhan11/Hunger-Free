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
  title: "HungerFree - Zero Hunger | SDG Goal 2",
  description: "HungerFree is a platform working towards UN SDG Goal 2: Zero Hunger. Connect surplus food with those who need it. Donate food, volunteer, or support farmers.",
  keywords: ["zero hunger", "SDG 2", "food donation", "food rescue", "NGO", "volunteer", "farmer", "sustainable", "hunger free", "food waste"],
  authors: [{ name: "HungerFree Team" }],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍏</text></svg>",
  },
  openGraph: {
    title: "HungerFree - Working Towards Zero Hunger",
    description: "Connect surplus food with those who need it. Join the movement to end hunger by 2030.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HungerFree - Zero Hunger",
    description: "Working towards UN SDG Goal 2: Zero Hunger. Every meal matters.",
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
        {children}
        
      </body>
    </html>
  );
}
