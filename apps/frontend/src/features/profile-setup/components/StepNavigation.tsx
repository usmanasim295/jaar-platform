import React from 'react';
import Button from '@/components/ui/Button';
import { CaretLeft } from '@/components/assets/icons';

type Props = {
  t: any;
  loading: boolean;
  isRTL: boolean;
  isClient: boolean;
  onNext: () => void;
  onBack: () => void;
};

const StepNavigation = ({
  t,
  loading,
  isRTL,
  isClient,
  onNext,
  onBack,
}: Props) => {
  return (
    <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10">
      <div className="w-full flex max-w-[1300px] justify-between items-center gap-2 sm:gap-4">
        <Button
          variant="secondary"
          className={`flex items-center justify-center gap-1 sm:gap-[5px] sm:py-[19px] font-semibold font-anevir text-sm sm:text-base ${
            isClient && isRTL ? '' : ''
          }`}
          onClick={onBack}
        >
          <CaretLeft
            className={`w-5 hidden lg:inline ${isClient && isRTL ? 'rotate-180' : ''}`}
          />{' '}
          <span className="text-center text-[#2d6a87]">{t('Previous')}</span>
        </Button>

        <Button
          variant="primary"
          className="flex items-center gap-1 sm:gap-[5px] py-3 sm:py-[19px] px-4 sm:px-8 font-semibold font-anevir text-sm sm:text-base"
          onClick={onNext}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-t-2 border-b-2 border-white" />
          ) : (
            t('Next')
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepNavigation;
