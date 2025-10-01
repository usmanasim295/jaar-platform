'use client';
import {
  CalenderBlank,
  File,
  MapPin,
  Plus,
  PlusIcon,
  Clock,
  Star,
} from '@/components/assets/icons/index';
import InputField from '@/components/ui/InputField';
import { useForm, Control } from 'react-hook-form';
import { tagIcons } from '@/components/modals/tagIcons';
import React, { useRef, useState, ChangeEvent, useEffect, use } from 'react';
import Button from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useGetJobByIdQuery, useSubmitBidMutation } from '@/store/api';
import { useAuth } from '@/contexts/AuthContext';
import i18n from '@/i18n';
import type { Language, Job as ApiJob } from '@/types/api';
import { toast } from 'react-toastify';

interface Job {
  title: string;
  description: string;
  services: string[];
  breakdown: string[];
  tags: string[];
  duration: string;
  location: string;
}

interface JobDetailsProps {
  params: Promise<{ slug: string }>;
}

export default function JobDetails({ params }: JobDetailsProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const { control, handleSubmit, watch, setValue } = useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] =
    useState<string>('Upload Document');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Unwrap params Promise
  const resolvedParams = use(params);

  // Get job data from API
  const {
    data: jobData,
    isLoading: isJobLoading,
    error: jobError,
  } = useGetJobByIdQuery({
    jobId: resolvedParams.slug,
    lang: i18n.language as Language,
  });

  // Submit bid mutation
  const [submitBid] = useSubmitBidMutation();

  // Watch form values
  const totalPrice = watch('totalPrice');
  const coverLetter = watch('coverLetter');

  // Check if current service provider has already bid on this job
  const hasUserBidded =
    jobData?.bids?.some(bid => bid.serviceProviderId === user?.id) || false;
  const userBidStatus = jobData?.bids?.find(
    bid => bid.serviceProviderId === user?.id
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('File size must be less than 5MB'));
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('Please upload a PDF, DOC, DOCX, or image file'));
        return;
      }

      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
  };

  // Submit bid
  const onSubmitBid = async (data: any) => {
    if (!isAuthenticated || !user) {
      toast.error(t('Please log in to submit a bid'));
      return;
    }

    if (!jobData) {
      toast.error(t('Job data not available'));
      return;
    }

    if (!data.totalPrice || !data.coverLetter) {
      toast.error(t('Please fill in all required fields'));
      return;
    }

    setIsSubmitting(true);

    try {
      const bidData = {
        jobId: jobData.id,
        totalPrice: data.totalPrice.toString(),
        coverLetter: data.coverLetter,
        document: selectedFile || undefined,
      };

      const result = await submitBid({
        bidData,
        lang: i18n.language as Language,
      }).unwrap();

      toast.success(result.message || t('Bid submitted successfully!'));

      // Reset form
      setValue('totalPrice', '');
      setValue('coverLetter', '');
      setSelectedFile(null);
      setSelectedFileName('Upload Document');
    } catch (error: any) {
      console.error('Bid submission failed:', error);
      toast.error(
        error?.data?.message || t('Failed to submit bid. Please try again.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isJobLoading) {
    return (
      <div className="flex justify-center px-10 pt-8 gap-6 font-jakarta mb-24">
        <div className="w-full max-w-[1300px] flex flex-col-reverse lg:flex-row gap-6">
          <div className="lg:w-[77%] mx-auto bg-white rounded-2xl shadow-dark p-6 space-y-6 animate-pulse">
            <div className="h-8 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div className="lg:w-[23%]">
            <div className="w-full bg-white p-6 rounded-2xl shadow-dark animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (jobError || !jobData) {
    return (
      <div className="flex justify-center px-10 pt-8 gap-6 font-jakarta mb-24">
        <div className="w-full max-w-[1300px] text-center py-12">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            {t('Error')}
          </h2>
          <p className="text-gray-600">
            {t('Failed to load job details. Please try again.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-10 pt-8 gap-6 font-jakarta mb-24">
      <div className="w-full max-w-[1300px] flex flex-col-reverse lg:flex-row gap-6 ">
        <div className="lg:w-[77%] mx-auto bg-white rounded-2xl shadow-dark p-6 space-y-6 ">
          <div>
            <h2 className="typo-heading3 font-semibold text-(--primary)">
              {jobData.title}
            </h2>
            <p className="typo-body font-medium text-(--primary-black) mt-4">
              {jobData.description}
            </p>

            {/* Job details */}
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              {jobData.workDuration && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {jobData.workDuration}
                </span>
              )}
              {jobData.timeSlot && (
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {jobData.timeSlot}
                </span>
              )}
              {jobData.charges && (
                <span className="font-semibold text-green-600">
                  {jobData.charges}
                </span>
              )}
              {jobData.jobType && (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    jobData.jobType === 'COMMUNITY_SERVICE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {jobData.jobType === 'COMMUNITY_SERVICE'
                    ? t('Community Service')
                    : t('Home Service')}
                </span>
              )}
              {jobData.status && (
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    jobData.status === 'OPEN'
                      ? 'bg-green-100 text-green-800'
                      : jobData.status === 'IN_PROGRESS'
                        ? 'bg-orange-100 text-orange-800'
                        : jobData.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-800'
                          : jobData.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {t(jobData.status.replace(/_/g, ' '))}
                </span>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold typo-heading3 text-(--primary-black) mb-4">
              {t('Services Needed')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobData.services?.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-(--light-grey) p-2.5 rounded-lg typo-small font-medium text-[#15120F]"
                >
                  {tagIcons[service.service.name]} {service.service.name}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold typo-heading3 text-(--primary-black) mb-4">
              {t('Work Duration & Location')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobData.startDate && jobData.endDate && (
                <div className="flex items-center gap-1.5 bg-(--light-grey) p-2.5 rounded-lg typo-small font-medium text-[#15120F]">
                  <CalenderBlank />
                  {new Date(jobData.startDate).toLocaleDateString()} -{' '}
                  {new Date(jobData.endDate).toLocaleDateString()}
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-(--light-grey) p-2.5 rounded-lg typo-small font-medium text-[#15120F]">
                <MapPin />
                {jobData.location}
              </div>
            </div>
          </div>
          <hr className="border-(--light-grey) w-[100%] " />

          {hasUserBidded ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-blue-800">
                    {t('Already Bidded')}
                  </h3>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  {t('You have already submitted a bid for this job')}
                </p>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{t('Bid Status')}:</span>{' '}
                  {t(userBidStatus?.status || 'PENDING')}
                </div>
                {userBidStatus && (
                  <div className="mt-3 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">
                        {t('Your Bid Amount')}:
                      </span>{' '}
                      ${userBidStatus.totalPrice}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{t('Cover Letter')}:</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {typeof userBidStatus.coverLetter === 'string'
                          ? userBidStatus.coverLetter
                          : (userBidStatus.coverLetter as any)?.en ||
                            (userBidStatus.coverLetter as any)?.ar ||
                            ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmitBid)} className="space-y-6">
              <div>
                <h3 className="font-semibold typo-heading3 text-(--primary-black) mb-4">
                  {t('Add Total Prices')} *
                </h3>
                <InputField
                  name="totalPrice"
                  control={control}
                  type="number"
                  className="w-full"
                  placeholder={t('Amount')}
                  inputClassName="h-[60px] pt-7.5 lg:w-[424px] input"
                  placeholderAnimate={true}
                  rules={{ required: t('Total price is required') }}
                />
              </div>
              <hr className="border-(--light-grey) w-[100%] " />

              {/* Cover Letter */}
              <div>
                <h2 className="typo-heading3 font-semibold mb-4 text-(--primary-black)">
                  {t('Add Cover Letter')} *
                </h2>

                <div className="relative w-full">
                  <textarea
                    {...control.register('coverLetter', {
                      required: t('Cover letter is required'),
                    })}
                    rows={12}
                    placeholder={`Dear ${jobData.apartment?.name || t('Client')},

We would like to offer our services for this project. Our team is experienced, reliable, and committed to delivering high-quality work on time.

We'd be happy to discuss your needs in more detail and provide a tailored quote.
Looking forward to working with you.

Best regards,
${user?.name || t('Service Provider')}`}
                    className="w-full px-4 pb-3.5 pt-7.5 font-normal typo-body text-(--primary-black) rounded-[10px] border-2 border-(--light-grey) resize-none"
                  />

                  <label
                    htmlFor="coverLetter"
                    className="absolute left-4 top-3 text-(--grey-text) typo-small font-normal"
                  >
                    {t('Cover Letter')}
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-semibold typo-heading3 text-(--primary-black) mb-6">
                  {t('Add Relevant Document If Any')}
                </h3>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="application/pdf, image/png, image/jpeg, .doc, .docx"
                  />

                  <div
                    className="bg-(--light-grey) rounded-xl p-3 flex items-center justify-between h-[60px] lg:w-[424px] cursor-pointer"
                    onClick={handleUploadClick}
                  >
                    <div className="flex gap-4">
                      <File />
                      <span className="text-sm">
                        {selectedFileName.length > 25
                          ? `${selectedFileName.slice(0, 25)}...`
                          : selectedFileName}
                      </span>
                    </div>
                    <button type="button" className="cursor-pointer">
                      <Plus />
                    </button>
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-green-600 mt-2">
                      {t('File selected')}: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="!h-[40px] !w-[124px] !p-[10px] text-[12px] !rounded-lg !font-medium disabled:opacity-50"
                >
                  {isSubmitting ? t('Submitting...') : t('Bid')}
                </Button>
              </div>
            </form>
          )}
        </div>
        <div className="lg:w-[23%] ">
          <div className="w-full bg-(--white) p-6 rounded-2xl shadow-dark sticky top-28 ">
            <div>
              <h2 className="typo-heading3 font-semibold mb-4 text-(--primary-black)">
                {t('Job Information')}
              </h2>
              <div className="flex items-center gap-4 pb-6">
                <div className="min-w-[45px] min-h-[45px] rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-600">
                    {jobData.apartment?.name?.charAt(0) || 'J'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold typo-heading3 text-(--primary) truncate max-w-[170px]">
                    {jobData.apartment?.name || t('Job')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {jobData.apartment?.city}
                  </p>
                </div>
              </div>

              {/* Job pricing */}
              {jobData.charges && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {t('Budget')}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {jobData.charges}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="">
              <h3 className="font-semibold typo-heading3 text-(--primary-black)">
                {t('Location')}
              </h3>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3629265.841639736!2d39.7831443!3d24.1307375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15e7b33fe7952a41%3A0x5960504bc21ab69b!2sSaudi%20Arabia!5e0!3m2!1sen!2ssa!4v1690196107614"
                height="145"
                className="mt-6 border-none rounded-2xl w-full"
              />

              <p className="font-normal typo-body text-(--primary-black) mt-4">
                {jobData.apartment?.name || t('HOA')}
              </p>
              <p className="font-semibold typo-body text-(--primary-black) mt-2">
                {jobData.apartment?.city || t('Saudi Arabia')}
              </p>

              {jobData.apartment?.hoaNumber && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('HOA Number')}: {jobData.apartment.hoaNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
