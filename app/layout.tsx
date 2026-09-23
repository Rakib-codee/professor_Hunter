import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans } from 'next/font/google';
import Script from 'next/script';
import { Footer } from '@/components/layout/footer';
import { getPublicEnv } from '@/lib/env';
import './globals.css';

// DESIGN.md §7 (direction B): one engineered family, IBM Plex Sans, 400 for text, 600 for
// controls and emphasis, 700 for display. Latin subset only, ~53 KB, metric-matched fallback.
const plex = IBM_Plex_Sans({
  variable: '--font-plex',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Professor Hunter',
    template: '%s · Professor Hunter',
  },
  description:
    "Find supervisors in China for CSC master's and PhD applications, draft a personalised acceptance-letter request, and track replies.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  const { NEXT_PUBLIC_UMAMI_SCRIPT_URL, NEXT_PUBLIC_UMAMI_WEBSITE_ID } = getPublicEnv();
  return (
    <html lang="en" className={`${plex.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <Footer />
        {NEXT_PUBLIC_UMAMI_SCRIPT_URL && NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
          // Cookie-free analytics (PLAN.md §3); loaded only when both values are set.
          <Script
            src={NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
