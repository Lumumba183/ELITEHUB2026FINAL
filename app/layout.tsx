import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Inter({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: "ELITEHUB — Premium Companion Marketplace",
    template: "%s | ELITEHUB",
  },
  description: "Connect with exceptional companions for unforgettable experiences. Elite companions, secure payments, and premium service.",
  keywords: ["companionship", "dating", "elite", "premium", "Kenya", "Nairobi", "companions", "luxury"],
  authors: [{ name: "ELITEHUB" }],
  creator: "ELITEHUB",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://elitehub.co.ke"),
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "/",
    siteName: "ELITEHUB",
    title: "ELITEHUB — Premium Companion Marketplace",
    description: "Connect with exceptional companions for unforgettable experiences.",
    images: [
      {
        url: "/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ELITEHUB",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ELITEHUB — Premium Companion Marketplace",
    description: "Connect with exceptional companions for unforgettable experiences.",
    images: ["/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} ${geistMono.variable} antialiased bg-[#0A0A0F] text-[#F5E6D3] min-h-screen`}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#14141E",
                color: "#F5E6D3",
                border: "1px solid rgba(255,255,255,0.1)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
