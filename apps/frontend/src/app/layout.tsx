import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavbarWrapper from './NavbarWrapper';
import '../i18n'; // import i18n config
import { headers } from 'next/headers';
import { AuthProvider } from '@/contexts/AuthContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import ReduxProvider from '@/store/ReduxProvider';
import ToastWrapper from '@/components/ToastWrapper';
import { CONFIG } from '../lib/config';

const defaultLang = CONFIG.DEFAULT_LANGUAGE || 'ar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'JAR',
  description: 'جار لإدارة المجتمعات السكنية و إتحادات الملاك',
  icons: '/assets/icons/SiteLogo.svg',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || '';
  const isAdminRoute = pathname.startsWith('/admin');

  return (
    <html lang={defaultLang} dir={defaultLang === 'ar' ? 'rtl' : 'ltr'}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthProvider>
            <AdminAuthProvider>
              {!isAdminRoute && <NavbarWrapper />}
              {children}
              <ToastWrapper />
            </AdminAuthProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
