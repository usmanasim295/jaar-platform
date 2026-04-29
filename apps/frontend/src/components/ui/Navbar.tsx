import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggleButton from '../LanguageToggleButton';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfileQuery } from '@/store/api';
import { NAV_ITEMS } from '@/features/navbar/constants/NavItems';
import UserDropdown from '@/features/navbar/components/UserDropdown';
import { useNavbar } from '@/features/navbar/hooks/useNavbar';
import { MobileMenu } from '@/features/navbar/components/MobileMenu';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery(
    isAuthenticated && user
      ? { serviceProviderId: user.id, lang: i18n.language as 'en' | 'ar' }
      : { serviceProviderId: '', lang: 'en' as 'en' | 'ar' },
    {
      skip: !isAuthenticated || !user,
      refetchOnMountOrArgChange: true,
    }
  );
  const { isOpen, setIsOpen, showUserMenu, setShowUserMenu, userMenuRef } =
    useNavbar(isAuthenticated, user, refetchProfile);
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <div className="sticky top-0 left-0 z-[90] py-2.5 px-4 sm:px-6 lg:px-10 bg-white w-full flex justify-center shadow-light font-jakarta">
      <title>(t{'Navbar'})</title>
      <div className="w-full max-w-[1300px] flex items-center justify-between">
        <Link href="/">
          <Image
            src="/assets/icons/SiteLogo.svg"
            width={57}
            height={60}
            alt="JAR logo"
            fetchPriority="high"
            priority
          />
        </Link>
        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-10">
            <LanguageToggleButton />
            {!isLoading &&
              isAuthenticated &&
              NAV_ITEMS.map(item => {
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
              {/* User Profile Dropdown */}
              <UserDropdown
                user={user}
                profileData={profileData}
                showUserMenu={showUserMenu}
                setShowUserMenu={setShowUserMenu}
                handleLogout={handleLogout}
                userMenuRef={userMenuRef}
                t={t}
              />
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
        <MobileMenu
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  );
}
