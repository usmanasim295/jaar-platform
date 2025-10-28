'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import Button from '../../components/ui/Button';
import dynamicImport from 'next/dynamic';
import { CaretLeft } from '@/components/assets/icons';
import { useTranslation } from 'react-i18next';
import { Bounce, toast } from 'react-toastify';
import i18n from '@/i18n';

// Force dynamic rendering (no SSR)
export const dynamic = 'force-dynamic';

const steps = [
  dynamicImport(() => import('./Steps/FirstStep'), { ssr: false }),
  dynamicImport(() => import('./Steps/SecondStep'), { ssr: false }),
  dynamicImport(() => import('./Steps/ThirdStep'), { ssr: false }),
  dynamicImport(() => import('./Steps/FourthStep'), { ssr: false }),
  dynamicImport(() => import('./Steps/FifthStep'), { ssr: false }),
  dynamicImport(() => import('./Steps/SixthStep'), { ssr: false }),
  dynamicImport(() => import('./Steps/SevenStep'), { ssr: false }),
];

const initialStepData = {
  first: {},
  second: {},
  third: {},
  fourth: {},
  fifth: {},
  sixth: {},
  seven: {},
};

const Page = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState(initialStepData);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  const StepComponent = steps[currentStep];

  const stepProps = {
    data: stepData,
    setData: (key: string, value: any) =>
      setStepData(prev => ({
        ...prev,
        [key as keyof typeof initialStepData]: value,
      })),
  };

  const stepRefs = useRef<any[]>([]);

  const handleNext = async () => {
    const stepRef = stepRefs.current[currentStep];
    const StepComponent = steps[currentStep];

    if (currentStep !== 0) {
      if (stepRef?.submit) {
        setLoading(true);
        const success = await stepRef.submit();
        setLoading(false);
        if (!success) {
          // Don't show duplicate toast messages - let each step handle its own toasts
          return;
        }
      }

      // Check if step is complete (if the component has an isComplete method)
      if (
        StepComponent &&
        typeof (StepComponent as any).isComplete === 'function'
      ) {
        const stepKeys = [
          'first',
          'second',
          'third',
          'fourth',
          'fifth',
          'sixth',
          'seven',
        ];
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Profile setup completed
      // Clear the service provider ID as it's no longer needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('serviceProviderId');
        localStorage.removeItem('name');
        localStorage.removeItem('selectedServices');
        localStorage.removeItem('selectedServicesName');
      }

      // Redirect to signin page to complete authentication
      router.push('/signin');
    }
  };

  useEffect(() => {
    // Set client-side state to prevent hydration mismatch
    setIsClient(true);
    setIsRTL(i18n.language === 'ar');
  }, []);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;

    const serviceProviderId = localStorage.getItem('serviceProviderId');
    const token = localStorage.getItem('token');

    // If user is already fully authenticated, redirect to main page
    if (token && !serviceProviderId) {
      router.push('/');
      return;
    }

    // If no service provider ID (not in signup flow), redirect to signup
    if (!serviceProviderId) {
      router.push('/signup');
    }
  }, [router]);

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setIsRTL(i18n.language === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="py-2 sm:py-2.5 bg-(--white) w-full flex flex-col justify-between mt-8 sm:mt-12.5 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10">
          <div className="w-full max-w-[1300px] flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 sm:py-2.5 bg-(--white) w-full flex flex-col justify-between mt-8 sm:mt-12.5 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
      <title>Profile Setup</title>
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[1300px] flex flex-col justify-between mb-20 sm:mb-32 lg:mb-40">
          <StepComponent
            ref={(el: any) => (stepRefs.current[currentStep] = el)}
            {...stepProps}
          />
        </div>
      </div>

      <div className="fixed bottom-2 sm:bottom-4 w-screen inset-x-0 bg-white border-t border-gray-100">
        <div className="relative w-full h-1.5 sm:h-2 bg-(--light-grey) mb-4 sm:mb-6 lg:mb-8">
          <div
            className="absolute h-1.5 sm:h-2 bg-(--primary) rounded-r-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10">
          <div className="w-full flex max-w-[1300px] justify-between items-center gap-2 sm:gap-4">
            <Button
              variant="secondary"
              className={`flex items-center justify-center gap-1 sm:gap-[5px] sm:py-[19px] font-semibold font-anevir text-sm sm:text-base ${
                isClient && isRTL ? 'flex-row-reverse' : ''
              }`}
              onClick={() => {
                if (currentStep === 0) router.push('/signup');
                else setCurrentStep(s => Math.max(s - 1, 0));
              }}
            >
              {/* <div className={`flex items-center justify-center gap-1 sm:gap-[5px] sm:py-[19px] font-semibold font-anevir text-sm sm:text-base ${
                isClient && isRTL ? 'flex-row-reverse' : ''
              }`}> */}
              <CaretLeft
                className={`w-5 hidden lg:inline ${
                  isClient && isRTL ? '' : ''
                }`}
              />
              <span className="text-center text-[#2d6a87]">
                {t('Previous')}
              </span>
              {/* </div> */}

              {/* <span className="xs:hidden">{t('Prev')}</span> */}
            </Button>

            <Button
              variant="primary"
              className="flex items-center gap-1 sm:gap-[5px] py-3 sm:py-[19px] px-4 sm:px-8 font-semibold font-anevir text-sm sm:text-base"
              onClick={handleNext}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 sm:h-6 sm:w-6 border-t-2 border-b-2 border-white" />
              ) : (
                t('Next')
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
