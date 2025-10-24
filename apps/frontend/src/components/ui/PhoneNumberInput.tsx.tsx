// components/PhoneNumberInput.tsx
'use client';
import React, { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

interface PhoneNumberInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
}

const PhoneNumberInput = <T extends FieldValues>({
  name,
  control,
  label,
  error,
  className = '',
  inputClassName,
  placeholder,
  rules,
}: PhoneNumberInputProps<T>) => {
  const { i18n } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsRTL(i18n.language === 'ar');
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsRTL(i18n.language === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  return (
    <div className={` ${className}`}>
      {label && (
        <label className="block mb-1 font-medium text-sm">{label}</label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <div className="relative ">
            <PhoneInput
              {...field}
              defaultCountry="SA"
              international
              countryCallingCodeEditable={true}
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`peer w-full px-4 pt-3 border-2 rounded-[10px] focus:outline-none text-(--primary-black) ${
                error ? 'border-red-500 ring-red-200' : 'border-(--light-grey)'
              } ${inputClassName}`}
            />
            <label
              htmlFor={name}
              className={`absolute -z-1 top-1 text-(--gray-2) text-sm transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-(--grey-text) peer-focus:text-(--grey-text) ${
                isRTL ? 'right-4' : 'left-4'
              }`}
            >
              {placeholder}
            </label>
          </div>
        )}
      />
      {error && (
        <div className="relative text-[10px] text-red-500">
          <span className={`absolute -bottom-3.5 ${
            isRTL ? 'left-3' : 'right-3'
          }`}>{error}</span>
        </div>
      )}{' '}
    </div>
  );
};

export default PhoneNumberInput;
