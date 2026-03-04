import { Noto_Sans_Thai } from 'next/font/google';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import type { Metadata } from 'next';

import '@workspace/ui/globals.css';
import { routing } from '@/lib/i18n/routing';
import { Locale } from '@/lib/i18n/config';
import { Providers } from '@/components/providers';

const fontSans = Noto_Sans_Thai({
  subsets: ['latin', 'thai'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'AI Agent Marketplace',
    description: 'Human hires AI - Marketplace Platform',
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;

  // Validate locale
  if (!routing.locales.includes(lang as Locale)) {
    notFound();
  }

  // Providing all messages to the client side
  const messages = await getMessages();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased`}>
        <Providers>
          <NextIntlClientProvider locale={lang as Locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
