'use client';

import Image from 'next/image';
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { StepProps } from '../types';
import { Plus2Icon } from '../../../components/assets/icons';
import FileUpload from '@/components/modals/FileUpload';
import { useUploadDocumentMutation } from '@/store/api';
import type { Language } from '@/types/api';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import i18n from '@/i18n';

const SecondStep = forwardRef(({ data, setData }: StepProps, ref) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [uploadDocument, { error }] = useUploadDocumentMutation();

  useEffect(() => {
    if (data?.second?.document) {
      setFileName(data.second.document);
    }
  }, [data]);

  const handleSubmitStep2 = async () => {
    const id = localStorage.getItem('serviceProviderId');
    if (!id) {
      setValidationError(
        t('Service provider ID is missing. Please try again.')
      );
      return false;
    }
    if (!selectedFile && !fileName) {
      setValidationError(t('Please select a file to upload.'));
      return false;
    }
    if (selectedFile) {
      // Validate file size before submission (double-check)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        const errorMessage = t(
          'File too large. Please choose a file smaller than 5MB.'
        );
        setValidationError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      try {
        const res = await uploadDocument({
          data: {
            serviceProviderId: id,
            document: selectedFile,
          },
          lang: i18n.language as Language,
        }).unwrap();

        console.log('Step 2 upload success:', res);
        setData('second', { document: selectedFile.name });
        setFileName(selectedFile.name);
        setValidationError(null); // Clear any previous validation errors
        toast.success(t('Document uploaded successfully!'));
        return true;
      } catch (err: any) {
        console.error('Step 2 upload failed:', err);
        const errorMessage =
          err?.data?.message ||
          err?.message ||
          t('Failed to upload document. Please try again.');
        setValidationError(errorMessage);
        toast.error(errorMessage);
        return false;
      }
    }
    setValidationError(null); // Clear any previous validation errors
    return true;
  };

  useImperativeHandle(ref, () => ({
    submit: handleSubmitStep2,
  }));

  return (
    <div className="max-w-[648px] w-full">
      <h1 className="font-urbanist text-xl sm:text-2xl lg:typo-heading1 font-bold mb-4 sm:mb-6 lg:mb-8 leading-tight">
        {t('Please upload a valid government-issued document')}
      </h1>

      <FileUpload
        label=""
        accept=".pdf,.jpg,.jpeg,.png,.gif"
        required
        onFileSelect={file => {
          // Clear previous validation errors
          setValidationError(null);

          // Check file size (5MB limit)
          const maxSize = 5 * 1024 * 1024; // 5MB in bytes
          if (file.size > maxSize) {
            const errorMessage = t(
              'File too large. Please choose a file smaller than 5MB.'
            );
            setValidationError(errorMessage);
            toast.error(errorMessage);
            setSelectedFile(null);
            setFileName(null);
            return;
          }

          setSelectedFile(file);
          setFileName(file.name);
        }}
        className="cursor-pointer [appearance:none]"
      >
        <div className="relative flex items-center justify-between gap-3 sm:gap-4 bg-(--light-grey) rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden w-full sm:w-[48%] cursor-pointer font-jakarta">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <Image
              src={'/assets/icons/FileGrey.svg'}
              width={20}
              height={20}
              alt="file"
              className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0"
            />
            <p className="text-(--black) text-sm sm:text-base lg:typo-body truncate">
              {t(fileName ? fileName.slice(0, 20) : 'Upload Document')}
            </p>
          </div>
          <Plus2Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
        </div>
      </FileUpload>

      {(error || validationError) && (
        <p className="mt-3 sm:mt-4 text-red-500 font-medium text-sm sm:text-base">
          {validationError || t('Failed to upload. Please try again.')}
        </p>
      )}
    </div>
  );
});

export default SecondStep;
