import Button from '@/components/ui/Button';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const EmptyState = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-8 sm:py-12 px-4">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {t('No Bids Yet')}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
        {t(
          "You haven't submitted any bids yet. Start by finding jobs that match your skills."
        )}
      </p>
      <Link href="/">
        <Button
          variant="primary"
          className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base"
        >
          {t('Find Jobs')}
        </Button>
      </Link>
    </div>
  );
};
