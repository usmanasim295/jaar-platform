'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Home, LayoutDashboard, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type SidebarLink = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

type AdminSidebarProps = {
  isOpen: boolean;
  isRTL: boolean;
  onClose: () => void;
};

export function AdminSidebar({ isOpen, isRTL, onClose }: AdminSidebarProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const sidebarLinks: SidebarLink[] = useMemo(
    () => [
      {
        id: 'dashboard',
        label: t('Dashboard'),
        icon: <LayoutDashboard className="h-4 w-4" />,
        href: '/admin/dashboard',
      },
      {
        id: 'homeowners',
        label: t('Homeowners'),
        icon: <Home className="h-4 w-4" />,
        href: '/admin/homeowners',
      },
      {
        id: 'hoa-leaders',
        label: t('HOA Leaders'),
        icon: <Building2 className="h-4 w-4" />,
        href: '/admin/hoa-leaders',
      },
      {
        id: 'service-providers',
        label: t('Service Providers'),
        icon: <Users className="h-4 w-4" />,
        href: '/admin/service-providers',
      },
    ],
    [t]
  );

  return (
    <aside
      className={`fixed top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} z-40 flex w-72 flex-col  border-slate-200 bg-[#F5F7FB] px-6 py-8 transition-transform duration-300 ease-in-out ${
        isOpen
          ? 'translate-x-0'
          : isRTL
            ? 'translate-x-full lg:translate-x-0'
            : '-translate-x-full lg:translate-x-0'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        {/* <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0E7490] font-semibold text-white shadow-md">
            J
          </div>
          <div>
            <p className="font-anevir text-xl text-[#0E1629]">JAR</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {t('Admin Panel')}
            </p>
          </div>
        </div> */}
        <div className="flex items-center justify-center w-full">
          <Image
            src="/assets/icons/SiteLogo.svg"
            width={80}
            height={85}
            alt="JAR logo"
            className=""
          />
        </div>

        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          onClick={onClose}
          aria-label={t('Close sidebar')}
        >
          ✕
        </button>
      </div>

      <nav className="mt-10 flex-1 space-y-2 overflow-y-auto">
        {sidebarLinks.map((link, index) => (
          <Link
            key={link.id}
            href={link.href}
            className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
              isRTL ? 'flex-row-reverse text-right' : 'text-left'
            } ${
              pathname === link.href || pathname?.startsWith(`${link.href}/`)
                ? 'bg-[#0E7490] text-white shadow-md'
                : 'text-slate-600 hover:bg-[#E1EEF4]'
            }`}
          >
            {link.icon}
            <span className="flex-1" dir={isRTL ? 'rtl' : 'ltr'}>
              {link.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
