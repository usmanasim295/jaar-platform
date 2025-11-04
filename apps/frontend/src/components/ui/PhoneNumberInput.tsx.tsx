// components/PhoneNumberInput.tsx
'use client';
import React, { useEffect, useState } from 'react';
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
        render={({ field }) => {
          // Extract phone number without country code
          const getPhoneNumber = (value: string | undefined) => {
            if (!value) return '';
            if (value.startsWith('+966')) {
              return value.replace('+966', '').trim();
            }
            // Remove any existing country code
            return value.replace(/^\+\d{1,3}\s*/, '').replace(/^0+/, '').trim();
          };

          // Format phone number for display (e.g., "12 345 678")
          const formatPhoneDisplay = (phone: string) => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length <= 2) return cleaned;
            if (cleaned.length <= 5) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
            return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
          };

          // Format full value with +966 (store without spaces)
          const formatFullValue = (phoneNumber: string) => {
            const cleaned = phoneNumber.replace(/\D/g, ''); // Remove non-digits
            if (!cleaned) return '';
            return '+966' + cleaned;
          };

          const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value;
            const phoneNumber = inputValue.replace(/\D/g, ''); // Remove non-digits
            const formatted = formatFullValue(phoneNumber);
            field.onChange(formatted);
          };

          const phoneNumber = getPhoneNumber(field.value);
          const displayValue = formatPhoneDisplay(phoneNumber);

          const hasValue = displayValue.length > 0;

          return (
            <div className="relative">
              <div 
                className={`relative flex items-center border-2 rounded-[10px] ${
                  error ? 'border-red-500 ring-red-200' : 'border-(--light-grey)'
                } ${inputClassName}`}
                style={{ direction: 'ltr' }} // Always LTR for phone input container
              >
                {/* Static +966 prefix - always on left */}
                <span
                  className="flex-shrink-0 text-(--primary-black) font-medium pl-4 pr-2 mt-2"
                  style={{ direction: 'ltr' }}
                >
                  +966
                </span>
                {/* Phone number input - always LTR for numbers */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={displayValue}
                    onChange={handleInputChange}
                    onBlur={field.onBlur}
                    placeholder=" "
                    dir="ltr"
                    className="peer w-full pt-3 pr-4 pb-3 mt-2 focus:outline-none text-(--primary-black) bg-transparent"
                    style={{
                      direction: 'ltr', // Always LTR for phone numbers
                      textAlign: 'left', // Always left align for numbers
                    }}
                    maxLength={11} // Allow space for formatting: "12 345 678"
                  />
                </div>
                {/* Animated placeholder label - positioned at +966 location, respects RTL for label text */}
                <label
                  htmlFor={name}
                  className={`absolute z-0 top-1 text-(--gray-2) text-sm transition-all ${
                    isRTL ? 'right-4' : 'left-4'
                  } ${
                    
                    'top-1 text-xs text-(--grey-text)'
                    
                  }`}
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                  {placeholder}
                </label>
              </div>
            </div>
          );
        }}
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
