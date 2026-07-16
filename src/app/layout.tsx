import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Sailor Draft — Screenwriting, unadorned',
    template: '%s · Sailor Draft',
  },
  description:
    'A minimalist screenplay editor. Standard Hollywood format, Courier Prime, import and export your scripts.',
  keywords: [
    'Sailor Draft',
    'screenplay',
    'screenwriting',
    'Final Draft alternative',
    'Fountain',
    'Courier Prime',
  ],
  authors: [{ name: 'Sailor Draft' }],
  generator: 'Sailor Draft',
  openGraph: {
    title: 'Sailor Draft',
    description:
      'A minimalist screenplay editor. Standard Hollywood format, Courier Prime, import and export.',
    siteName: 'Sailor Draft',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        {isDev && <Inspector />}
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
