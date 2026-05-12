'use client';
import i18n from '@/i18n';
import { useGetAdminSummaryQuery } from '@/store/api';
import { Building2, UserCircle2, Users } from 'lucide-react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '@/types/api';
import { SummaryCard } from '../types';
import { formatNumberByLang } from '@/utils/format';

export const SummaryCards = () => {
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
  } = useGetAdminSummaryQuery(currentLang);
  // Separate loading states for each section
  const isSummaryLoadingState = isSummaryLoading || isSummaryFetching;
  const summaryCardsContent: SummaryCard[] = useMemo(
    () => [
      {
        id: 'homeowners',
        label: 'Homeowners',
        value: summaryData?.totals?.homeOwners
          ? formatNumberByLang(summaryData?.totals?.homeOwners?.toLocaleString(),currentLang)
          : '0',
        icon: <Users className="h-6 w-6 text-[#0E7490]" />,
      },
      {
        id: 'hoa-leaders',
        label: 'HOA Leaders',
        value: summaryData?.totals?.leaders
          ?  formatNumberByLang(summaryData?.totals?.leaders?.toLocaleString(),currentLang)
          : '0',
        icon: <Building2 className="h-6 w-6 text-[#0E7490]" />,
      },
      {
        id: 'service-providers',
        label: 'Service Providers',
        value: summaryData?.totals?.serviceProviders
          ?  formatNumberByLang(summaryData?.totals?.serviceProviders?.toLocaleString(),currentLang)
          : '0',
        icon: <UserCircle2 className="h-6 w-6 text-[#0E7490]" />,
      },
    ],
    [summaryData]
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaryCardsContent.map((card: any) => (
        <div
          key={card.id}
          className="relative flex items-center justify-between gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          {isSummaryLoadingState && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0E7490]" />
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E7490]/10 text-[#0E7490]">
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500">{t(card.label)}</p>
              <p className="font-anevir text-3xl text-slate-800">
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
