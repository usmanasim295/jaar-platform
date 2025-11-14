'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import { useGetAdminUserDetailQuery } from '@/store/api';
import type { Language } from '@/types/api';

const formatDate = (value?: string, lang: Language = 'en') => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString(lang, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return value;
  }
};

interface AdminUserDetailViewProps {
  titleKey: string;
}

export function AdminUserDetailView({ titleKey }: AdminUserDetailViewProps) {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';
  const userId = params?.id;

  const queryArgs = userId ? { id: userId, lang: currentLang } : skipToken;

  const { data, isLoading, isFetching } = useGetAdminUserDetailQuery(queryArgs);
  const detail = data?.data;

  const createdJobs = detail?.createdJobs ?? [];

  const summaryCards = useMemo(
    () => [
      {
        id: 'total-jobs',
        label: t('Total Jobs'),
        value: detail?.stats.totalJobs ?? 0,
      },
      {
        id: 'ongoing-jobs',
        label: t('Total Ongoing Jobs'),
        value: detail?.stats.totalOngoingJobs ?? 0,
      },
      {
        id: 'completed-jobs',
        label: t('Total Completed Jobs'),
        value: detail?.stats.totalCompletedJobs ?? 0,
      },
    ],
    [detail?.stats, t]
  );

  const isBusy = isLoading || isFetching;

  return (
    <AdminRouteProtection>
      <AdminPageLayout title={t(titleKey)} subtitle={t('Personal Information')}>
        {isBusy ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-gray-300 border-t-[#0E7490]" />
          </div>
        ) : !detail ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center text-slate-500 shadow-sm">
            {t('No records found')}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {summaryCards.map(card => (
                <div
                  key={card.id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 font-anevir text-3xl text-slate-800">
                    {card.value.toLocaleString(currentLang)}
                  </p>
                </div>
              ))}
            </div>

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="font-anevir text-lg text-slate-800">
                    {t('Personal Information')}
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('National ID')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {detail.nationalId || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Role')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {t(
                          detail.role === 'HOME_OWNER'
                            ? 'Homeowners'
                            : 'HOA Leaders'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Status')}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          detail.status === 'Blocked'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {t(detail.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Joined On')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(detail.createdAt, currentLang)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {t('Documents')}
                    </h3>
                    {detail.documents.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {t('No documents uploaded')}
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {detail.documents.map((url, index) => (
                          <li key={url}>
                            <Link
                              href={url}
                              target="_blank"
                              className="text-sm font-semibold text-[#0E7490] hover:underline"
                            >
                              {t('View Document')} #{index + 1}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {(detail.ownedHouses.length > 0 ||
                  detail.managedApartments.length > 0) && (
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="font-anevir text-lg text-slate-800">
                      {detail.role === 'HOME_OWNER'
                        ? t('Owned Properties')
                        : t('Managed Communities')}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {detail.role === 'HOME_OWNER'
                        ? detail.ownedHouses.map(property => (
                            <div
                              key={property.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('House Number')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {property.houseNumber || '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('Apartment')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {property.apartmentName || '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('City')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {property.city || '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('Community')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {property.community || '—'}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-3 text-xs text-slate-400">
                                {t('Joined On')}:{' '}
                                {formatDate(property.createdAt, currentLang)}
                              </p>
                            </div>
                          ))
                        : detail.managedApartments.map(community => (
                            <div
                              key={community.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('Community')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {community.name || '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('City')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {community.city || '—'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-wide text-slate-400">
                                    {t('Jobs Posted')}
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {community.jobsCount.toLocaleString(
                                      currentLang
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="font-anevir text-lg text-slate-800">
                    {t('Statistics')}
                  </h2>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>{t('Status')}</span>
                      <span>{t(detail.status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Role')}</span>
                      <span>
                        {t(
                          detail.role === 'HOME_OWNER'
                            ? 'Homeowners'
                            : 'HOA Leaders'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Joined On')}</span>
                      <span>{formatDate(detail.createdAt, currentLang)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="font-anevir text-lg text-slate-800">
                    {t('Jobs Created')}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {createdJobs.length.toLocaleString(currentLang)}
                  </span>
                </div>
                <div className="mt-4 space-y-4">
                  {createdJobs.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      {t('No jobs found')}
                    </p>
                  ) : (
                    createdJobs.map(job => (
                      <div
                        key={job.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-400">
                              {t('Job Title')}
                            </p>
                            <p className="font-semibold text-slate-800">
                              {job.title || '—'}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              job.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {t(job.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                          {job.description || t('No entries available')}
                        </p>
                        <p className="mt-2 text-xs text-slate-400">
                          {t('Created On')}:{' '}
                          {formatDate(job.createdAt, currentLang)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
