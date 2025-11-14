'use client';

import { useMemo, useState } from 'react';
import { Building2, Home, Users, UserCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import {
  useGetAdminSummaryQuery,
  useGetAdminTopServiceProvidersQuery,
  useGetAdminUserStatsQuery,
  useGetAdminServiceProviderStatsQuery,
} from '@/store/api';
import type { Language } from '@/types/api';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
} from 'recharts';

type SummaryCard = {
  id: string;
  label: string;
  value: string;
  icon: React.ReactNode;
};

type ServiceProviderRow = {
  id: string;
  name: string;
  createdDate?: string;
  rating: number;
  totalEarnings: number;
  completedJobs: number;
  status: string;
  isBlocked: boolean;
};

const FILTER_PRESETS = ['weekly', 'monthly', 'yearly'] as const;
type FilterPreset = (typeof FILTER_PRESETS)[number];

const filterLabels: Record<FilterPreset, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

const getStatusTone = (status: string) => {
  if (status.toLowerCase() === 'active') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (status.toLowerCase() === 'blocked') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const [serviceProviderFilter, setServiceProviderFilter] =
    useState<FilterPreset>('weekly');
  const [userStatsFilter, setUserStatsFilter] =
    useState<FilterPreset>('weekly');
  const currentLang = (i18n.language as Language) || 'en';

  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
  } = useGetAdminSummaryQuery(currentLang);

  const {
    data: userStatsData,
    isLoading: isUserStatsLoading,
    isFetching: isUserStatsFetching,
  } = useGetAdminUserStatsQuery({
    lang: currentLang,
    filter: userStatsFilter,
  });

  const {
    data: topProvidersData,
    isLoading: isTopProvidersLoading,
    isFetching: isTopProvidersFetching,
  } = useGetAdminTopServiceProvidersQuery(currentLang);

  const {
    data: serviceProviderStatsData,
    isLoading: isServiceProviderStatsLoading,
    isFetching: isServiceProviderStatsFetching,
  } = useGetAdminServiceProviderStatsQuery({
    lang: currentLang,
    filter: serviceProviderFilter,
  });

  const summaryCardsContent: SummaryCard[] = useMemo(
    () => [
      {
        id: 'homeowners',
        label: 'Homeowners',
        value: summaryData?.totals?.homeOwners
          ? summaryData.totals.homeOwners.toLocaleString()
          : '0',
        icon: <Users className="h-6 w-6 text-[#0E7490]" />,
      },
      {
        id: 'hoa-leaders',
        label: 'HOA Leaders',
        value: summaryData?.totals?.leaders
          ? summaryData.totals.leaders.toLocaleString()
          : '0',
        icon: <Building2 className="h-6 w-6 text-[#0E7490]" />,
      },
      {
        id: 'service-providers',
        label: 'Service Providers',
        value: summaryData?.totals?.serviceProviders
          ? summaryData.totals.serviceProviders.toLocaleString()
          : '0',
        icon: <UserCircle2 className="h-6 w-6 text-[#0E7490]" />,
      },
    ],
    [summaryData]
  );

  const chartData = useMemo(() => {
    const stats = serviceProviderStatsData?.data ?? [];
    return stats.map(point => {
      const date = new Date(point.date);
      let label: string;

      if (serviceProviderFilter === 'weekly') {
        label = date.toLocaleDateString(currentLang, { weekday: 'long' });
      } else if (serviceProviderFilter === 'monthly') {
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
  }, [serviceProviderStatsData, serviceProviderFilter, currentLang]);

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

  // Separate loading states for each section
  const isSummaryLoadingState = isSummaryLoading || isSummaryFetching;
  const isServiceProviderStatsLoadingState =
    isServiceProviderStatsLoading || isServiceProviderStatsFetching;
  const isUserStatsLoadingState = isUserStatsLoading || isUserStatsFetching;
  const isTopProvidersLoadingState =
    isTopProvidersLoading || isTopProvidersFetching;

  const renderFilterPills = (
    activeFilter: FilterPreset,
    onSelect: (filter: FilterPreset) => void
  ) => (
    <div className="flex flex-wrap items-center gap-2">
      {FILTER_PRESETS.map(filter => (
        <button
          key={filter}
          onClick={() => onSelect(filter)}
          className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
            activeFilter === filter
              ? 'border-[#0E7490] bg-[#0E7490] text-white'
              : 'border-slate-200 text-slate-500 hover:border-[#0E7490]/60 hover:text-[#0E7490]'
          }`}
        >
          {t(filterLabels[filter])}
        </button>
      ))}
    </div>
  );

  return (
    <AdminRouteProtection>
      <AdminPageLayout
        title={t('Dashboard')}
        subtitle={t(
          'Monitor activity across homeowners, leaders, and providers'
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCardsContent.map(card => (
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

        <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
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
                      ? serviceProviderStatsData.total.toLocaleString(
                          currentLang
                        )
                      : '0'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {renderFilterPills(
                  serviceProviderFilter,
                  setServiceProviderFilter
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-3 sm:p-6">
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
                {renderFilterPills(userStatsFilter, setUserStatsFilter)}
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
                          ? userStatsData.homeOwners.toLocaleString()
                          : '0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs text-slate-400">
                      {t('Selected filter')}: {t(filterLabels[userStatsFilter])}
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
                          ? userStatsData.leaders.toLocaleString()
                          : '0'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs text-slate-400">
                      {t('Selected filter')}: {t(filterLabels[userStatsFilter])}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          {isTopProvidersLoadingState && (
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
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {t('Service Provider')}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t('Created Date')}
                  </th>
                  <th className="px-4 py-3 font-semibold">{t('Rating')}</th>
                  <th className="px-4 py-3 font-semibold">
                    {t('Total Earnings')}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t('Completed Jobs')}
                  </th>
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
                          ? new Date(row.createdDate).toLocaleDateString()
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
          </div>
        </div>
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
