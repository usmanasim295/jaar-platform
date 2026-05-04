'use client';
import React, { useState } from 'react';
import {
  formatDate,
  getJobStatusBadge,
  getLocalizedText,
  getStatusBadge,
} from '../utils/bidHelpers';
import { useRouter } from 'next/navigation';

import { formatNumberByLang } from '@/utils/format';
import { File, MapPin, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Language, MyBid } from '@/types/api';
import i18n from '@/i18n';
import { useTranslation } from 'react-i18next';
import { useInitiateChatMutation } from '@/store/api';
import { toast } from 'react-toastify';
import Link from 'next/link';
type Props = {
  bid: MyBid;
  setDeleteConfirmId: (bidId: string) => void;
  canDeleteBid: (status: string) => boolean;
};
export const MybidCard = ({ bid, setDeleteConfirmId, canDeleteBid }: Props) => {
  const [initiatingChatForJob, setInitiatingChatForJob] = useState<
    string | null
  >(null);
  const router = useRouter();

  const { t } = useTranslation();
  const [initiateChat] = useInitiateChatMutation();

  const handleInitiateChat = async (jobId: string) => {
    setInitiatingChatForJob(jobId);
    try {
      const result = await initiateChat({
        jobId,
        lang: i18n.language as Language,
      }).unwrap();
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

  return (
    <div
      key={bid.id}
      className="bg-white rounded-xl sm:rounded-2xl shadow-dark p-4 sm:p-5 md:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 capitalize">
            {getLocalizedText(bid.job.title)}
          </h3>
          <p className="text-gray-600 text-xs sm:text-sm">
            {t('Bid Amount')}:{' '}
            <span className="font-semibold text-green-600">
              ﷼{formatNumberByLang(bid.totalPrice, i18n.language)}
            </span>
          </p>
        </div>
        <div className="flex gap-2 sm:flex-col sm:items-end">
          <span className={getStatusBadge(bid.status)}>{t(bid.status)}</span>
          <span className={getJobStatusBadge(bid.job.status)}>
            {t(bid.job.status.replace(/_/g, ' '))}
          </span>
        </div>
      </div>

      <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 line-clamp-2">
        {getLocalizedText(bid.job.description)}
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
        {bid.job.timeSlot && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {getLocalizedText(bid.job.timeSlot)}
            </span>
          </span>
        )}
        {bid.job.apartment && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="truncate">
              {getLocalizedText(bid.job.apartment.name)},{' '}
              {getLocalizedText(bid.job.apartment.city)}
            </span>
          </span>
        )}
        {bid.job.experienceLevel && (
          <span className="flex items-center gap-1">
            🎯{' '}
            <span className="truncate">
              {getLocalizedText(bid.job.experienceLevel)}
            </span>
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
        <div className="text-xs sm:text-sm text-gray-500">
          {t('Submitted on')} {formatDate(bid.createdAt)}
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 sm:gap-3">
          {bid.documentUrl && (
            <a
              href={bid.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:!text-sm text-blue-600 hover:text-blue-800 px-2 sm:!px-0 py-1.5 sm:!py-0 h-7 sm:!h-auto"
            >
              <File className=" flex-shrink-0" />
              <span className="hidden sm:inline">{t('View Document')}</span>
              <span className="sm:hidden">{t('Doc')}</span>
            </a>
          )}
          <Button
            variant="primary"
            onClick={() => handleInitiateChat(bid.jobId)}
            disabled={initiatingChatForJob === bid.jobId}
            className="!px-2 sm:!px-4 !py-1 sm:!py-2 !text-[10px] sm:!text-sm whitespace-nowrap !h-7 sm:!h-auto"
          >
            💬{' '}
            {initiatingChatForJob === bid.jobId
              ? t('Loading...')
              : t('Message')}
          </Button>
          <Link href={`/job/${bid.jobId}`}>
            <Button
              variant="secondary"
              className="!px-2 text-[#2d6a87] sm:!px-4 !py-1 sm:!py-2 !text-[10px] sm:!text-sm whitespace-nowrap !h-7 sm:!h-auto"
            >
              {t('View Job')}
            </Button>
          </Link>

          {canDeleteBid(bid.status) && (
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmId(bid.id)}
              className="!px-2 sm:!px-4 !py-1 sm:!py-2 !text-[10px] sm:!text-sm text-red-600 hover:text-red-800 hover:bg-red-50 whitespace-nowrap !h-7 sm:!h-auto"
            >
              🗑️ {t('Delete')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
