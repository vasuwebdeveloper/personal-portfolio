import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Besley, IBM_Plex_Mono, Public_Sans } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import { getSiteProfile } from "@/lib/content";

const besley = Besley({
  subsets: ["latin"],
  variable: "--font-besley",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getSiteProfile();
  const title = `${profile.name} · NetSuite Architect`;

  return {
    metadataBase: new URL(profile.siteUrl),
    title: {
      default: title,
      template: `%s · ${profile.name}`,
    },
    description: profile.description,
    // Google Search Console ownership proof; removing it un-verifies the site.
    verification: {
      google: "9Ljosrv3RaiJZWNzEa7XJUs-zx7dDhRMqp624ashsdk",
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName: title,
      title,
      description: profile.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: profile.description,
      images: ["/og.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await getSiteProfile();

  return (
    <html
      lang="en"
      className={`${besley.variable} ${publicSans.variable} ${plexMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        {/* Hoisted to <head> by React; page-level `alternates` metadata
            would silently replace this if it lived in generateMetadata. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`Writing · ${profile.name}`}
          href="/feed.xml"
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-4 focus:py-2 focus:font-mono focus:text-sm"
        >
          Skip to content
        </a>
        <SiteHeader profile={profile} />
        <main id="main">{children}</main>
        <SiteFooter profile={profile} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
