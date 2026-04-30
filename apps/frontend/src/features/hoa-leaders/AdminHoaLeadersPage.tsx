'use client';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { AdminRouteProtection } from '@/components/admin/AdminRouteProtection';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { useHoaLeaders } from './hooks/useHoaLeaders';
import { useLeaderColumns } from './components/Columns';

export default function AdminHoaLeadersPage() {
  const {
    t,
    currentLang,
    data,
    totalItems,
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
  } = useHoaLeaders();
  const columns = useLeaderColumns(t, currentLang);

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
          data={data}
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
