'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { StepProps } from '../types';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useUpdateProfileStepMutation } from '@/store/api';
import type { Language } from '@/types/api';
import Button from '../../../components/ui/Button';
import { toast } from 'react-toastify';

const FifthStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState(data?.fifth?.location || '');
  const [landmark, setLandmark] = useState(data?.fifth?.landmark || '');
  const [updateProfileStep, { error }] = useUpdateProfileStepMutation();

  useEffect(() => {
    setData('fifth', { location, landmark });
  }, [location, landmark]);
  const handleSubmitStep5 = async () => {
    const id = localStorage.getItem('serviceProviderId');
    if (!id) {
      toast.error(t('Service provider ID is missing. Please try again.'));
      return false;
    }

    // Validate required fields
    if (!location.trim()) {
      toast.error(t('Please enter your location.'));
      return false;
    }

    if (!landmark.trim()) {
      toast.error(t('Please enter a landmark.'));
      return false;
    }

    const payload = {
      serviceProviderId: id,
      locations: [
        {
          city: location,
          state: landmark,
        },
      ],
    };

    try {
      const res = await updateProfileStep({
        step: 4,
        data: payload,
        lang: i18n.language as Language,
      }).unwrap();

      setData('fifth', { location, landmark });
      console.log('Step 5 success:', res);
      toast.success(t('Location information saved successfully!'));
      return true;
    } catch (err: any) {
      console.error('Step 5 failed:', err);
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        t('Failed to save location. Please try again.');
      toast.error(errorMessage);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep5,
  }));

  return (
    <div>
      <h1 className="font-urbanist text-xl sm:text-2xl lg:typo-heading1 font-bold mb-4 sm:mb-6 lg:mb-8 max-w-[667px] w-full leading-tight">
        {t("Add the locations you cover to help us connect you with HOA's")}
      </h1>

      <div className="w-full shadow-dark p-3 sm:p-4 rounded-lg sm:rounded-xl max-w-[648px] mb-8">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3629265.841639736!2d39.7831443!3d24.1307375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15e7b33fe7952a41%3A0x5960504bc21ab69b!2sSaudi%20Arabia!5e0!3m2!1sen!2ssa!4v1690196107614"
          height="120"
          className="mt-4 sm:mt-6 border-none rounded-xl sm:rounded-2xl w-full"
        />
        <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:typo-body font-normal font-jakarta">
          {t('Muheel Facilities Managment')}
        </p>
        <h3 className="mt-1 sm:mt-2 text-sm sm:text-base lg:typo-body font-semibold mb-3 sm:mb-4 font-jakarta">
          {t('Saudi Arabia')}
        </h3>

        <Button
          variant="inline"
          className="mb-4 sm:mb-6 font-jakarta text-sm sm:text-base"
        >
          {t('Use my Current Location')}
        </Button>

        <h2 className="text-sm sm:text-base lg:typo-label font-semibold mb-3 sm:mb-4 font-jakarta">
          {t('Add Manually')}
        </h2>

        <form>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 font-jakarta">
            {/* Location Input */}
            <div className="bg-(--white) border-2 border-(--light-grey) rounded-lg sm:rounded-[10px] px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden w-full sm:max-w-[300px]">
              <p className="text-(--grey-text) text-xs sm:typo-small font-jakarta font-regular mb-1">
                {t('Location')}
              </p>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-(--black) text-sm sm:text-base lg:typo-body font-jakarta font-medium placeholder:text-(--black)"
                placeholder={t('Muheel Facilities Managment')}
              />
            </div>

            {/* Landmark Input */}
            <div className="bg-(--white) border-2 border-(--light-grey) rounded-lg sm:rounded-[10px] px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden w-full sm:max-w-[300px]">
              <p className="text-(--grey-text) text-xs sm:typo-small font-jakarta font-regular mb-1">
                {t('Landmark')}
              </p>
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-(--black) text-sm sm:text-base lg:typo-body font-jakarta font-medium placeholder:text-(--black)"
                placeholder={t('Tea House')}
              />
            </div>
          </div>
        </form>
      </div>

      {error && (
        <p className="text-red-500 mt-2 text-sm sm:text-base">
          {t('Failed to submit location')}
        </p>
      )}
    </div>
  );
});

export default FifthStep;
