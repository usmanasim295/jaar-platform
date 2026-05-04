import Button from '@/components/ui/Button';

import React from 'react';
import { useTranslation } from 'react-i18next';
type Props = {
  setDeleteConfirmId: (id: string | null) => void;
  handleDeleteBid: (bidId: string) => void;
  isDeleting: boolean;
  deleteConfirmId: any;
};
export const DeleteConfirmDialog = ({
  setDeleteConfirmId,
  handleDeleteBid,
  isDeleting,
  deleteConfirmId,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full shadow-2xl">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          {t('Delete Bid')}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          {t(
            'Are you sure you want to delete this bid? This action cannot be undone.'
          )}
        </p>
        <div className="flex gap-2 sm:gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setDeleteConfirmId(null)}
            disabled={isDeleting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleDeleteBid(deleteConfirmId)}
            disabled={isDeleting}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? t('Deleting...') : t('Delete')}
          </Button>
        </div>
      </div>
    </div>
  );
};
