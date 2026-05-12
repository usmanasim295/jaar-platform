'use client';
import { useGetAdminUserStatsQuery } from '@/store/api';
import React from 'react';
import i18n from '@/i18n';
import { Language } from '@/types/api';
import { useTranslation } from 'react-i18next';
import { Building2, Home } from 'lucide-react';
import { filterLabels } from '../types';
import { FilterPills } from './FilterPills';
import { useFilterState } from '../hooks/useFilterState';
import { formatNumberByLang } from '@/utils/format';

export const UserStatsCard = () => {
  const { t } = useTranslation();

  const currentLang = (i18n.language as Language) || 'en';
  const { filter, setFilter } = useFilterState('weekly');
  const {
    data: userStatsData,
    isLoading: isUserStatsLoading,
    isFetching: isUserStatsFetching,
  } = useGetAdminUserStatsQuery({
    lang: currentLang,
    filter,
  });

  const isUserStatsLoadingState = isUserStatsLoading || isUserStatsFetching;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        {isUserStatsLoadingState && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0E7490]" />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-anevir text-lg text-slate-800">
              {t('User Stats')}
            </h2>
          </div>
          <FilterPills active={filter} onChange={setFilter} />
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0E7490]/10">
                <Home className="h-4 w-4 text-[#0E7490]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {t('Homeowners')}
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {userStatsData?.homeOwners
                    ?formatNumberByLang( userStatsData.homeOwners.toLocaleString(),currentLang)
                    :  formatNumberByLang('0',currentLang)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-slate-400">
                {t('Selected filter')}: {t(filterLabels[filter])}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0E7490]/10">
                <Building2 className="h-4 w-4 text-[#0E7490]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {t('HOA Leaders')}
                </p>
                <p className="text-lg font-semibold text-slate-800">
                  {userStatsData?.leaders
                    ?formatNumberByLang(userStatsData.leaders.toLocaleString(),currentLang)
                    : formatNumberByLang('0',currentLang)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs text-slate-400">
                {t('Selected filter')}: {t(filterLabels[filter])}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
