'use client';

import { ReactNode, useEffect, useMemo, useState, useRef } from 'react';
import { MoreVertical, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

type AdminDataRow = {
  id: string | number;
  name: string;
  status: string;
  isBlocked?: boolean;
  isVerified?: boolean;
};

export type AdminDataTableColumn<T extends AdminDataRow> = {
  key: keyof T;
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
};

type AdminDataTableProps<T extends AdminDataRow> = {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  columns: AdminDataTableColumn<T>[];
  data: T[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (limit: number) => void;
  onSearch: (query: string) => void;
  searchTerm: string;
  onToggleBlockStatus?: (row: T) => void;
  onToggleVerificationStatus?: (row: T) => void;
  onDelete?: (row: T) => void;
  statusActiveValue?: string;
  statusBlockedValue?: string;
  itemsPerPageOptions?: number[];
  isLoading?: boolean;
};

const DEFAULT_ITEMS_PER_PAGE = [10, 20, 30, 40, 50];

export function AdminDataTable<T extends AdminDataRow>({
  title,
  description,
  searchPlaceholder,
  columns,
  data,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onSearch,
  searchTerm,
  onToggleBlockStatus,
  onToggleVerificationStatus,
  onDelete,
  statusActiveValue = 'Active',
  statusBlockedValue = 'Blocked',
  itemsPerPageOptions = DEFAULT_ITEMS_PER_PAGE,
  isLoading = false,
}: AdminDataTableProps<T>) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState(searchTerm);
  const [openRowId, setOpenRowId] = useState<string | number | null>(null);
  const [isRTL, setIsRTL] = useState(i18n.language === 'ar');
  const [deleteConfirmRow, setDeleteConfirmRow] = useState<T | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    right?: number;
    left?: number;
  } | null>(null);
  const buttonRefs = useRef<Map<string | number, HTMLButtonElement>>(new Map());

  useEffect(() => {
    setIsRTL(i18n.language === 'ar');
    const handleLanguageChange = () => {
      setIsRTL(i18n.language === 'ar');
    };
    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (searchValue === '' && searchTerm !== '') {
      onSearch('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Handle click outside, scroll, and resize to close dropdown
  useEffect(() => {
    if (openRowId === null) {
      setDropdownPosition(null);
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = buttonRefs.current.get(openRowId);
      if (
        button &&
        !button.contains(target) &&
        !target.closest('.dropdown-menu')
      ) {
        setOpenRowId(null);
        setDropdownPosition(null);
      }
    };

    const handleScroll = () => {
      setOpenRowId(null);
      setDropdownPosition(null);
    };

    const handleResize = () => {
      setOpenRowId(null);
      setDropdownPosition(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [openRowId]);

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage || 1));
  const startNumber =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endNumber =
    totalItems === 0 ? 0 : Math.min(currentPage * itemsPerPage, totalItems);

  const getStatusTone = (status: string) => {
    // Compare against original English values from API
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (statusLower === 'blocked') {
      return 'bg-rose-100 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch(searchValue.trim());
    setOpenRowId(null);
    setDropdownPosition(null);
  };

  const handleItemsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onItemsPerPageChange(Number(event.target.value));
    setOpenRowId(null);
    setDropdownPosition(null);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
    setOpenRowId(null);
    setDropdownPosition(null);
  };

  const pageNumbers = useMemo(() => {
    const maxButtons = 4;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, currentPage - half);
    let end = start + maxButtons - 1;

    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }

    return Array.from({ length: maxButtons }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  return (
    <div
      className="relative rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0E7490]" />
        </div>
      )}

      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full">
          <h2 className="text-xl font-anevir text-slate-800 w-full">{title}</h2>
        </div>

        <form
          onSubmit={handleSearchSubmit}
          className={`flex w-full flex-col gap-3 sm:flex-row  ${
            isRTL ? 'sm:justify-end' : 'sm:justify-end'
          }`}
        >
          <div className="relative w-full sm:max-w-xs">
            <Search
              className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${
                isRTL ? 'right-3' : 'left-3'
              }`}
            />
            <input
              type="text"
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              placeholder={searchPlaceholder ?? t('Search...')}
              className={`w-full rounded-xl border border-slate-200 bg-white py-2 text-sm text-slate-600 outline-none transition focus:border-[#0E7490] focus:ring-2 focus:ring-[#0E7490]/10 ${
                isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
        </form>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map(column => {
                const defaultAlign = isRTL ? 'right' : 'left';
                const align = column.align || defaultAlign;

                return (
                  <th
                    key={String(column.key)}
                    className={`px-4 py-3 font-semibold min-w-[150px] ${
                      column.className ?? ''
                    } ${
                      align === 'right'
                        ? 'text-right'
                        : align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    }`}
                  >
                    {column.label}
                  </th>
                );
              })}
              {(onToggleBlockStatus ||
                onToggleVerificationStatus ||
                onDelete) && (
                <th
                  className={`px-4 py-3 font-semibold text-slate-500 ${
                    isRTL ? 'text-left' : 'text-right'
                  }`}
                >
                  {t('Actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length ? (
              data.map(row => (
                <tr
                  key={row.id}
                  className="text-slate-600 transition hover:bg-[#F8FAFC]"
                >
                  {columns.map(column => {
                    const defaultAlign = isRTL ? 'right' : 'left';
                    const align = column.align || defaultAlign;
                    return (
                      <td
                        key={String(column.key)}
                        className={`px-4 py-4 ${column.className ?? ''} ${
                          align === 'right'
                            ? 'text-right'
                            : align === 'center'
                              ? 'text-center'
                              : 'text-left'
                        }`}
                      >
                        {column.render ? (
                          column.render(row)
                        ) : column.key === 'status' ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(
                              String(row[column.key] ?? '')
                            )}`}
                          >
                            {t(String(row[column.key] ?? ''))}
                          </span>
                        ) : (
                          <span>{String(row[column.key] ?? '—')}</span>
                        )}
                      </td>
                    );
                  })}
                  {(onToggleBlockStatus ||
                    onToggleVerificationStatus ||
                    onDelete) && (
                    <td
                      className={`relative px-4 py-4 ${
                        isRTL ? 'text-left' : 'text-right'
                      }`}
                    >
                      <button
                        ref={el => {
                          if (el) {
                            buttonRefs.current.set(row.id, el);
                          } else {
                            buttonRefs.current.delete(row.id);
                          }
                        }}
                        type="button"
                        onClick={e => {
                          const button = e.currentTarget;
                          const rect = button.getBoundingClientRect();

                          if (openRowId === row.id) {
                            setOpenRowId(null);
                            setDropdownPosition(null);
                          } else {
                            setOpenRowId(row.id);
                            if (isRTL) {
                              setDropdownPosition({
                                top: rect.bottom + window.scrollY + 8,
                                left: rect.left + window.scrollX - 4,
                              });
                            } else {
                              setDropdownPosition({
                                top: rect.bottom + window.scrollY + 8,
                                right:
                                  window.innerWidth -
                                  rect.right -
                                  window.scrollX -
                                  4,
                              });
                            }
                          }
                        }}
                        className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20"
                        aria-label={t('Actions')}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openRowId === row.id && dropdownPosition && (
                        <div
                          className="dropdown-menu fixed z-[9999] w-36 overflow-hidden rounded-xl border border-slate-200 bg-white text-sm shadow-lg"
                          style={{
                            top: `${dropdownPosition.top}px`,
                            ...(isRTL
                              ? { left: `${dropdownPosition.left}px` }
                              : { right: `${dropdownPosition.right}px` }),
                          }}
                        >
                          {onToggleVerificationStatus &&
                            'isVerified' in row && (
                              <button
                                type="button"
                                className={`flex w-full items-center px-4 py-2 text-slate-600 transition hover:bg-slate-100 ${
                                  isRTL
                                    ? 'justify-end text-right'
                                    : 'justify-start text-left'
                                }`}
                                onClick={() => {
                                  setOpenRowId(null);
                                  setDropdownPosition(null);
                                  onToggleVerificationStatus(row);
                                }}
                              >
                                {row.isVerified ? t('Unverify') : t('Verify')}
                              </button>
                            )}
                          {onToggleBlockStatus && (
                            <button
                              type="button"
                              className={`flex w-full items-center px-4 py-2 text-slate-600 transition hover:bg-slate-100 ${
                                isRTL
                                  ? 'justify-end text-right'
                                  : 'justify-start text-left'
                              }`}
                              onClick={() => {
                                setOpenRowId(null);
                                setDropdownPosition(null);
                                onToggleBlockStatus(row);
                              }}
                            >
                              {String(row.status).toLowerCase() === 'active'
                                ? t('Block')
                                : t('Unblock')}
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              className={`flex w-full items-center px-4 py-2 text-red-600 transition hover:bg-red-50 ${
                                isRTL
                                  ? 'justify-end text-right'
                                  : 'justify-start text-left'
                              }`}
                              onClick={() => {
                                setOpenRowId(null);
                                setDropdownPosition(null);
                                setDeleteConfirmRow(row);
                              }}
                            >
                              {t('Delete')}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (onToggleBlockStatus ||
                    onToggleVerificationStatus ||
                    onDelete
                      ? 1
                      : 0)
                  }
                  className="px-4 py-6 text-center text-sm text-slate-400"
                >
                  {t('No records found')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className={`mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4 md:flex-row md:items-center ${
          isRTL ? 'md:justify-between' : 'md:justify-between'
        }`}
      >
        <div
          className={`flex items-center gap-2 text-sm text-slate-500 ${
            isRTL ? 'flex-row-reverse' : ''
          }`}
        >
          <label
            htmlFor={`${title}-items-per-page`}
            className="font-semibold text-slate-600"
          >
            {t('Items per page')}
          </label>
          <select
            id={`${title}-items-per-page`}
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600 focus:border-[#0E7490] focus:outline-none focus:ring-2 focus:ring-[#0E7490]/10"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 ${
            isRTL ? 'sm:justify-start' : 'sm:justify-end'
          }`}
        >
          <div
            className={`flex items-center justify-center gap-1 text-sm text-slate-600 ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map(page => (
              <button
                type="button"
                key={page}
                onClick={() => handlePageChange(page)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  currentPage === page
                    ? 'bg-[#0E7490] text-white shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <p
            className={`text-center text-xs text-slate-400 ${
              isRTL ? 'sm:text-left' : 'sm:text-right'
            }`}
          >
            {t('Showing {{start}} to {{end}} of {{total}}', {
              start: startNumber,
              end: endNumber,
              total: totalItems,
            })}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirmRow(null)}
        >
          <div
            className={`w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg ${
              isRTL ? 'text-right' : 'text-left'
            }`}
            onClick={e => e.stopPropagation()}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              {t('Confirm Delete')}
            </h3>
            <p className="mb-6 text-sm text-slate-600">
              {t(
                'Are you sure you want to delete this user? This action cannot be undone.'
              )}
            </p>
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => setDeleteConfirmRow(null)}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t('Cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDelete && deleteConfirmRow) {
                    onDelete(deleteConfirmRow);
                    setDeleteConfirmRow(null);
                  }
                }}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {t('Delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
