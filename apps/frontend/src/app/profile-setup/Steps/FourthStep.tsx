'use client';

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StepProps } from '../types';
import { Currency } from '@/components/assets/icons';
import { useTranslation } from 'react-i18next';
import { useSetServiceRatesMutation } from '@/store/api';
import type { Language } from '@/types/api';
import i18n from '@/i18n';
import { toast } from 'react-toastify';

const FourthStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedServicesName, setSelectedServicesName] = useState<string[]>(
    []
  );

  const [rates, setRates] = useState<
    { serviceId: string; serviceName: string; rate: number }[]
  >([]);
  const [serviceProviderId, setServiceProviderId] = useState<string | null>(
    null
  );
  const [setServiceRates, { error }] = useSetServiceRatesMutation();
  const { t } = useTranslation();

  useEffect(() => {
    const storedNames = localStorage.getItem('selectedServicesName');
    const storedIds = localStorage.getItem('selectedServices');
    const id = localStorage.getItem('serviceProviderId');

    if (storedNames) setSelectedServicesName(JSON.parse(storedNames));
    if (storedIds) setSelectedServices(JSON.parse(storedIds));
    if (id) setServiceProviderId(id);
  }, []);

  useEffect(() => {
    if (!selectedServices.length) return;

    const initialRates =
      data?.fourth?.serviceRates?.length > 0
        ? data.fourth.serviceRates
        : selectedServices.map((id, idx) => ({
            serviceId: id,
            serviceName: selectedServicesName[idx] || '',
            rate: 500,
          }));
    setRates(initialRates);
  }, [selectedServices, selectedServicesName, data?.fourth?.serviceRates]);

  useEffect(() => {
    setData('fourth', { serviceRates: rates });
  }, [rates]);

  const handleRateChange = (serviceId: string, value: string) => {
    setRates(prev =>
      prev.map(r =>
        r.serviceId === serviceId ? { ...r, rate: Number(value) } : r
      )
    );
  };

  useEffect(() => {
    const id = localStorage.getItem('serviceProviderId');
    if (id) setServiceProviderId(id);
  }, []);

  const handleSubmit = async () => {
    if (!serviceProviderId || !rates.length) {
      toast.error(t('Please set rates for all services to continue.'));
      return false;
    }

    const invalidRates = rates.filter(rate => !rate.rate || rate.rate <= 0);

    if (invalidRates.length > 0) {
      toast.error(t('Please enter valid rates for all services.'));
      return false;
    }

    const finalRates = rates.map(r => ({
      serviceId: r.serviceId,
      rate: String(r.rate),
    }));

    try {
      await setServiceRates({
        data: {
          serviceProviderId,
          serviceRates: finalRates,
        },
        lang: i18n.language as Language,
      }).unwrap();

      setData('fourth', { serviceRates: rates });
      toast.success(t('Service rates saved successfully!'));
      return true;
    } catch (err) {
      toast.error(t('Failed to save service rates. Please try again.'));
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));

  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist text-xl sm:text-2xl lg:typo-heading1 font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
        {t(
          "Let us know your standard service rates. It will help HOA's to offer you job"
        )}
      </h1>

      <div className="flex flex-wrap gap-y-3 sm:gap-y-4 gap-x-3 sm:gap-x-6">
        {rates.map((rateObj, idx) => (
          <div
            key={rateObj.serviceId}
            className="bg-(--white) border-2 border-(--light-grey) rounded-lg sm:rounded-[10px] px-3 sm:px-4 py-2.5 sm:py-3 overflow-hidden w-full sm:max-w-[312px] text-sm sm:text-base lg:typo-body leading-[100%] text-(--black)"
          >
            <p className="text-(--grey-text) text-xs sm:typo-small font-jakarta font-regular mb-1 sm:mb-0.5">
              {t('How much do you charge for')} {t(rateObj.serviceName)}{' '}
              {t('?')}
            </p>

            <div className="flex items-center gap-2">
              <Currency className="w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="number"
                min="0"
                step="any"
                className="w-full bg-transparent border-none outline-none text-(--black) text-sm sm:text-base font-jakarta font-medium input"
                value={rateObj.rate}
                onChange={e =>
                  handleRateChange(rateObj.serviceId, e.target.value)
                }
                onKeyDown={e => {
                  if (e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
                onPaste={e => {
                  const pastedText = e.clipboardData.getData('text');
                  if (pastedText.includes('+') || pastedText.includes('-')) {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {error && (
        <p className="text-red-500 mt-2 text-sm sm:text-base">
          {t('Failed to submit Rates')}
        </p>
      )}
    </div>
  );
});

export default FourthStep;

