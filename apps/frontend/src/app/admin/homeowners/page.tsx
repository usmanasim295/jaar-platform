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
  useGetAdminHomeownersQuery,
  useUpdateAdminUserBlockStatusMutation,
} from '@/store/api';
import type { AdminHomeownerRow, Language } from '@/types/api';
import i18n from '@/i18n';

export default function AdminHomeownersPage() {
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading, isFetching, refetch } = useGetAdminHomeownersQuery({
    lang: currentLang,
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue || undefined,
  });

  const [updateUserBlockStatus, { isLoading: isUpdating }] =
    useUpdateAdminUserBlockStatusMutation();

  const homeowners = data?.data ?? [];
  const totalItems = data?.meta.total ?? 0;

  const columns: AdminDataTableColumn<AdminHomeownerRow>[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('Name'),
        render: row => (
          <Link
            href={`/admin/homeowners/${row.id}`}
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
            ? new Date(row.createdDate).toLocaleDateString(currentLang)
            : '—',
      },
      {
        key: 'apartments',
        label: t('Number of Apartments'),
        render: row => <span>{row.apartments ?? 0}</span>,
      },
      { key: 'status', label: t('Status') },
    ],
    [t, currentLang]
  );

  const handleSearch = (query: string) => {
    setCurrentPage(1);
    setSearchValue(query);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
  };

  const handleToggleBlockStatus = async (row: AdminHomeownerRow) => {
    try {
      await updateUserBlockStatus({
        id: row.id,
        body: { isBlocked: !row.isBlocked },
        lang: currentLang,
      }).unwrap();
      toast.success(
        !row.isBlocked
          ? t('Homeowner blocked successfully')
          : t('Homeowner unblocked successfully')
      );
      refetch();
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || t('Something went wrong');
      toast.error(message);
    }
  };

  return (
    <AdminRouteProtection>
      <AdminPageLayout
        title={t('Homeowners')}
        subtitle={t('Manage registered homeowners across communities')}
      >
        <AdminDataTable
          title={t('Homeowners')}
          description={t(
            'Overview of all homeowners registered on the platform.'
          )}
          searchPlaceholder={t('Search homeowners')}
          columns={columns}
          data={homeowners}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          onSearch={handleSearch}
          searchTerm={searchValue}
          statusActiveValue={t('Active')}
          statusBlockedValue={t('Blocked')}
          onToggleBlockStatus={handleToggleBlockStatus}
          isLoading={isLoading || isFetching || isUpdating}
        />
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
