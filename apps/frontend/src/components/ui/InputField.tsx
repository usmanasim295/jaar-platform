'use client';

import React, { useState, useEffect } from 'react';
import {
  Controller,
  Control,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { Currency, EyeOpenIcon } from '../assets/icons';
import { EyeClosed } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

interface InputFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  type?: 'text' | 'email' | 'password' | 'number' | 'checkbox' | 'radio';
  label?: string;
  placeholder?: string;
  rules?: RegisterOptions<T, Path<T>>;
  className?: string;
  inputClassName?: string;
  error?: string;
  value?: string | number;
  radioValue?: string | number;
  onChange?: (value: any) => void;
  placeholderAnimate?: boolean;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
}

const InputField = <T extends FieldValues>({
  name,
  control,
  label,
  type = 'text',
  placeholder,
  rules,
  className = '',
  inputClassName = '',
  error,
  value,
  radioValue,
  onChange,
  placeholderAnimate = false,
  onInput,
}: InputFieldProps<T>) => {
  const { i18n } = useTranslation();
  const inputId = `${name}-${type}`;
  const [showPassword, setShowPassword] = useState(false);
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
    <div className={`${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          if (type === 'checkbox') {
            return (
              <label className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={!!field.value}
                  onChange={e => {
                    field.onChange(e.target.checked);
                    onChange?.(e.target.checked);
                  }}
                  className="w-4 h-4"
                />
                <span>{label}</span>
              </label>
            );
          }

          if (type === 'radio') {
            return (
              <label className="flex items-center gap-2">
                <input
                  id={inputId}
                  type="radio"
                  value={radioValue}
                  checked={field.value === radioValue}
                  onChange={() => {
                    field.onChange(radioValue);
                    onChange?.(radioValue);
                  }}
                  className="w-4 h-4"
                />
                <span>{label}</span>
              </label>
            );
          }
          const isPassword = type === 'password';
          const inputType = isPassword
            ? showPassword
              ? 'text'
              : 'password'
            : type;
          return (
            <div className="relative">
              {type === 'number' && (
                <div className={`absolute top-9 lg:top-10 -translate-y-1/2 text-gray-500 ${
                  isRTL ? 'right-4' : 'left-4'
                }`}>
                  <Currency />
                </div>
              )}

              <input
                id={inputId}
                type={inputType}
                placeholder={placeholderAnimate ? ' ' : placeholder}
                value={field.value || ''}
                min={type === 'number' ? 0 : undefined}
                onChange={e => {
                  const value =
                    type === 'number' ? Number(e.target.value) : e.target.value;
                  field.onChange(value);
                  onChange?.(value);
                }}
                onInput={onInput}
                onBlur={field.onBlur}
                dir={isRTL ? 'rtl' : 'ltr'}
                className={`peer relative z-1 w-full ${
                  type === 'number' ? (isRTL ? 'pr-8' : 'pl-8') : 'px-4'
                } py-2 pt-5 border-2 rounded-[10px] focus:outline-none text-(--primary-black) ${
                  error
                    ? 'border-red-500 ring-red-200'
                    : 'border-(--light-grey)'
                } ${inputClassName}`}
              />

              {isPassword && (
                <button
                  type="button"
                  className={`absolute z-[2] top-1/2 -translate-y-1/2 cursor-pointer ${
                    isRTL ? 'left-3' : 'right-3'
                  }`}
                  tabIndex={-1}
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpenIcon />}
                </button>
              )}

              {placeholderAnimate && (
                <label
                  htmlFor={inputId}
                  className={`absolute z-0 top-1 text-(--gray-2) text-sm transition-all ${
                    isRTL ? 'right-4' : 'left-4'
                  } ${
                    type === 'number'
                      ? 'top-1 text-xs text-(--grey-text)'
                      : 'peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:text-(--grey-text) peer-focus:top-1.5 sm:peer-focus:text-xs peer-focus:text-[10px] peer-focus:text-(--grey-text)'
                  }`}
                >
                  {placeholder}
                </label>
              )}
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

export default InputField;
