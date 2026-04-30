'use client';
import React from 'react';
import { FILTER_PRESETS, filterLabels, FilterPreset } from '../types';
import { useTranslation } from 'react-i18next';

type Props = {
  active: FilterPreset;
  onChange: (v: FilterPreset) => void;
};

export const FilterPills = ({ active, onChange }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_PRESETS.map(filter => (
        <button
          key={filter}
          onClick={() => onChange(filter)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            active === filter
              ? 'border-[#0E7490] bg-[#0E7490] text-white'
              : 'border-slate-200 text-slate-500 hover:border-[#0E7490]/60 hover:text-[#0E7490]'
          }`}
        >
          {t(filterLabels[filter])}
        </button>
      ))}
    </div>
  );
};
