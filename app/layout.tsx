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
  title: "ELITEHUB — Premium Companion Marketplace",
  description: "Connect with exceptional companions for unforgettable experiences. Elite companions, secure payments, and premium service.",
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
