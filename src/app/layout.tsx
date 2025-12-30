import './globals.css';

import { ClerkProvider } from '@clerk/nextjs';
import { GoogleTagManager } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import NextTopLoader from 'nextjs-toploader';

import ErrorBoundary from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';

import Header from './components/header';
import ConvexClientProvider from './convex-client-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  fallback: ['monospace'],
});

const sifonn = localFont({
  src: './fonts/sifonn-pro.otf',
  variable: '--font-sifonn',
});

export const metadata: Metadata = {
  title: 'SBCJ - Banco de Questões | Banco de Questões de Ortopedia',
  description:
    'SBCJ - Banco de Questões. Conheça nossa plataforma e garanta sua aprovação na prova da SBOT! Feito por especialistas da USP.',
  keywords:
    'SBCJ, questões, simulados, preparação, residência médica, ortopedista',
  authors: [{ name: 'SBCJ' }],
  openGraph: {
    title: 'SBCJ - Banco de Questões',
    description:
      'SBCJ - Banco de Questões. Conheça nossa plataforma e garanta sua aprovação na prova da SBOT! Feito por especialistas da USP.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBCJ - Banco de Questões',
    description:
      'SBCJ - Banco de Questões. Conheça nossa plataforma e garanta sua aprovação na prova da SBOT! Feito por especialistas da USP.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="pt-BR">
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${sifonn.variable} antialiased`}
      >
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
          <ErrorBoundary>
            <ConvexClientProvider>
              <NextTopLoader />
              <Header />
              {children}
              <Analytics />
              <Toaster />
            </ConvexClientProvider>
          </ErrorBoundary>
        </ClerkProvider>
      </body>
    </html >
  );
}
