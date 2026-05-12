'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import {
  AdminDataTable,
  AdminDataTableColumn,
} from '@/components/admin/AdminDataTable';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import {
  useGetAdminServiceProvidersQuery,
  useGetAdminUnverifiedServiceProvidersQuery,
  useUpdateAdminServiceProviderBlockStatusMutation,
  useUpdateAdminServiceProviderVerificationStatusMutation,
} from '@/store/api';
import type { AdminServiceProviderRow, Language } from '@/types/api';
import i18n from '@/i18n';
import { formatDateByLang } from '@/utils/format';

type TabType = 'all' | 'pending';

export default function AdminServiceProvidersPage() {
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading, isFetching, refetch } =
    useGetAdminServiceProvidersQuery(
      {
        lang: currentLang,
        page: currentPage,
        limit: itemsPerPage,
        search: searchValue || undefined,
      },
      { skip: activeTab === 'pending' }
    );

  const {
    data: pendingData,
    isLoading: isPendingLoading,
    isFetching: isPendingFetching,
    refetch: refetchPending,
  } = useGetAdminUnverifiedServiceProvidersQuery(
    {
      lang: currentLang,
      page: currentPage,
      limit: itemsPerPage,
      search: searchValue || undefined,
    },
    { skip: activeTab === 'all' }
  );

  const [updateServiceProviderBlockStatus, { isLoading: isUpdatingBlock }] =
    useUpdateAdminServiceProviderBlockStatusMutation();
  const [
    updateServiceProviderVerificationStatus,
    { isLoading: isUpdatingVerify },
  ] = useUpdateAdminServiceProviderVerificationStatusMutation();

  const providers =
    activeTab === 'all' ? (data?.data ?? []) : (pendingData?.data ?? []);
  const totalItems =
    activeTab === 'all'
      ? (data?.meta.total ?? 0)
      : (pendingData?.meta.total ?? 0);
  const isLoadingData = activeTab === 'all' ? isLoading : isPendingLoading;
  const isFetchingData = activeTab === 'all' ? isFetching : isPendingFetching;

  const columns: AdminDataTableColumn<AdminServiceProviderRow>[] =
    useMemo(() => {
      const baseColumns: AdminDataTableColumn<AdminServiceProviderRow>[] = [
        {
          key: 'name',
          label: t('Name'),
          render: row => (
            <Link
              href={`/admin/service-providers/${row.id}`}
              className="font-semibold text-[#0E7490] hover:underline"
            >
              {row.name}
            </Link>
          ),
        },
        {
          key: 'createdDate',
          label: t('Created Date'),
          render: row =>
            row.createdDate
              ? formatDateByLang(row.createdDate, currentLang)
              : '—',
        },
      ];

      if (activeTab === 'all') {
        baseColumns.push(
          {
            key: 'rating',
            label: t('Rating'),
            render: row => <span>{Number(row.rating ?? 0).toFixed(1)}</span>,
          },
          {
            key: 'totalEarnings',
            label: t('Total Earnings'),
            render: row => (
              <span>
                SAR {Number(row.totalEarnings ?? 0).toLocaleString(currentLang)}
              </span>
            ),
          },
          {
            key: 'completedJobs',
            label: t('Completed Jobs'),
            render: row => (
              <span>
                {Number(row.completedJobs ?? 0).toLocaleString(currentLang)}
              </span>
            ),
          },
          { key: 'status', label: t('Status') },
          {
            key: 'isVerified',
            label: t('Verified'),
            render: row => (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                  row.isVerified
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}
              >
                {row.isVerified ? t('Verified') : t('Unverified')}
              </span>
            ),
          }
        );
      } else {
        baseColumns.push(
          {
            key: 'email',
            label: t('Email'),
          },
          {
            key: 'isVerified',
            label: t('Verification Status'),
            render: row => (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                  row.isVerified
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}
              >
                {row.isVerified ? t('Verified') : t('Unverified')}
              </span>
            ),
          }
        );
      }

      return baseColumns;
    }, [t, currentLang, activeTab]);

  const handleSearch = (query: string) => {
    setCurrentPage(1);
    setSearchValue(query);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchValue('');
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleToggleBlockStatus = async (row: AdminServiceProviderRow) => {
    try {
      await updateServiceProviderBlockStatus({
        id: row.id,
        body: { isBlocked: !row.isBlocked },
        lang: currentLang,
      }).unwrap();
      toast.success(
        !row.isBlocked
          ? t('Service provider blocked successfully')
          : t('Service provider unblocked successfully')
      );
      if (activeTab === 'all') {
        refetch();
      } else {
        refetchPending();
      }
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || t('Something went wrong');
      toast.error(message);
    }
  };

  const handleToggleVerificationStatus = async (
    row: AdminServiceProviderRow
  ) => {
    try {
      await updateServiceProviderVerificationStatus({
        id: row.id,
        body: { isVerified: !row.isVerified },
        lang: currentLang,
      }).unwrap();
      toast.success(
        !row.isVerified
          ? t('Service provider verified successfully')
          : t('Service provider unverified successfully')
      );
      if (activeTab === 'all') {
        refetch();
      } else {
        refetchPending();
      }
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || t('Something went wrong');
      toast.error(message);
    }
  };

  return (
    <AdminRouteProtection>
      <AdminPageLayout
        title={t('Service Providers')}
        subtitle={t('Monitor service provider performance and compliance')}
      >
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'all'
                ? 'border-b-2 border-[#0E7490] text-[#0E7490]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('All')}
          </button>
          <button
            onClick={() => handleTabChange('pending')}
            className={`px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'pending'
                ? 'border-b-2 border-[#0E7490] text-[#0E7490]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t('Pending Requests')}
          </button>
        </div>
        <AdminDataTable
          title={
            activeTab === 'all'
              ? t('Service Providers')
              : t('Pending Verification Requests')
          }
          description={
            activeTab === 'all'
              ? t('Track performance, onboarding status, and compliance.')
              : t('Service providers awaiting admin verification')
          }
          searchPlaceholder={t('Search service providers')}
          columns={columns}
          data={providers}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onSearch={handleSearch}
          searchTerm={searchValue}
          statusActiveValue={t('Active')}
          statusBlockedValue={t('Blocked')}
          onToggleBlockStatus={
            activeTab === 'all' ? handleToggleBlockStatus : undefined
          }
          onToggleVerificationStatus={handleToggleVerificationStatus}
          isLoading={
            isLoadingData ||
            isFetchingData ||
            isUpdatingBlock ||
            isUpdatingVerify
          }
        />
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
