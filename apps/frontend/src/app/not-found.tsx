'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
      <Link href="/">
        <Image
          src="/assets/icons/SiteLogo.svg"
          alt="JAR logo"
          width={80}
          height={84}
          priority
        />
      </Link>
      <div className="mt-8 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">404</h1>
        <p className="mt-2 text-base text-gray-600">
          {t('PageNotFoundMessage')}
        </p>
      </div>
    </div>
  );
}
