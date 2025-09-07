import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import "./globals.css";
import Providers from './providers';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Civic-Eye | Empowering Communities Through Civic Engagement",
  description: "Join your community in making a difference. Report issues, track progress, and engage with local government through our transparent civic platform.",
  authors: [{ name: "Civic-Eye Team" }],
  keywords: [
    "civic engagement",
    "community reporting",
    "local government",
    "civic tech",
    "issue tracking",
  ],
  openGraph: {
    title: "Civic-Eye | Empowering Communities Through Civic Engagement",
    description: "Join your community in making a difference. Report issues, track progress, and engage with local government through our transparent civic platform.",
    type: "website",
    images: [
      "https://lovable.dev/opengraph-image-p98pqg.png",
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@lovable_dev",
    images: ["https://lovable.dev/opengraph-image-p98pqg.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster />
          <SonnerToaster />
        </Providers>
      </body>
    </html>
  );
}