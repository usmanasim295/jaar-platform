'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface MobileProfileSummaryProps {
  isProfileLoading: boolean;
  profileData: any;
  userName?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function MobileProfileSummary({
  isProfileLoading,
  profileData,
  userName,
  isExpanded,
  onToggle,
}: MobileProfileSummaryProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onToggle}
      className="flex-shrink-0 bg-(--white) p-4 mt-2.5 ml-2.5 rounded-xl shadow-dark cursor-pointer min-w-[280px] hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
          {isProfileLoading ? (
            <div className="w-full h-full bg-gray-200 animate-pulse" />
          ) : profileData?.profilePictureUrl ? (
            <img
              src={profileData.profilePictureUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm">
              {userName?.charAt(0)?.toUpperCase() || t('U')}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-(--primary) truncate">
            {isProfileLoading ? (
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
            ) : (
              profileData?.name || userName || t('User')
            )}
          </div>
          <p className="text-xs text-gray-500">{t('View Profile')}</p>
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
