'use client';

import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { StepProps } from '../types';
import { Plus2Icon } from '../../../components/assets/icons';
import FileUpload from '@/components/modals/FileUpload';
import { useUpdateProfileStepMutation } from '@/store/api';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { toast } from 'react-toastify';
import type { Language } from '@/types/api';
import InputField from '@/components/ui/InputField';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

type BankDetailsForm = {
  firstName: string;
  lastName: string;
  accountNumber: string;
};

const SevenStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(t('File too large. Please choose a file smaller than 5MB.'));
      return;
    }

    // Check file type (PDF, DOC, DOCX)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(t('Please select a PDF or Word document.'));
      return;
    }

    setSelectedFile(file);
  };

  const [updateProfileStep] = useUpdateProfileStepMutation();
  const {
    control,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = useForm<BankDetailsForm>({
    defaultValues: {
      firstName: data?.seventh?.firstName || '',
      lastName: data?.seventh?.lastName || '',
      accountNumber: data?.seventh?.accountNumber || '',
    },
  });

  // Custom handler that clears errors when typing and validates when empty
  const handleFieldChange = (fieldName: keyof BankDetailsForm) => {
    return (value: string) => {
      // Clear error when user starts typing
      clearErrors(fieldName);

      // If field becomes empty, trigger validation to show error
      if (!value.trim()) {
        trigger(fieldName);
      }
    };
  };

  useEffect(() => {
    const prev = data?.seventh || {};
    const values = getValues();
    if (
      prev.firstName !== values.firstName ||
      prev.lastName !== values.lastName ||
      prev.accountNumber !== values.accountNumber ||
      prev.document !== selectedFile?.name
    ) {
      setData('seventh', {
        ...values,
        document: selectedFile?.name || prev.document || null,
      });
    }
  }, [selectedFile]);

  const handleSubmitStep7 = async () => {
    const isValid = await trigger(['firstName', 'lastName', 'accountNumber']);
    if (!isValid) {
      return false;
    }

    const id = localStorage.getItem('serviceProviderId');
    if (!id) {
      // Service provider ID missing - this should not happen in normal flow
      return false;
    }

    const values = getValues();
    const formData = new FormData();
    formData.append('serviceProviderId', id);
    formData.append('firstName', values.firstName);
    formData.append('lastName', values.lastName);
    formData.append('bankAccountNumber', values.accountNumber);

    if (selectedFile) {
      formData.append('bankDocument', selectedFile);
    }

    try {
      const res = await updateProfileStep({
        step: 6,
        data: formData,
        lang: i18n.language as Language,
      }).unwrap();

      setData('seventh', {
        ...values,
        document: selectedFile?.name || null,
      });

      toast.success(t('Bank details updated successfully!'));
      return true;
    } catch (err: any) {
      // Step 7 failed - show error message
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        t('Failed to update bank details. Please try again.');
      toast.error(errorMessage);
      return false;
    }
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep7,
  }));

  return (
    <div className="">
      <h1 className="font-urbanist text-xl sm:text-2xl lg:typo-heading1 font-bold mb-4 sm:mb-6 lg:mb-8 max-w-[712px] w-full leading-tight">
        {t(
          'Add your card details to ensure you get paid quickly and securely.'
        )}
      </h1>

      <div className="w-full shadow-dark p-3 sm:p-4 rounded-lg sm:rounded-xl max-w-[536px]">
        <h3 className="text-sm sm:text-base lg:typo-label font-bold mb-3 sm:mb-4 font-urbanist">
          {t('Add Bank details')}
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
          <InputField
            name="firstName"
            control={control}
            type="text"
            className="w-full"
            placeholder={t('First Name')}
            inputClassName="h-[50px] sm:h-[60px] text-sm sm:text-base"
            rules={{ required: t('First name is required') }}
            error={errors.firstName?.message}
            onChange={handleFieldChange('firstName')}
            onInput={e => {
              // Allow both English and Arabic letters, plus spaces
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^A-Za-z\u0600-\u06FF\s]/g,
                ''
              );
            }}
            placeholderAnimate={true}
          />
          <InputField
            name="lastName"
            control={control}
            type="text"
            className="w-full"
            placeholder={t('Last Name')}
            inputClassName="h-[50px] sm:h-[60px] text-sm sm:text-base"
            rules={{ required: t('Last name is required') }}
            error={errors.lastName?.message}
            onChange={handleFieldChange('lastName')}
            onInput={e => {
              // Allow both English and Arabic letters, plus spaces
              e.currentTarget.value = e.currentTarget.value.replace(
                /[^A-Za-z\u0600-\u06FF\s]/g,
                ''
              );
            }}
            placeholderAnimate={true}
          />
        </div>

        <InputField
          name="accountNumber"
          control={control}
          type="text"
          className="w-full"
          placeholder={t('Bank Account Number')}
          inputClassName="h-[50px] sm:h-[60px] text-sm sm:text-base input"
          rules={{ required: t('Bank account number is required') }}
          error={errors.accountNumber?.message}
          onChange={handleFieldChange('accountNumber')}
          placeholderAnimate={true}
        />

        <FileUpload
          label=""
          accept=".pdf,.doc,.docx"
          required
          onFileSelect={handleFileSelect}
          className="cursor-pointer [appearance:none]"
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 overflow-hidden mt-3 sm:mt-4 cursor-pointer">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Image
                src={'/assets/icons/FileGrey.svg'}
                width={20}
                height={20}
                alt="file"
                className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <p className="text-(--black) text-sm sm:text-base lg:typo-body font-jakarta truncate">
                {selectedFile
                  ? selectedFile.name.slice(0, 20)
                  : t('Upload Document')}
              </p>
            </div>
            <Plus2Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
          </div>
        </FileUpload>
      </div>
    </div>
  );
});

export default SevenStep;
