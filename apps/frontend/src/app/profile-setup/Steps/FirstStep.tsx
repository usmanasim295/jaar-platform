import React, { useState } from 'react';
import Image from 'next/image';
import { StepProps } from '../types';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

const FirstStep = ({ data, setData }: StepProps) => {
  const { t } = useTranslation();
  const [isComplete, setIsComplete] = useState(true);
  const name = localStorage.getItem('name');

  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist text-xl sm:text-2xl lg:typo-heading1 font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
        {t('Hey')} {name ? JSON.parse(name) : ''}{' '}
        {t('just need some information to complete sign up process.')}
      </h1>
      <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-(--light-grey) rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden w-full sm:w-[48%] flex sm:block items-center gap-3 sm:gap-0">
          <Image
            src={'/assets/icons/User.svg'}
            width={24}
            height={24}
            alt="user"
            className="mb-0 sm:mb-4 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
          />
          <p className="text-(--black) text-sm sm:text-base lg:typo-body font-jakarta leading-relaxed">
            {t('Answer a few questions an start building your profile.')}
          </p>
        </div>
        <div className="bg-(--light-grey) rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden w-full sm:w-[48%] flex sm:block items-center gap-3 sm:gap-0">
          <Image
            src={'/assets/icons/Files.svg'}
            width={24}
            height={24}
            alt="files"
            className="mb-0 sm:mb-4 w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
          />
          <p className="text-(--black) text-sm sm:text-base lg:typo-body font-jakarta leading-relaxed">
            {t("Apply for open jobs by HOA's or list your service.")}
          </p>
        </div>
        <div className="bg-(--light-grey) rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden flex items-center gap-3 sm:gap-4 w-full">
          <Image
            src={'/assets/icons/Coin.svg'}
            width={24}
            height={24}
            alt="files"
            className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
          />
          <p className="text-(--black) text-sm sm:text-base lg:typo-body font-jakarta leading-relaxed">
            {t(
              'Jar ensures safe, seamless payments with support always ready to help.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
FirstStep.isComplete = (stepData: any) => {
  return !!stepData.first?.name;
};
export default FirstStep;
