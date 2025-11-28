'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type AdminNavbarProps = {
  title: string;
  subtitle?: string;
  isRTL: boolean;
  onToggleSidebar: () => void;
  onLanguageToggle: (lang: 'en' | 'ar') => void;
  currentLang: 'en' | 'ar';
  onLogout: () => void;
  adminInitial?: string;
};

export function AdminNavbar({
  title,
  subtitle,
  isRTL,
  onToggleSidebar,
  onLanguageToggle,
  currentLang,
  onLogout,
  adminInitial = 'A',
}: AdminNavbarProps) {
  const { t } = useTranslation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleProfileToggle = () => {
    setIsProfileOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            onClick={onToggleSidebar}
            aria-label={t('Toggle sidebar')}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center lg:gap-4 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`flex rounded-full bg-[var(--light-grey)] shadow-inner font-semibold font-jakarta ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <button
                onClick={() => currentLang !== 'en' && onLanguageToggle('en')}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ease-in-out ${
                  currentLang === 'en'
                    ? 'bg-(--primary) text-white cursor-default'
                    : 'text-[var(--primary-black)] hover:bg-gray-200 cursor-pointer'
                }`}
                disabled={currentLang === 'en'}
              >
                {/* {t('English')} */}
                English
              </button>
              <button
                onClick={() => currentLang !== 'ar' && onLanguageToggle('ar')}
                className={`px-4 py-1.5 text-sm rounded-full transition-all duration-300 ease-in-out ${
                  currentLang === 'ar'
                    ? 'bg-(--primary) text-white cursor-default'
                    : 'text-[var(--primary-black)] hover:bg-gray-200 cursor-pointer'
                }`}
                disabled={currentLang === 'ar'}
              >
                {t('Arabic')}
              </button>
            </div>
          </div>

          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={handleProfileToggle}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0E7490]/10 text-[#0E7490] uppercase">
                {adminInitial || 'A'}
              </span>
            </button>
            {isProfileOpen && (
              <div
                className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg`}
              >
                <button
                  className="flex w-full items-center gap-2 px-4 py-3 text-slate-600 transition hover:bg-slate-100"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {t('Logout')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
