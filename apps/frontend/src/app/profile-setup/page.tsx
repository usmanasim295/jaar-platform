'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { useRTL } from '@/hooks/useRTL';
import {
  STEPS,
  INITIAL_STEP_DATA,
} from '@/features/profile-setup/components/steps';
import StepRenderer from '@/features/profile-setup/components/StepRenderer';
import StepNavigation from '@/features/profile-setup/components/StepNavigation';
import StepProgress from '@/features/profile-setup/components/StepProgress';
import StepLoader from '@/features/profile-setup/components/StepLoader';

const Page = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isClient, isRTL } = useRTL();
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currentStep');
      return saved ? Number(saved) : 0;
    }
    return 0;
  });
  useEffect(() => {
    localStorage.setItem('currentStep', String(currentStep));
  }, [currentStep]);
  const [stepData, setStepData] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stepData');
      return saved ? JSON.parse(saved) : INITIAL_STEP_DATA;
    }
    return INITIAL_STEP_DATA;
  });
  useEffect(() => {
    localStorage.setItem('stepData', JSON.stringify(stepData));
  }, [stepData]);

  const [loading, setLoading] = useState(false);

  const stepRefs = useRef<any[]>([]);

  const StepComponent = STEPS[currentStep];

  const setData = useCallback((key: string, value: any) => {
    setStepData(prev => ({
      ...prev,
      [key as keyof typeof INITIAL_STEP_DATA]: value,
    }));
  }, []);

  const stepProps = {
    data: stepData,
    setData,
  };

  const handleNext = async () => {
    const ref = stepRefs.current[currentStep];
    if (currentStep !== 0 && ref?.submit) {
      setLoading(true);
      const success = await ref.submit();
      setLoading(false);
      if (!success) return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      return;
    } else {
      // Clear the service provider ID as it's no longer needed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('serviceProviderId');
        localStorage.removeItem('name');
        localStorage.removeItem('selectedServices');
        localStorage.removeItem('selectedServicesName');
        localStorage.removeItem('stepData');
        localStorage.removeItem('currentStep');
      }
      // Redirect to signin page to complete authentication
      router.push('/signin');
    }
  };

  const handleBack = useCallback(() => {
    if (currentStep === 0) {
      router.push('/signup');
    } else {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, router]);

  useEffect(() => {
    const id = localStorage.getItem('serviceProviderId');
    const token = localStorage.getItem('token');

    if (token && !id) router.push('/');
    if (!id) router.push('/signup');
  }, [router]);

  if (!isClient) return <StepLoader />;

  return (
    <div className="py-2 sm:py-2.5 bg-(--white) w-full flex flex-col justify-between mt-8 sm:mt-12.5 h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)]">
      <title>Profile Setup</title>

      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-10">
        <div className="w-full max-w-[1300px] flex flex-col justify-between mb-20 sm:mb-32 lg:mb-40">
          <StepRenderer
            StepComponent={StepComponent}
            stepRef={(el: any) => (stepRefs.current[currentStep] = el)}
            stepProps={stepProps}
          />
        </div>
      </div>

      <div className="fixed bottom-2 sm:bottom-4 w-screen inset-x-0 bg-white border-t border-gray-100">
        <StepProgress currentStep={currentStep} totalSteps={STEPS.length} />

        <StepNavigation
          t={t}
          loading={loading}
          isRTL={isRTL}
          isClient={isClient}
          onNext={handleNext}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default Page;

