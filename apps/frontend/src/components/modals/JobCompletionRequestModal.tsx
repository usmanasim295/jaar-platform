import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSubmitJobCompletionRequestMutation } from '@/store/api';
import { JobCompletionRequestSubmit } from '@/types/api';
import { toast } from 'react-toastify';

interface JobCompletionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

const JobCompletionRequestModal: React.FC<JobCompletionRequestModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
}) => {
  const { t, i18n } = useTranslation();
  const [submitCompletionRequest, { isLoading }] =
    useSubmitJobCompletionRequestMutation();

  const [completionNotes, setCompletionNotes] = useState('');
  const [completionImages, setCompletionImages] = useState<File[]>([]);
  const [additionalDocument, setAdditionalDocument] = useState<File | null>(
    null
  );

  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCompletionImages(prev => [...prev, ...files]);
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAdditionalDocument(file);
  };

  const removeImage = (index: number) => {
    setCompletionImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeDocument = () => {
    setAdditionalDocument(null);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!completionNotes.trim()) {
      toast.error(t('Completion notes are required'));
      return;
    }

    try {
      const completionData: JobCompletionRequestSubmit = {
        jobId,
        completionNotes: completionNotes.trim(),
        completionImages:
          completionImages.length > 0 ? completionImages : undefined,
        additionalDocument: additionalDocument || undefined,
      };

      const result = await submitCompletionRequest({
        completionData,
        lang: i18n.language as 'en' | 'ar',
      }).unwrap();

      toast.success(result.message);
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(
        error?.data?.message || t('Failed to submit completion request')
      );
    }
  };

  const resetForm = () => {
    setCompletionNotes('');
    setCompletionImages([]);
    setAdditionalDocument(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur flex items-center justify-center z-50 p-3 sm:p-4 pt-20 sm:pt-24">
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
            {t('Submit Job Completion Request')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl flex-shrink-0 ml-2"
          >
            ×
          </button>
        </div>

        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-2">
            {t('Job')}:
          </h3>
          <p className="text-sm sm:text-base text-gray-700">{jobTitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Completion Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {t('Completion Notes')} *
            </label>
            <textarea
              value={completionNotes}
              onChange={e => setCompletionNotes(e.target.value)}
              placeholder={t('Describe the work completed...')}
              className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          {/* Completion Images */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {t('Completion Images')} ({t('Optional')})
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('Upload images showing the completed work')}
            </p>

            {/* Display selected images */}
            {completionImages.length > 0 && (
              <div className="mt-2 sm:mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {completionImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Completion ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Document */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {t('Additional Document')} ({t('Optional')})
            </label>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleDocumentChange}
              className="w-full p-2 sm:p-3 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t('Upload any additional documentation (PDF, DOC, DOCX)')}
            </p>

            {/* Display selected document */}
            {additionalDocument && (
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm text-gray-700 truncate">
                  {additionalDocument.name}
                </span>
                <button
                  type="button"
                  onClick={removeDocument}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm flex-shrink-0"
                >
                  {t('Remove')}
                </button>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading || !completionNotes.trim()}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t('Submitting...') : t('Submit Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCompletionRequestModal;
