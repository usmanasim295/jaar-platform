'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useGetMyBidsQuery,
  useDeleteBidMutation,
  useInitiateChatMutation,
} from '@/store/api';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import type { Language, MyBid } from '@/types/api';
import { RouteProtection } from '@/components/RouteProtection';
import { Clock, MapPin, File, Star } from '@/components/assets/icons';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyBids() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [initiatingChatForJob, setInitiatingChatForJob] = useState<
    string | null
  >(null);

  // Get user's bids
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

  // Initiate chat mutation
  const [initiateChat] = useInitiateChatMutation();

  // Get localized text based on current language
  const getLocalizedText = (text: { ar: string; en: string }) => {
    return i18n.language === 'ar' ? text.ar : text.en;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'ACCEPTED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Get job status badge styling
  const getJobStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'SENT_TO_LEADER':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'POSTED_BY_LEADER':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'OPEN':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  // Handle delete bid
  const handleDeleteBid = async (bidId: string) => {
    try {
      const result = await deleteBid({ bidId }).unwrap();
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

  // Handle initiate chat
  const handleInitiateChat = async (jobId: string) => {
    setInitiatingChatForJob(jobId);
    try {
      const result = await initiateChat({ jobId }).unwrap();

      // Check if chat already existed or was newly created
      const wasExisting =
        result &&
        result.createdAt &&
        new Date(result.createdAt).getTime() < Date.now() - 1000;

      if (wasExisting) {
        toast.info(t('Opening existing chat...'));
      } else {
        toast.success(t('Chat created successfully'));
      }

      // Redirect to messages page with the chat ID
      if (result && result.id) {
        router.push(`/messages?chatId=${result.id}`);
      } else {
        router.push('/messages');
      }
    } catch (error: any) {
      console.error('Initiate chat failed:', error);
      toast.error(
        error?.data?.message || t('Failed to initiate chat. Please try again.')
      );
    } finally {
      setInitiatingChatForJob(null);
    }
  };

  // Loading state
  if (isBidsLoading) {
    return (
      <RouteProtection>
        <div className="flex justify-center px-10 pt-8 gap-6 font-jakarta mb-24">
          <div className="w-full max-w-[1300px]">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {t('My Bids')}
            </h1>
            <div className="space-y-6">
              {Array(3)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-dark p-6 animate-pulse"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-6 w-48 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      <div className="h-8 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </RouteProtection>
    );
  }

  // Error state
  if (bidsError) {
    return (
      <RouteProtection>
        <div className="flex justify-center px-10 pt-8 gap-6 font-jakarta mb-24">
          <div className="w-full max-w-[1300px] text-center py-12">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">
              {t('Error')}
            </h2>
            <p className="text-gray-600">
              {t('Failed to load your bids. Please try again.')}
            </p>
          </div>
        </div>
      </RouteProtection>
    );
  }

  return (
    <RouteProtection>
      <div className="flex justify-center px-10 pt-8 gap-6 font-jakarta mb-24">
        <div className="w-full max-w-[1300px]">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {t('My Bids')}
          </h1>

          {!bidsData || bidsData.length === 0 ? (
            <div className="text-center py-12">
              {/* <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <File className="w-12 h-12 text-gray-400" />
              </div> */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('No Bids Yet')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t(
                  "You haven't submitted any bids yet. Start by finding jobs that match your skills."
                )}
              </p>
              <Link href="/">
                <Button variant="primary" className="px-6 py-3">
                  {t('Find Jobs')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bidsData.map((bid: MyBid) => (
                <div
                  key={bid.id}
                  className="bg-white rounded-2xl shadow-dark p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {getLocalizedText(bid.job.title)}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {t('Bid Amount')}:{' '}
                        <span className="font-semibold text-green-600">
                          ${bid.totalPrice}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={getStatusBadge(bid.status)}>
                        {t(bid.status)}
                      </span>
                      <span className={getJobStatusBadge(bid.job.status)}>
                        {t(bid.job.status.replace(/_/g, ' '))}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {getLocalizedText(bid.job.description)}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {bid.job.workDuration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getLocalizedText(bid.job.workDuration)}
                      </span>
                    )}
                    {bid.job.timeSlot && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {getLocalizedText(bid.job.timeSlot)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getLocalizedText(bid.job.location)}
                    </span>
                    {bid.job.charges && (
                      <span className="font-semibold text-green-600">
                        {getLocalizedText(bid.job.charges)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {t('Submitted on')} {formatDate(bid.createdAt)}
                    </div>
                    <div className="flex gap-3">
                      {bid.documentUrl && (
                        <a
                          href={bid.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                        >
                          <File className="w-4 h-4" />
                          {t('View Document')}
                        </a>
                      )}
                      <Button
                        variant="primary"
                        onClick={() => handleInitiateChat(bid.jobId)}
                        disabled={initiatingChatForJob === bid.jobId}
                        className="px-4 py-2 text-sm"
                      >
                        💬{' '}
                        {initiatingChatForJob === bid.jobId
                          ? t('Loading...')
                          : t('Message')}
                      </Button>
                      <Link href={`/job/${bid.jobId}`}>
                        <Button
                          variant="secondary"
                          className="px-4 py-2 text-sm"
                        >
                          {t('View Job')}
                        </Button>
                      </Link>
                      {canDeleteBid(bid.status) && (
                        <Button
                          variant="secondary"
                          onClick={() => setDeleteConfirmId(bid.id)}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          🗑️ {t('Delete')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Cover Letter Preview */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      {t('Cover Letter')}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {bid.coverLetter}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('Delete Bid')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t(
                'Are you sure you want to delete this bid? This action cannot be undone.'
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2"
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteBid(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? t('Deleting...') : t('Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </RouteProtection>
  );
}
