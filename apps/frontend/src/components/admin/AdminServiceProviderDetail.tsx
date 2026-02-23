'use client';

import { skipToken } from '@reduxjs/toolkit/query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import { useGetAdminServiceProviderDetailQuery } from '@/store/api';
import type { Language } from '@/types/api';
import { formatPhoneForDisplay } from '@/utils/format';

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

const formatNumber = (value: number, lang: Language) =>
  Number.isFinite(value) ? value.toLocaleString(lang) : '0';

const formatCurrency = (value: number, lang: Language) =>
  `SAR ${Number.isFinite(value) ? value.toLocaleString(lang) : '0'}`;

export function AdminServiceProviderDetailView() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';
  const providerId = params?.id;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const queryArgs = providerId
    ? { id: providerId, lang: currentLang }
    : skipToken;

  const { data, isLoading, isFetching } =
    useGetAdminServiceProviderDetailQuery(queryArgs);

  const detail = data?.data;
  const isBusy = isLoading || isFetching;

  const summaryCards = useMemo(
    () => [
      {
        id: 'total-jobs',
        label: t('Total Jobs'),
        value: detail?.stats.totalJobs ?? 0,
      },
      {
        id: 'completed-jobs',
        label: t('Jobs Completed'),
        value: detail?.stats.completedJobs ?? 0,
      },
      {
        id: 'pending-jobs',
        label: t('Pending Jobs'),
        value: detail?.stats.pendingJobs ?? 0,
      },
      {
        id: 'rating',
        label: t('Rating'),
        value: detail?.rating ?? 0,
      },
    ],
    [detail?.rating, detail?.stats, t]
  );

  return (
    <AdminRouteProtection>
      <AdminPageLayout
        title={t('Service Provider Details')}
        subtitle={detail?.name || ''}
      >
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map(card => (
                <div
                  key={card.id}
                  className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 font-anevir text-3xl text-slate-800">
                    {card.id === 'rating'
                      ? Number(card.value).toFixed(1)
                      : formatNumber(card.value, currentLang)}
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
                  {detail.documents.profilePicture && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => setIsImageModalOpen(true)}
                        className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-slate-100 transition-transform hover:scale-105 cursor-pointer"
                      >
                        <Image
                          src={detail.documents.profilePicture}
                          alt={detail.name || t('Profile Picture')}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    </div>
                  )}
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Full Name')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {detail.name || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Email')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {detail.email || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Phone Number')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        <span dir="ltr">
                          {formatPhoneForDisplay(detail.phoneNumber)}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Joined On')}
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(detail.createdAt, currentLang)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {t('Verified')}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          detail.isVerified
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {detail.isVerified ? t('Verified') : t('Unverified')}
                      </span>
                    </div>
                  </div>

                  {detail.bio && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-slate-700">
                        {t('Bio')}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        {detail.bio}
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700">
                      {t('Documents')}
                    </h3>
                    {detail.documents.government || detail.documents.bank ? (
                      <ul className="mt-3 space-y-2 text-sm text-[#0E7490]">
                        {detail.documents.government && (
                          <li>
                            <Link
                              href={detail.documents.government}
                              target="_blank"
                              className="hover:underline"
                            >
                              {t('View Document')} · {t('Government Document')}
                            </Link>
                          </li>
                        )}
                        {detail.documents.bank && (
                          <li>
                            <Link
                              href={detail.documents.bank}
                              target="_blank"
                              className="hover:underline"
                            >
                              {t('View Document')} · {t('Bank Document')}
                            </Link>
                          </li>
                        )}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">
                        {t('No documents uploaded')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="font-anevir text-lg text-slate-800">
                      {t('Services Offered')}
                    </h2>
                    {detail.services.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {t('No entries available')}
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        {detail.services.map(service => (
                          <li key={service.id}>{service.name || '—'}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                    <h2 className="font-anevir text-lg text-slate-800">
                      {t('Service Rates')}
                    </h2>
                    {detail.serviceRates.length === 0 ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {t('No entries available')}
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-3 text-sm text-slate-600">
                        {detail.serviceRates.map(rate => (
                          <li
                            key={rate.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <span>{rate.name || '—'}</span>
                            <span className="font-semibold text-slate-800">
                              {rate.rate}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <h2 className="font-anevir text-lg text-slate-800">
                    {t('Locations Served')}
                  </h2>
                  {detail.locations.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">
                      {t('No entries available')}
                    </p>
                  ) : (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {detail.locations.map(location => (
                        <div
                          key={location.id}
                          className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                        >
                          <p className="font-semibold text-slate-800">
                            {location.city},{' '}
                            {location.state ? `${location.state}, ` : ''}
                            {location.country}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                            {location.isActive ? t('Active') : t('Inactive')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                      <span>{t('Verified')}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                          detail.isVerified
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {detail.isVerified ? t('Verified') : t('Unverified')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Created On')}</span>
                      <span>{formatDate(detail.createdAt, currentLang)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('Total Earnings')}</span>
                      <span>
                        {formatCurrency(detail.totalEarnings, currentLang)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-anevir text-lg text-slate-800">
                  {t('Recent Completions')}
                </h2>
                <span className="text-sm text-slate-500">
                  {detail.recentCompletions.length.toLocaleString(currentLang)}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {detail.recentCompletions.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    {t('No entries available')}
                  </p>
                ) : (
                  detail.recentCompletions.map(item => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-400">
                            {t('Job Title')}
                          </p>
                          <p className="font-semibold text-slate-800">
                            {item.job?.title || '—'}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {t(item.status)}
                        </span>
                      </div>
                      {item.job?.description && (
                        <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                          {item.job.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {t('Submitted At')}:{' '}
                        {formatDate(item.submittedAt, currentLang)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Image Modal */}
        {isImageModalOpen && detail?.documents.profilePicture && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute -right-2 -top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 transition-colors hover:bg-white hover:text-slate-900 shadow-lg"
                aria-label={t('Close')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={e => e.stopPropagation()}
              >
                <img
                  src={detail.documents.profilePicture}
                  alt={detail.name || t('Profile Picture')}
                  className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
