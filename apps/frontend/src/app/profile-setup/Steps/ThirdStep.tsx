'use client';

import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StepProps } from '../types';
import { useSelectServicesMutation, useGetServicesQuery } from '@/store/api';
import type { Language } from '@/types/api';
import { useTranslation } from 'react-i18next';
import {
  AirConditionIcon,
  CableIcon,
  CleaningIcon,
  PainterIcon,
  PestControl,
  PlumberIcon,
} from '../../../components/assets/icons';

const iconMap: Record<string, React.ElementType> = {
  'AC Services': AirConditionIcon,
  'Cleaning Services': CleaningIcon,
  Electrician: CableIcon,
  Plumber: PlumberIcon,
  Painter: PainterIcon,
  'Pest Control': PestControl,
};
const ThirdStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t, i18n } = useTranslation();
  const [selectedServices, setSelectedServices] = useState<string[]>(() => {
    const stored = localStorage.getItem('selectedServices');
    return stored ? JSON.parse(stored) : [];
  });
  const [selectedServicesName, setSelectedServicesName] = useState<string[]>(
    () => {
      const stored = localStorage.getItem('selectedServicesName');
      return stored ? JSON.parse(stored) : [];
    }
  );
  const [serviceProviderId, setServiceProviderId] = useState<string>('');
  const [selectServices, { error }] = useSelectServicesMutation();
  const { data: fetchedServices, isLoading: isServicesLoading } =
    useGetServicesQuery(i18n.language as Language);

  useEffect(() => {
    const id = localStorage.getItem('serviceProviderId');
    if (id) setServiceProviderId(id);
  }, []);
  const toggleService = (id: string, name: string) => {
    setSelectedServices(prev => {
      const updated = prev.includes(id)
        ? prev.filter(s => s !== id)
        : [...prev, id];

      localStorage.setItem('selectedServices', JSON.stringify(updated));
      return updated;
    });
    setSelectedServicesName(prev => {
      const updated = prev.includes(name)
        ? prev.filter(s => s !== name)
        : [...prev, name];

      localStorage.setItem('selectedServicesName', JSON.stringify(updated));
      return updated;
    });
  };
  const handleSubmit = async () => {
    if (!serviceProviderId || !selectedServices.length) return false;

    try {
      const res = await selectServices({
        data: {
          serviceProviderId,
          serviceIds: selectedServices,
        },
        lang: i18n.language as Language,
      }).unwrap();
      console.log('Step 3 success:', res);
      setData('third', { serviceIds: selectedServices });
      return true;
    } catch (err) {
      console.error('Step 3 failed:', err);
      return false;
    }
  };
  useImperativeHandle(ref, () => ({
    submit: handleSubmit,
  }));
  if (isServicesLoading) return <p>{t('Loading services...')}</p>;
  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist typo-heading1 font-bold mb-8">
        {t('We’d love to know—what services do you provide?')}
      </h1>

      <div className="flex flex-wrap gap-6">
        {(fetchedServices || []).map((service: any) => {
          const Icon = iconMap[service.name] || AirConditionIcon;
          const isSelected = selectedServices.includes(service.id);

          return (
            <div
              key={service.id}
              id={service.id}
              onClick={() => toggleService(service.id, service.name)}
              className={`rounded-xl p-4 overflow-hidden shadow-dark w-[160px] flex flex-col items-center cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-(--primary) text-white'
                  : 'bg-(--white) text-(--black)'
              }`}
            >
              <Icon
                className="mb-4"
                style={{
                  filter: isSelected
                    ? 'brightness(0) invert(1)'
                    : 'brightness(0) invert(0)',
                }}
              />
              <p className="typo-body font-jakarta font-semibold">
                {t(service.name)}
              </p>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 mt-2">{t('Failed to submit services')}</p>
      )}
    </div>
  );
});

export default ThirdStep;
