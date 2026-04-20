'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from '@/components/assets/icons';

interface JobSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobSearchBar({ value, onChange }: JobSearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="relative w-full p-3 sm:p-4 flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-(--grey-text) bg-(--light-grey) h-[45px] sm:h-[50px] rounded-lg sm:rounded-[10px]">
      <MagnifyingGlass className="w-5 h-5 sm:w-6 sm:h-6" />
      <input
        type="text"
        placeholder={t('Search Jobs')}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-(--light-grey) placeholder:text-sm sm:placeholder:typo-body pr-2 sm:pr-4 py-2 sm:py-3 text-sm sm:typo-body text-(--black) focus:outline-none"
      />
    </div>
  );
}
