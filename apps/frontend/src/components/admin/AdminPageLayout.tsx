'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';
import i18n from '@/i18n';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

type AdminPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AdminPageLayout({
  title,
  subtitle,
  children,
}: AdminPageLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [currentLang, setCurrentLang] = useState<'en' | 'ar'>(
    (i18n.language as 'en' | 'ar') || 'en'
  );
  const { admin, logout, isLoading } = useAdminAuth();

  useEffect(() => {
    setIsRTL(i18n.language === 'ar');
    setCurrentLang((i18n.language as 'en' | 'ar') || 'en');
  }, []);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setIsRTL(lng === 'ar');
      setCurrentLang((lng as 'en' | 'ar') || 'en');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const handleLanguageToggle = (lang: 'en' | 'ar') => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  const adminInitial = useMemo(() => {
    if (!admin?.email) return 'A';
    return admin.email.charAt(0).toUpperCase();
  }, [admin]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-[#0E7490]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex min-h-screen">
        <AdminSidebar
          isOpen={isSidebarOpen}
          isRTL={isRTL}
          onClose={() => setIsSidebarOpen(false)}
        />

        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main
          className={`flex w-full flex-col ${isRTL ? 'lg:mr-72' : 'lg:ml-72'}`}
        >
          <AdminNavbar
            title={title}
            subtitle={subtitle}
            isRTL={isRTL}
            currentLang={currentLang}
            onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
            onLanguageToggle={handleLanguageToggle}
            onLogout={logout}
            adminInitial={adminInitial}
          />

          <section className="flex-1 space-y-8 px-4 py-6 sm:px-8 sm:py-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}
