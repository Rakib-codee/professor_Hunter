import type { Metadata, Viewport } from 'next';
import { Source_Sans_3 } from 'next/font/google';
import Script from 'next/script';
import { Footer } from '@/components/layout/footer';
import { getPublicEnv } from '@/lib/env';
import './globals.css';

// DESIGN.md §2: one Latin family, two weights, metric-matched fallback (no layout shift).
const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  weight: ['400', '600'],
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
    <html lang="en" className={`${sourceSans.variable} h-full antialiased`}>
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
