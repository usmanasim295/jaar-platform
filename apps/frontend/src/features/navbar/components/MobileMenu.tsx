import LanguageToggleButton from '@/components/LanguageToggleButton';
import Link from 'next/link';
import React from 'react';
import { NAV_ITEMS } from '../constants/NavItems';
import { t } from 'i18next';
import { LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export const MobileMenu = ({ isOpen, setIsOpen, handleLogout }: any) => {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="lg:hidden absolute top-14 w-[90%] right-2 mt-2 bg-white rounded-xl shadow-dark p-3 space-y-2">
          <LanguageToggleButton />
          {isAuthenticated ? (
            <>
              {NAV_ITEMS.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    prefetch={false}
                    className={`block px-4 py-2 text-sm rounded-md transition-colors duration-300 ${
                      isActive
                        ? 'text-[#2d6a87] font-medium bg-blue-50'
                        : 'text-gray-700 hover:text-[#2d6a87] hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(item.label)}
                  </Link>
                );
              })}
              <div className="border-t border-gray-200 pt-2 cursor-pointer">
                <div className="px-4 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t('Logout')}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                href="/signin"
                className="block px-4 py-2 text-sm rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {t('Sign In')}
              </Link>
              <Link
                href="/signup"
                className="block px-4 py-2 text-sm rounded-md hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {t('Sign Up')}
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};
