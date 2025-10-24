import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NavbarWrapper from './NavbarWrapper';
import '../i18n'; // import i18n config
import ReduxProvider from '@/store/ReduxProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import ToastWrapper from '@/components/ToastWrapper';

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReduxProvider>
          <AuthProvider>
            <NavbarWrapper />
            {children}
            <ToastWrapper />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
