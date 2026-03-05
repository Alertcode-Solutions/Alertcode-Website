import type { Metadata, Viewport } from "next";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import Script from "next/script";
import ThemeProvider from "@/components/providers/ThemeProvider";
import AnalyticsTracker from "@/components/ui/AnalyticsTracker";
import Footer from "@/components/ui/Footer";
import Navbar from "@/components/ui/Navbar";
import ServiceWorkerCleanup from "@/components/ui/ServiceWorkerCleanup";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import WebVitalsReporter from "@/components/ui/WebVitalsReporter";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const DEFAULT_OG_IMAGE = "/icons/icon-512.png";
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim() || process.env.NEXT_PUBLIC_ANALYTICS_ID?.trim() || "";
const shouldLoadGa = process.env.NEXT_PUBLIC_APP_ENV === "production" && gaId.length > 0;
const shouldLoadVercelAnalytics = process.env.VERCEL === "1";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  sameAs: [siteConfig.social.linkedin, siteConfig.social.x, siteConfig.social.github].filter(Boolean),
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Engineering Intelligent Digital Infrastructure`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Engineering Intelligent Digital Infrastructure`,
    description: siteConfig.description,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 512,
        height: 512,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Engineering Intelligent Digital Infrastructure`,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/icons/icon-192.png"],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0F14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background text-foreground font-sans antialiased`}>
        <ThemeProvider>
          <ServiceWorkerCleanup />
          <WebVitalsReporter />
          <AnalyticsTracker />

          {shouldLoadGa ? (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
              <Script
                id="ga-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    window.gtag = gtag;
                    gtag('js', new Date());
                    gtag('config', '${gaId}', { send_page_view: false });
                  `,
                }}
              />
            </>
          ) : null}

          <Script
            id="organization-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          />

          <SmoothScrollProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </SmoothScrollProvider>

          {shouldLoadVercelAnalytics ? <VercelAnalytics /> : null}
        </ThemeProvider>
      </body>
    </html>
  );
}
