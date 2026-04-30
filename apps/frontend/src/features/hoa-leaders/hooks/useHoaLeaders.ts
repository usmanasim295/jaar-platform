'use client';
import { useState } from 'react';
import i18n from '@/i18n';
import { toast } from 'react-toastify';
import {
  useGetAdminLeadersQuery,
  useUpdateAdminUserBlockStatusMutation,
  useDeleteAdminUserMutation,
} from '@/store/api';
import type { Language, AdminLeaderRow } from '@/types/api';
import { useTranslation } from 'react-i18next';

export const useHoaLeaders = () => {
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
  const handleSearch = (query: string) => {
    setCurrentPage(1);
    setSearchValue(query);
  };

  const handleItemsPerPageChange = (limit: number) => {
    setItemsPerPage(limit);
    setCurrentPage(1);
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

  return {
    t,
    currentLang,
    data: data?.data ?? [],
    totalItems: data?.meta?.total ?? 0,
    isLoading,
    isFetching,
    isUpdating,
    isDeleting,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    searchValue,
    handleSearch,
    handleItemsPerPageChange,
    handleToggleBlockStatus,
    handleDelete,
  };
};
