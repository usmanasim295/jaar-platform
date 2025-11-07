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
  const { t, i18n: i18nextInstance } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>(
    t('Upload Document')
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

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

  // Handle RTL state
  useEffect(() => {
    setIsRTL(i18n.language === 'ar');
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsRTL(i18n.language === 'ar');
      setSelectedFileName(t('Upload Document'));
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [t]);

  // Check if current service provider has already bid on this job
  const hasUserBidded =
    jobData?.bids?.some(bid => bid.serviceProviderId === user?.id) || false;
  const userBidStatus = jobData?.bids?.find(
    bid => bid.serviceProviderId === user?.id
  );

  const resolveLocale = () => {
    const lang = i18nextInstance.language;
    if (!lang) return undefined;
    if (lang.startsWith('ar')) return 'ar-SA';
    return lang;
  };

  const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString(resolveLocale(), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('File size must be less than 5MB'));
        event.target.value = ''; // Clear input to allow re-selection
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
        event.target.value = ''; // Clear input to allow re-selection
        return;
      }

      setSelectedFile(file);
      setSelectedFileName(file.name);
    }
    // Always clear input after processing to allow re-selection of same file
    event.target.value = '';
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

    // Validate file size before submission (double-check)
    if (selectedFile) {
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        toast.error(t('File size must be less than 5MB'));
        setIsSubmitting(false);
        return;
      }
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
      <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 gap-4 md:gap-6 font-jakarta mb-12 sm:mb-16 md:mb-24">
        <div className="w-full max-w-[1300px] flex flex-col-reverse lg:flex-row gap-4 md:gap-6">
          <div className="w-full lg:w-[77%] mx-auto bg-white rounded-xl sm:rounded-2xl shadow-dark p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6 animate-pulse">
            <div className="h-6 sm:h-8 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-3 sm:h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-3 sm:h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-full lg:w-[23%]">
            <div className="w-full bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-dark animate-pulse">
              <div className="h-5 sm:h-6 w-28 sm:w-32 bg-gray-200 rounded mb-3 sm:mb-4"></div>
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-200 rounded-full mb-3 sm:mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (jobError || !jobData) {
    return (
      <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 gap-4 md:gap-6 font-jakarta mb-12 sm:mb-16 md:mb-24">
        <div className="w-full max-w-[1300px] text-center py-8 sm:py-12 px-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-600 mb-3 sm:mb-4">
            {t('Error')}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {t('Failed to load job details. Please try again.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4 sm:px-6 md:px-8 lg:px-10 pt-4 sm:pt-6 md:pt-8 gap-4 md:gap-6 font-jakarta mb-12 sm:mb-16 md:mb-24">
      <div className="w-full max-w-[1300px] flex flex-col-reverse lg:flex-row gap-4 md:gap-6">
        <div className="w-full lg:w-[77%] mx-auto bg-white rounded-xl sm:rounded-2xl shadow-dark p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl md:typo-heading3 font-semibold text-(--primary)">
              {jobData.title}
            </h2>
            <p className="text-sm sm:text-base md:typo-body font-medium text-(--primary-black) mt-3 sm:mt-4">
              {jobData.description}
            </p>

            {/* Job details */}
            <div className="mt-3 sm:mt-4 flex items-center flex-wrap gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-gray-600">
              {jobData.timeSlot && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">{jobData.timeSlot}</span>
                </span>
              )}
              {jobData.experienceLevel && (
                <span className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm">
                    🎯 {jobData.experienceLevel}
                  </span>
                </span>
              )}
              {jobData.jobType && (
                <span
                  className={`px-2 py-1 rounded text-[10px] sm:text-xs ${
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
                  className={`px-2 py-1 rounded text-[10px] sm:text-xs ${
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
            <h3 className="font-semibold text-lg sm:text-xl md:typo-heading3 text-(--primary-black) mb-3 sm:mb-4">
              {t('Services Needed')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobData.services?.map((service, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 bg-(--light-grey) p-2 sm:p-2.5 rounded-lg text-xs sm:typo-small font-medium text-[#15120F]"
                >
                  <span className="text-sm sm:text-base">
                    {tagIcons[service.service.name]}
                  </span>
                  <span className="text-xs sm:text-sm">
                    {service.service.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="font-semibold text-lg sm:text-xl md:typo-heading3 text-(--primary-black) mb-3 sm:mb-4">
              {t('Work Duration & Location')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {jobData.startDate && jobData.endDate && (
                <div className="flex items-center gap-1.5 bg-(--light-grey) p-2 sm:p-2.5 rounded-lg text-xs sm:typo-small font-medium text-[#15120F]">
                  <CalenderBlank className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-words">
                    {formatDate(jobData.startDate)} -{' '}
                    {formatDate(jobData.endDate)}
                  </span>
                </div>
              )}
              {jobData.apartment && (
                <div className="flex items-center gap-1.5 bg-(--light-grey) p-2 sm:p-2.5 rounded-lg text-xs sm:typo-small font-medium text-[#15120F]">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs sm:text-sm break-words">
                    {jobData.apartment.name}, {jobData.apartment.city}
                  </span>
                </div>
              )}
            </div>
          </div>
          <hr className="border-(--light-grey) w-[100%] " />

          {hasUserBidded ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <h3 className="font-semibold text-blue-800 text-sm sm:text-base">
                    {t('Already Bidded')}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-blue-700 mb-2">
                  {t('You have already submitted a bid for this job')}
                </p>
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">{t('Bid Status')}:</span>{' '}
                  {t(userBidStatus?.status || 'PENDING')}
                </div>
                {userBidStatus && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">
                        {t('Your Bid Amount')}:
                      </span>{' '}
                      ﷼{userBidStatus.totalPrice}
                    </div>
                    <div className="text-xs sm:text-sm">
                      <span className="font-medium">{t('Cover Letter')}:</span>
                      <p className="mt-1 p-2 bg-gray-50 rounded text-gray-700 text-xs sm:text-sm break-words">
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
            <form
              onSubmit={handleSubmit(onSubmitBid)}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <h3 className="font-semibold text-lg sm:text-xl md:typo-heading3 text-(--primary-black) mb-3 sm:mb-4">
                  {t('Add Total Prices')}{' '}
                  <span className="text-red-500">*</span>
                </h3>
                <InputField
                  name="totalPrice"
                  control={control}
                  type="number"
                  className="w-full"
                  placeholder={t('Amount')}
                  inputClassName={`h-[50px] sm:h-[60px] pt-7.5 w-full lg:w-[424px] input ${errors.totalPrice ? 'border-red-500' : ''}`}
                  placeholderAnimate={true}
                  rules={{
                    required: t('Total price is required'),
                    min: {
                      value: 1,
                      message: t('Price must be greater than 0'),
                    },
                  }}
                />
                {errors.totalPrice && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.totalPrice.message as string}
                  </p>
                )}
              </div>
              <hr className="border-(--light-grey) w-[100%] " />

              {/* Cover Letter */}
              <div>
                <h2 className="text-lg sm:text-xl md:typo-heading3 font-semibold mb-3 sm:mb-4 text-(--primary-black)">
                  {t('Add Cover Letter')}{' '}
                  <span className="text-red-500">*</span>
                </h2>

                <div className="relative w-full">
                  <textarea
                    {...control.register('coverLetter', {
                      required: t('Cover letter is required'),
                      minLength: {
                        value: 10,
                        message: t(
                          'Cover letter must be at least 10 characters'
                        ),
                      },
                    })}
                    rows={10}
                    placeholder={
                      isRTL
                        ? `عزيزي ${jobData.apartment?.name || t('Client')}،

نود أن نقدم خدماتنا لهذا المشروع. فريقنا ذو خبرة وموثوق ومتعهد بتقديم عمل عالي الجودة في الوقت المحدد.

سنكون سعداء لمناقشة احتياجاتك بالتفصيل وتقديم عرض مخصص.
نتطلع للعمل معك.

مع أطيب التحيات،
${user?.name || t('Service Provider')}`
                        : `Dear ${jobData.apartment?.name || t('Client')},

We would like to offer our services for this project. Our team is experienced, reliable, and committed to delivering high-quality work on time.

We'd be happy to discuss your needs in more detail and provide a tailored quote.
Looking forward to working with you.

Best regards,
${user?.name || t('Service Provider')}`
                    }
                    className={`w-full px-3 sm:px-4 pb-3 sm:pb-3.5 pt-7 sm:pt-7.5 font-normal text-sm sm:typo-body text-(--primary-black) rounded-[10px] border-2 resize-none ${errors.coverLetter ? 'border-red-500' : 'border-(--light-grey)'}`}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />

                  <label
                    htmlFor="coverLetter"
                    className={`absolute top-2 sm:top-3 text-(--grey-text) text-xs sm:typo-small font-normal ${
                      isRTL ? 'right-3 sm:right-4' : 'left-3 sm:left-4'
                    }`}
                  >
                    {t('Cover Letter')}
                  </label>
                </div>
                {errors.coverLetter && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">
                    {errors.coverLetter.message as string}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-lg sm:text-xl md:typo-heading3 text-(--primary-black) mb-4 sm:mb-6">
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
                    className={`bg-(--light-grey) rounded-xl p-3 flex items-center justify-between w-full lg:w-[424px] cursor-pointer ${
                      isRTL ? 'h-[55px] sm:h-[65px]' : 'h-[50px] sm:h-[60px]'
                    }`}
                    onClick={handleUploadClick}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div
                      className={`flex gap-3 sm:gap-4 items-center overflow-hidden `}
                    >
                      <File className="w-5" />
                      <span
                        className={`text-xs sm:text-sm truncate ${
                          isRTL ? 'leading-loose py-1' : 'leading-tight'
                        }`}
                      >
                        {selectedFileName.length > 25
                          ? `${selectedFileName.slice(0, 25)}...`
                          : selectedFileName}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer flex-shrink-0"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {selectedFile && (
                    <p className="text-xs text-green-600 mt-2">
                      {t('File selected')}: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="!h-[36px] sm:!h-[40px] !w-[100px] sm:!w-[124px] !p-[8px] sm:!p-[10px] text-[11px] sm:text-[12px] !rounded-lg !font-medium disabled:opacity-50"
                >
                  {isSubmitting ? t('Submitting...') : t('Bid')}
                </Button>
              </div>
            </form>
          )}
        </div>
        <div className="w-full lg:w-[23%]">
          <div className="w-full bg-(--white) p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-dark lg:sticky lg:top-28">
            <div>
              <h2 className="text-lg sm:text-xl md:typo-heading3 font-semibold mb-3 sm:mb-4 text-(--primary-black)">
                {t('Job Information')}
              </h2>
              <div className="flex items-center gap-3 sm:gap-4 pb-4 sm:pb-6">
                <div className="min-w-[40px] min-h-[40px] sm:min-w-[45px] sm:min-h-[45px] rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-base sm:text-lg font-semibold text-gray-600">
                    {jobData.apartment?.name?.charAt(0) || 'J'}
                  </span>
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-base sm:text-lg md:typo-heading3 text-(--primary) truncate">
                    {jobData.apartment?.name || t('Job')}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {jobData.apartment?.city}
                  </p>
                </div>
              </div>

              {/* Job pricing */}
            </div>

            {/* Dropdown Button - Mobile Only */}
            <button
              onClick={() => setIsLocationExpanded(!isLocationExpanded)}
              className="lg:hidden w-full flex items-center justify-between py-3 border-t border-gray-200 hover:bg-gray-50 transition-colors rounded-b-lg"
            >
              <span className="font-semibold text-sm sm:text-base text-(--primary-black)">
                {t('Location Details')}
              </span>
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                  isLocationExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Collapsible Location Section - Mobile Only */}
            <div
              className={`lg:hidden overflow-hidden transition-all duration-300 ${
                isLocationExpanded
                  ? 'max-h-[500px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-base sm:text-lg text-(--primary-black) mb-3">
                  {t('Location')}
                </h3>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3629265.841639736!2d39.7831443!3d24.1307375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15e7b33fe7952a41%3A0x5960504bc21ab69b!2sSaudi%20Arabia!5e0!3m2!1sen!2ssa!4v1690196107614"
                  height="120"
                  className="border-none rounded-xl sm:rounded-2xl w-full"
                  title="Job Location Map"
                />

                <p className="font-normal text-sm sm:text-base text-(--primary-black) mt-3 sm:mt-4 truncate">
                  {jobData.apartment?.name || t('HOA')}
                </p>
                <p className="font-semibold text-sm sm:text-base text-(--primary-black) mt-2 truncate">
                  {jobData.apartment?.city || t('Saudi Arabia')}
                </p>

                {jobData.apartment?.hoaNumber && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
                    {t('HOA Number')}: {jobData.apartment.hoaNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Always Visible Location Section - Desktop Only */}
            <div className="hidden lg:block pt-4 border-t border-gray-200 mt-4">
              <h3 className="font-semibold text-lg md:typo-heading3 text-(--primary-black) mb-3">
                {t('Location')}
              </h3>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3629265.841639736!2d39.7831443!3d24.1307375!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15e7b33fe7952a41%3A0x5960504bc21ab69b!2sSaudi%20Arabia!5e0!3m2!1sen!2ssa!4v1690196107614"
                height="120"
                className="border-none rounded-xl sm:rounded-2xl w-full"
                title="Job Location Map"
              />

              <p className="font-normal text-sm sm:text-base md:typo-body text-(--primary-black) mt-3 sm:mt-4 truncate">
                {jobData.apartment?.name || t('HOA')}
              </p>
              <p className="font-semibold text-sm sm:text-base md:typo-body text-(--primary-black) mt-2 truncate">
                {jobData.apartment?.city || t('Saudi Arabia')}
              </p>

              {jobData.apartment?.hoaNumber && (
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
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
