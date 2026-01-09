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
  useGetAdminLeadersQuery,
  useUpdateAdminUserBlockStatusMutation,
  useDeleteAdminUserMutation,
} from '@/store/api';
import type { AdminLeaderRow, Language } from '@/types/api';
import i18n from '@/i18n';

export default function AdminHoaLeadersPage() {
  const { t } = useTranslation();
  const currentLang = (i18n.language as Language) || 'en';

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading, isFetching, refetch } = useGetAdminLeadersQuery({
    lang: currentLang,
    page: currentPage,
    limit: itemsPerPage,
    search: searchValue || undefined,
  });

  const [updateUserBlockStatus, { isLoading: isUpdating }] =
    useUpdateAdminUserBlockStatusMutation();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteAdminUserMutation();

  const leaders = data?.data ?? [];
  const totalItems = data?.meta?.total ?? 0;

  const columns: AdminDataTableColumn<AdminLeaderRow>[] = useMemo(
    () => [
      {
        key: 'name',
        label: t('Name'),
        render: row => (
          <Link
            href={`/admin/hoa-leaders/${row.id}`}
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
      {
        key: 'communityId',
        label: t('Community ID'),
        render: row => <span>{row.communityId ?? '—'}</span>,
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

  const handleToggleBlockStatus = async (row: AdminLeaderRow) => {
    try {
      await updateUserBlockStatus({
        id: row.id,
        body: { isBlocked: !row.isBlocked },
        lang: currentLang,
      }).unwrap();
      toast.success(
        !row.isBlocked
          ? t('Leader blocked successfully')
          : t('Leader unblocked successfully')
      );
      refetch();
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || t('Something went wrong');
      toast.error(message);
    }
  };

  const handleDelete = async (row: AdminLeaderRow) => {
    try {
      await deleteUser({
        id: row.id,
        lang: currentLang,
      }).unwrap();
      toast.success(t('User deleted successfully'));
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
        title={t('HOA Leaders')}
        subtitle={t('Oversee community leadership activity and access')}
      >
        <AdminDataTable
          title={t('HOA Leaders')}
          description={t(
            'Manage leaders across communities and monitor activity.'
          )}
          searchPlaceholder={t('Search HOA leaders')}
          columns={columns}
          data={leaders}
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
          onDelete={handleDelete}
          isLoading={isLoading || isFetching || isUpdating || isDeleting}
        />
      </AdminPageLayout>
    </AdminRouteProtection>
  );
}
