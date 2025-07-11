"use client";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title> AIF CMS | Content Management Software</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* <AuthProvider>
          <AuthGuard>
            {children}
            </AuthGuard>
        </AuthProvider> */}
        {children}
      </body>
    </html>
  );
}
