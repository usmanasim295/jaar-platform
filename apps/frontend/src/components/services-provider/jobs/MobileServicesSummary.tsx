'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MobileServicesSummaryProps {
  isProfileLoading: boolean;
  profileData: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function MobileServicesSummary({
  isProfileLoading,
  profileData,
  isExpanded,
  onToggle,
}: MobileServicesSummaryProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onToggle}
      className="flex-shrink-0 bg-(--white) p-4 mt-2.5 mr-2.5 rounded-xl shadow-dark cursor-pointer min-w-[280px] hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-3 h-12">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-(--primary-black)">
            {t('Services')}
          </div>
          <p className="text-xs text-gray-500">
            {isProfileLoading
              ? '...'
              : `${profileData?.services?.length || 0} ${t('services')}`}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
