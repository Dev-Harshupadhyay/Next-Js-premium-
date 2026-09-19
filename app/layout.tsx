import type { Metadata, Viewport } from "next";
import { Poppins, Inter, Space_Mono } from "next/font/google";
import { SITE } from "@/lib/config";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

/** Double safety: SITE.url already validated hai, phir bhi build yahan na ruke. */
function safeMetadataBase(): URL | undefined {
  try {
    return new URL(SITE.url);
  } catch {
    return undefined;
  }
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase(),
  title: {
    default: `${SITE.name} | Official`,
    template: `%s · ${SITE.shortName}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "OTT subscription india",
    "sasta ott",
    "timepass premium",
    "movies web series subscription",
    "upi payment ott",
  ],
  authors: [{ name: SITE.author, url: SITE.authorUrl }],
  openGraph: {
    type: "website",
    title: `${SITE.shortName} PREMIUM | Official`,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    images: [{ url: SITE.heroImage, width: 1200, height: 630, alt: SITE.name }],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.shortName} PREMIUM`,
    description: SITE.description,
    images: [SITE.heroImage],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='0.9em' font-size='90'%3E%E2%9A%A1%3C/text%3E%3C/svg%3E",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#06070e",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
