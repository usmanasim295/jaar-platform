'use client';
import { AdminDataTableColumn } from '@/components/admin/AdminDataTable';
import { AdminLeaderRow } from '@/types/api';
import { formatDateByLang, formatNumberByLang } from '@/utils/format';
import Link from 'next/link';
import { useMemo } from 'react';

export const useLeaderColumns = (t: any, currentLang: string) => {
  return useMemo<AdminDataTableColumn<AdminLeaderRow>[]>(
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
            ? formatDateByLang(row.createdDate, currentLang)
            : '—',
      },
      {
        key: 'apartments',
        label: t('Number of Apartments'),
        render: row => <span>{formatNumberByLang(row.apartments ?? 0,currentLang)}</span>,
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
};
