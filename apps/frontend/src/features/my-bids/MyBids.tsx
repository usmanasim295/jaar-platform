'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetMyBidsQuery, useDeleteBidMutation } from '@/store/api';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import type { Language, MyBid } from '@/types/api';
import { RouteProtection } from '@/components/RouteProtection';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { FallbackError } from '@/features/my-bids/components/FallbackError';
import { LoadingSkeleton } from '@/features/my-bids/components/LoadingSkeleton';
import { EmptyState } from '@/features/my-bids/components/EmptyState';
import { MybidCard } from '@/features/my-bids/components/MybidCard';
import { DeleteConfirmDialog } from '@/features/my-bids/components/DeleteConfirmDialog';

export default function MyBids() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    data: bidsData,
    isLoading: isBidsLoading,
    error: bidsError,
    refetch: refetchBids,
  } = useGetMyBidsQuery(i18n.language as Language, {
    skip: !isAuthenticated,
    refetchOnMountOrArgChange: true,
  });

  // Refetch bids when user changes
  useEffect(() => {
    if (isAuthenticated) {
      refetchBids();
    }
  }, [isAuthenticated, refetchBids]);

  // Delete bid mutation
  const [deleteBid, { isLoading: isDeleting }] = useDeleteBidMutation();

  // Handle delete bid
  const handleDeleteBid = async (bidId: string) => {
    try {
      const result = await deleteBid({
        bidId,
        lang: i18n.language as Language,
      }).unwrap();
      toast.success(result.message || t('Bid deleted successfully'));
      setDeleteConfirmId(null);
    } catch (error: any) {
      console.error('Delete bid failed:', error);
      toast.error(
        error?.data?.message || t('Failed to delete bid. Please try again.')
      );
    }
  };

  // Check if bid can be deleted (only pending bids)
  const canDeleteBid = (status: string) => {
    return status === 'PENDING';
  };

  // Loading state
  if (isBidsLoading) return <LoadingSkeleton />;

  // Error state
  if (bidsError) return <FallbackError />;

  return (
    <RouteProtection>
      <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 gap-4 md:gap-6 font-jakarta mb-12 sm:mb-16 md:mb-24">
        <div className="w-full max-w-[1300px]">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">
            {t('My Bids')}
          </h1>

          {!bidsData || bidsData.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {bidsData.map((bid: MyBid) => (
                <MybidCard
                  key={bid.id}
                  bid={bid}
                  setDeleteConfirmId={setDeleteConfirmId}
                  canDeleteBid={canDeleteBid}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <DeleteConfirmDialog
          setDeleteConfirmId={setDeleteConfirmId}
          handleDeleteBid={handleDeleteBid}
          isDeleting={isDeleting}
          deleteConfirmId={deleteConfirmId}
        />
      )}
    </RouteProtection>
  );
}
