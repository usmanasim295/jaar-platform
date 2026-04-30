'use client';
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { Language } from '@/types/api';
import { useGetAdminServiceProviderStatsQuery } from '@/store/api';
import { FilterPills } from './FilterPills';
import { useFilterState } from '../hooks/useFilterState';

export const ServiceProviderChart = () => {
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';
  const { filter, setFilter } = useFilterState('weekly');

  const {
    data: serviceProviderStatsData,
    isLoading: isServiceProviderStatsLoading,
    isFetching: isServiceProviderStatsFetching,
  } = useGetAdminServiceProviderStatsQuery({
    lang: currentLang,
    filter,
  });
  const chartData = useMemo(() => {
    const stats = serviceProviderStatsData?.data ?? [];
    return stats.map(point => {
      const date = new Date(point.date);
      let label: string;

      if (filter === 'weekly') {
        label = date.toLocaleDateString(currentLang, { weekday: 'long' });
      } else if (filter === 'monthly') {
        label = date.toLocaleDateString(currentLang, {
          month: 'short',
          day: 'numeric',
        });
      } else {
        label = date.toLocaleDateString(currentLang, {
          month: 'short',
        });
      }

      return {
        label,
        count: point.count,
        date: point.date,
      };
    });
  }, [serviceProviderStatsData, filter, currentLang]);

  const ServiceProviderTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-lg">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {payload[0].value.toLocaleString(currentLang)}
          </p>
        </div>
      );
    }
    return null;
  };
  const isServiceProviderStatsLoadingState =
    isServiceProviderStatsLoading || isServiceProviderStatsFetching;

  return (
    <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      {isServiceProviderStatsLoadingState && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0E7490]" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-anevir text-lg text-slate-800">
            {t('Service Provider Stats')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('New Service Providers')}:{' '}
            <span className="font-semibold text-slate-800">
              {serviceProviderStatsData?.total
                ? serviceProviderStatsData.total.toLocaleString(currentLang)
                : '0'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <FilterPills active={filter} onChange={setFilter} />
        </div>
      </div>

      <div className="mt-6">
        <div className="rounded-2xl border border-slate-100 bg-white">
          <div className="h-[280px] w-full">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                {t('No data available')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  barSize={32}
                  barGap={12}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="serviceProviderGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#38D0C6" />
                      <stop offset="100%" stopColor="#0E7490" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E2E8F0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <RechartsTooltip content={<ServiceProviderTooltip />} />
                  <Bar
                    dataKey="count"
                    radius={[12, 12, 12, 12]}
                    fill="url(#serviceProviderGradient)"
                    animationDuration={700}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
