'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { Language } from '@/types/api';
import { useGetAdminTopServiceProvidersQuery } from '@/store/api';
import { getStatusTone } from '../utils/statusTone';
import { formatDateByLang } from '@/utils/format';

export const TopProvidersTable = () => {
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';

  const {
    data: topProvidersData,
    isLoading: isTopProvidersLoading,
    isFetching: isTopProvidersFetching,
  } = useGetAdminTopServiceProvidersQuery(currentLang);
  const isloading = isTopProvidersLoading || isTopProvidersFetching;

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      {isloading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0E7490]" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-anevir text-lg text-slate-800">
            {t('Service Provider Overview')}
          </h2>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-400">
            <tr
              className={`${currentLang === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <th className="px-4 py-3 font-semibold">
                {t('Service Provider')}
              </th>
              <th className="px-4 py-3 font-semibold">{t('Created Date')}</th>
              <th className="px-4 py-3 font-semibold">{t('Rating')}</th>
              <th className="px-4 py-3 font-semibold">{t('Total Earnings')}</th>
              <th className="px-4 py-3 font-semibold">{t('Completed Jobs')}</th>
              <th className="px-4 py-3 font-semibold">{t('Status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {topProvidersData?.providers?.length ? (
              topProvidersData.providers.map(row => (
                <tr key={row.id} className="text-slate-600">
                  <td className="px-4 py-4 font-semibold text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-4 py-4">
                    {row.createdDate
                      ? formatDateByLang(row.createdDate, currentLang)
                      : '-'}
                  </td>
                  <td className="px-4 py-4">
                    {Number(row.rating || 0).toFixed(1)}
                  </td>
                  <td className="px-4 py-4">
                    SAR {Number(row.totalEarnings || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    {Number(row.completedJobs || 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(row.status)}`}
                    >
                      {t(row.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-sm text-slate-500"
                >
                  {t('No data available')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>{' '}
    </div>
  );
};
