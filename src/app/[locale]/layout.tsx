import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppProvider } from "@/context/AppContext";
import TopBar from "@/components/layout/TopBar";
import BottomNav from "@/components/layout/BottomNav";
import type { Locale } from "@/types";
import "@/app/globals.css";

const locales: Locale[] = ["th", "en"];

export const metadata: Metadata = {
  title: "KidPath",
  description: "บันทึกการเดินทางของลูก ครบในที่เดียว · Your children's journey, all in one place",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#7F77DD",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) notFound();

  return (
    <html lang={locale}>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppProvider defaultLocale={locale as Locale}>
          {/* Top bar rendered in each page or layout for flexibility */}
          <div
            style={{
              minHeight: "100vh",
              paddingBottom: "calc(64px + env(safe-area-inset-bottom))",
              background: "var(--color-background-tertiary, #f5f5f3)",
            }}
          >
            {children}
          </div>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
