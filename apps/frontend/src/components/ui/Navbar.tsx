'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import LanguageToggleButton from '../LanguageToggleButton';
import { useTranslation } from 'react-i18next';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Button from './Button';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { label: 'Find Jobs', path: '/' },
    { label: 'Ongoing Jobs', path: '/ongoingjobs' },
    { label: 'My Bids', path: '/my-bids' },
    { label: 'Messages', path: '/messages' },
  ];

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 left-0 z-[90] py-2.5 px-4 sm:px-6 lg:px-10 bg-white w-full flex justify-center shadow-light font-jakarta">
      <div className="w-full max-w-[1300px] flex items-center justify-between">
        <Link href="/">
          <Image
            src="/assets/icons/SiteLogo.svg"
            width={57}
            height={60}
            alt="JAR logo"
            className=""
          />
        </Link>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-10">
            <LanguageToggleButton />
            {!isLoading &&
              isAuthenticated &&
              navItems.map(item => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    href={item.path}
                    prefetch={false}
                    className={`relative pb-1 transition-colors duration-300 ${
                      isActive
                        ? 'text-[#2d6a87] font-medium'
                        : 'text-gray-700 hover:text-[#2d6a87]'
                    }`}
                  >
                    {t(item.label)}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2d6a87]" />
                    )}
                  </Link>
                );
              })}
          </div>

          {isLoading ? (
            <div className="hidden lg:flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[#2d6a87] rounded-full animate-spin" />
            </div>
          ) : isAuthenticated ? (
            <div className="hidden lg:flex gap-4 items-center">
              {/* <div className="flex items-center justify-center rounded-full h-11 w-11 bg-(--primary) shrink-0">
                <Image
                  src={"/assets/icons/Bell.svg"}
                  width={24}
                  height={24}
                  alt="bell"
                />
              </div> */}

              {/* User Profile Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {user?.name ? (
                      <span className="text-sm font-semibold text-gray-700 capitalize">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <User className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name || 'User'}
                  </span>
                </button>

                {showUserMenu && (
                  <div
                    className={`absolute mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${i18n.language === 'ar' ? 'left-0' : 'right-0'}`}
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.name}
                      </p>
                      <div className="max-w-[150px]">
                        <p
                          className={`text-xs text-gray-500 truncate `}
                          style={{
                            direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
                            unicodeBidi: 'plaintext',
                          }}
                          title={user?.email}
                        >
                          {user?.email}abc
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('Logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <p className=" h-6 w-6 ">&times;</p>
            ) : (
              <p className=" h-6 w-6 ">
                <Menu />
              </p>
            )}
          </button>
        </div>
        {isOpen && (
          <div className="lg:hidden absolute top-14 w-[90%] right-2 mt-2 bg-white rounded-xl shadow-dark p-3 space-y-2">
            <LanguageToggleButton />
            {isAuthenticated ? (
              <>
                {navItems.map(item => {
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
      </div>
    </div>
  );
}
