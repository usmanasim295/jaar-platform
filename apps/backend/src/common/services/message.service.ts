import { Injectable } from '@nestjs/common';
import { SupportedLanguage } from './language.service';

export interface BilingualMessage {
  en: string;
  ar: string;
}

@Injectable()
export class MessageService {
  // Error Messages
  private readonly errorMessages: Record<string, BilingualMessage> = {
    // Authentication Errors
    'auth.invalid_credentials': {
      en: 'Invalid credentials',
      ar: 'بيانات اعتماد غير صحيحة',
    },
    'auth.user_not_found': {
      en: 'User not found',
      ar: 'المستخدم غير موجود',
    },
    'auth.password_not_set': {
      en: 'Password not set. Please complete your registration.',
      ar: 'كلمة المرور غير محددة. يرجى إكمال التسجيل.',
    },
    'auth.current_password_incorrect': {
      en: 'Current password is incorrect',
      ar: 'كلمة المرور الحالية غير صحيحة',
    },
    'auth.cannot_register_admin': {
      en: 'Cannot register as ADMIN',
      ar: 'لا يمكن التسجيل كمدير',
    },
    'auth.national_id_exists': {
      en: 'User with this National ID already exists',
      ar: 'يوجد مستخدم بهذا الرقم الوطني بالفعل',
    },
    'auth.hoa_has_leader': {
      en: 'HOA number already has a leader. Only one leader per HOA number is allowed.',
      ar: 'رقم HOA لديه قائد بالفعل. يُسمح بقائد واحد فقط لكل رقم HOA.',
    },

    // Job Errors
    'job.user_not_found': {
      en: 'User not found',
      ar: 'المستخدم غير موجود',
    },
    'job.services_not_found': {
      en: 'One or more services not found',
      ar: 'خدمة أو أكثر غير موجودة',
    },
    'job.apartment_not_linked': {
      en: 'Your account is not linked to any apartment',
      ar: 'حسابك غير مرتبط بأي شقة',
    },
    'job.home_service_apartment_mismatch': {
      en: 'You can only create home service jobs for your own apartment',
      ar: 'يمكنك إنشاء وظائف الخدمة المنزلية لشقتك فقط',
    },
    'job.apartment_id_required_leader': {
      en: 'Apartment ID is required for leader-created home service jobs',
      ar: 'معرف الشقة مطلوب لوظائف الخدمة المنزلية التي ينشئها القائد',
    },
    'job.not_authorized_apartment': {
      en: 'You are not authorized to post jobs for this apartment',
      ar: 'غير مخول لك نشر وظائف لهذه الشقة',
    },
    'job.not_authorized_reject_apartment': {
      en: 'You are not authorized to reject jobs for this apartment',
      ar: 'غير مخول لك رفض وظائف لهذه الشقة',
    },
    'job.invalid_role_home_service': {
      en: 'Invalid role for creating home service job',
      ar: 'دور غير صالح لإنشاء وظيفة خدمة منزلية',
    },
    'job.apartment_id_required_community': {
      en: 'Apartment ID is required for community service jobs',
      ar: 'معرف الشقة مطلوب لوظائف الخدمة المجتمعية',
    },
    'job.apartment_not_found': {
      en: 'Apartment not found',
      ar: 'الشقة غير موجودة',
    },
    'job.not_authorized_community': {
      en: 'You are not authorized to post community service jobs for this apartment',
      ar: 'غير مخول لك نشر وظائف الخدمة المجتمعية لهذه الشقة',
    },
    'job.job_not_found': {
      en: 'Job not found',
      ar: 'الوظيفة غير موجودة',
    },
    'job.not_authorized_job': {
      en: 'You are not authorized to perform this action on this job',
      ar: 'غير مخول لك تنفيذ هذا الإجراء على هذه الوظيفة',
    },
    'job.job_not_open': {
      en: 'Job is not open for bidding',
      ar: 'الوظيفة غير مفتوحة للعطاء',
    },
    'job.already_bid': {
      en: 'You have already submitted a bid for this job',
      ar: 'لقد قدمت عرضًا لهذه الوظيفة بالفعل',
    },
    'job.bid_not_found': {
      en: 'Bid not found',
      ar: 'العطاء غير موجود',
    },
    'job.not_authorized_bid': {
      en: 'You are not authorized to perform this action on this bid',
      ar: 'غير مخول لك تنفيذ هذا الإجراء على هذا العطاء',
    },
    'job.job_not_in_progress': {
      en: 'Job is not in progress',
      ar: 'الوظيفة ليست قيد التنفيذ',
    },
    'job.completion_request_not_found': {
      en: 'Completion request not found',
      ar: 'طلب الإكمال غير موجود',
    },
    'job.completion_already_exists': {
      en: 'Completion request already exists for this job',
      ar: 'طلب الإكمال موجود بالفعل لهذه الوظيفة',
    },
    'job.must_be_in_progress': {
      en: 'Job must be in progress to create completion request',
      ar: 'يجب أن تكون الوظيفة قيد التنفيذ لإنشاء طلب الإكمال',
    },
    'job.no_accepted_bid': {
      en: 'You must have an accepted bid for this job to create completion request',
      ar: 'يجب أن يكون لديك عرض مقبول لهذه الوظيفة لإنشاء طلب الإكمال',
    },
    'job.completion_not_pending': {
      en: 'Completion request is not in pending status',
      ar: 'طلب الإكمال ليس في حالة انتظار',
    },
    'job.not_authorized_update_completion': {
      en: 'You are not authorized to update this completion request',
      ar: 'غير مخول لك تحديث طلب الإكمال هذا',
    },
    'job.not_authorized_completion': {
      en: 'You are not authorized to perform this action on this completion request',
      ar: 'غير مخول لك تنفيذ هذا الإجراء على طلب الإكمال هذا',
    },
    'job.invalid_role_community_service': {
      en: 'Invalid role for creating community service job',
      ar: 'دور غير صالح لإنشاء وظيفة خدمة مجتمعية',
    },
    'job.invalid_job_type': {
      en: 'Invalid job type',
      ar: 'نوع وظيفة غير صالح',
    },
    'apartment.no_leader': {
      en: 'This apartment does not have a leader assigned',
      ar: 'هذه الشقة لا يوجد لها قائد معين',
    },
    'apartment.only_leaders_can_create': {
      en: 'Only leaders can create apartments',
      ar: 'يمكن للقادة فقط إنشاء شقق',
    },
    'apartment.hoa_has_leader': {
      en: 'HOA number already exists and has a leader',
      ar: 'رقم HOA موجود بالفعل ولديه قائد',
    },
    'apartment.updated_and_leader_assigned': {
      en: 'Apartment updated and leader assigned successfully',
      ar: 'تم تحديث الشقة وتعيين القائد بنجاح',
    },
    'apartment.only_leaders_can_view': {
      en: 'Only leaders can view their apartments',
      ar: 'يمكن للقادة فقط عرض شققهم',
    },
    'apartment.not_found_or_unauthorized': {
      en: 'Apartment not found or you are not authorized to update it',
      ar: 'الشقة غير موجودة أو غير مخول لك تحديثها',
    },

    // Service Provider Errors
    'service_provider.email_exists': {
      en: 'Service provider with this email already exists',
      ar: 'مقدم الخدمة بهذا البريد الإلكتروني موجود بالفعل',
    },
    'service_provider.not_found': {
      en: 'Service provider not found',
      ar: 'مقدم الخدمة غير موجود',
    },
    'service_provider.invalid_credentials': {
      en: 'Invalid credentials',
      ar: 'بيانات اعتماد غير صحيحة',
    },
    'service_provider.not_approved': {
      en: 'Service provider account is not approved yet',
      ar: 'حساب مقدم الخدمة غير معتمد بعد',
    },
    'service_provider.account_not_active': {
      en: 'Account is not active. Please complete your registration.',
      ar: 'الحساب غير نشط. يرجى إكمال التسجيل.',
    },

    // Chat Errors
    'chat.chat_not_found': {
      en: 'Chat not found',
      ar: 'المحادثة غير موجودة',
    },
    'chat.not_authorized': {
      en: 'Not authorized to send messages in this chat',
      ar: 'غير مخول لإرسال رسائل في هذه المحادثة',
    },
    'chat.message_not_found': {
      en: 'Message not found',
      ar: 'الرسالة غير موجودة',
    },
    'chat.community_not_found': {
      en: 'Community not found',
      ar: 'المجتمع غير موجود',
    },

    // Apartment Errors
    'apartment.not_found': {
      en: 'Apartment not found',
      ar: 'الشقة غير موجودة',
    },
    'apartment.hoa_number_exists': {
      en: 'HOA number already exists',
      ar: 'رقم HOA موجود بالفعل',
    },
    'apartment.house_not_found': {
      en: 'House not found',
      ar: 'المنزل غير موجود',
    },
    'apartment.not_authorized': {
      en: 'You are not authorized to perform this action on this apartment',
      ar: 'غير مخول لك تنفيذ هذا الإجراء على هذه الشقة',
    },

    // Service Errors
    'service.not_found': {
      en: 'Service not found',
      ar: 'الخدمة غير موجودة',
    },
    'service.name_required': {
      en: 'Service name is required',
      ar: 'اسم الخدمة مطلوب',
    },

    // General Errors
    'general.bad_request': {
      en: 'Bad request',
      ar: 'طلب غير صالح',
    },
    'general.not_found': {
      en: 'Resource not found',
      ar: 'المورد غير موجود',
    },
    'general.forbidden': {
      en: 'Access forbidden',
      ar: 'الوصول محظور',
    },
    'general.unauthorized': {
      en: 'Unauthorized access',
      ar: 'وصول غير مخول',
    },
    'general.conflict': {
      en: 'Resource conflict',
      ar: 'تعارض في المورد',
    },
    'general.internal_error': {
      en: 'Internal server error',
      ar: 'خطأ داخلي في الخادم',
    },
    'general.validation_error': {
      en: 'Validation error',
      ar: 'خطأ في التحقق',
    },

    // Additional Error Messages
    'chat.other_user_not_found': {
      en: 'Other user not found',
      ar: 'المستخدم الآخر غير موجود',
    },
    'chat.job_not_found': {
      en: 'Job not found',
      ar: 'الوظيفة غير موجودة',
    },
    'chat.requesting_user_not_found': {
      en: 'Requesting user not found',
      ar: 'المستخدم الطالب غير موجود',
    },
    'chat.service_provider_not_found': {
      en: 'Service provider not found',
      ar: 'مقدم الخدمة غير موجود',
    },
    'chat.poll_not_found': {
      en: 'Poll not found',
      ar: 'الاستطلاع غير موجود',
    },
    'chat.poll_not_active': {
      en: 'Poll is not active',
      ar: 'الاستطلاع غير نشط',
    },
    'chat.poll_expired': {
      en: 'Poll has expired',
      ar: 'انتهت صلاحية الاستطلاع',
    },
    'chat.already_voted': {
      en: 'You have already voted on this poll',
      ar: 'لقد صوتت على هذا الاستطلاع بالفعل',
    },
    'chat.invalid_poll_options': {
      en: 'Invalid poll options',
      ar: 'خيارات الاستطلاع غير صالحة',
    },
    'chat.user_community_not_found': {
      en: 'User community not found',
      ar: 'مجتمع المستخدم غير موجود',
    },
    'chat.user_not_in_chat': {
      en: 'User not found in this chat',
      ar: 'المستخدم غير موجود في هذه المحادثة',
    },
    'chat.invalid_participant': {
      en: 'Invalid participant record',
      ar: 'سجل المشارك غير صالح',
    },
    'chat.access_denied_community_members': {
      en: 'Access denied. Only leaders and homeowners can view community members.',
      ar: 'تم رفض الوصول. يمكن للقادة وأصحاب المنازل فقط عرض أعضاء المجتمع.',
    },
    'chat.only_leaders_can_create_community_chats': {
      en: 'Only leaders can create chats for community services',
      ar: 'يمكن للقادة فقط إنشاء محادثات للخدمات المجتمعية',
    },
    'chat.only_apartment_leader_can_create_community_chats': {
      en: 'Only the apartment leader can create chats for community services',
      ar: 'يمكن لقائد الشقة فقط إنشاء محادثات للخدمات المجتمعية',
    },
    'chat.only_job_creator_can_create_home_chats': {
      en: 'Only the job creator can create chats for home services',
      ar: 'يمكن لمنشئ الوظيفة فقط إنشاء محادثات للخدمات المنزلية',
    },
    'chat.only_apartment_leader_can_create_home_chats': {
      en: 'Only the apartment leader can create chats for home services',
      ar: 'يمكن لقائد الشقة فقط إنشاء محادثات للخدمات المنزلية',
    },
    'apartment.house_owner_must_be_home_owner': {
      en: 'House owner must be a HOME_OWNER',
      ar: 'مالك المنزل يجب أن يكون مالك منزل',
    },
    'apartment.already_has_leader': {
      en: 'Apartment already has a leader',
      ar: 'الشقة لديها قائد بالفعل',
    },
    'apartment.no_leader_assigned': {
      en: 'No leader assigned to this apartment',
      ar: 'لا يوجد قائد معين لهذه الشقة',
    },
    'service_provider.some_services_not_exist': {
      en: 'Some services do not exist',
      ar: 'بعض الخدمات غير موجودة',
    },
    'job.only_leaders_can_view_jobs': {
      en: 'Only leaders can view their posted jobs',
      ar: 'يمكن للقادة فقط عرض الوظائف المنشورة',
    },
    'job.not_sent_to_leader_status': {
      en: 'Job is not in SENT_TO_LEADER status',
      ar: 'الوظيفة ليست في حالة إرسال للقائد',
    },
    'bid.already_bid_on_job': {
      en: 'You have already bid on this job',
      ar: 'لقد قدمت عرضًا على هذه الوظيفة بالفعل',
    },
    'bid.job_no_services': {
      en: 'Job has no services defined',
      ar: 'الوظيفة لا تحتوي على خدمات محددة',
    },
    'bid.invalid_user_role': {
      en: 'Invalid user role',
      ar: 'دور المستخدم غير صالح',
    },
    'bid.total_price_invalid': {
      en: 'Total price must be a valid positive number',
      ar: 'يجب أن يكون السعر الإجمالي رقماً موجباً صالحاً',
    },
    'bid.cannot_bid_job_not_open': {
      en: 'Cannot bid on this job. Job is not open for bidding.',
      ar: 'لا يمكن تقديم عرض على هذه الوظيفة. الوظيفة غير مفتوحة للعطاءات.',
    },
    'bid.not_authorized_update_status': {
      en: 'You are not authorized to update this bid status',
      ar: 'غير مخول لك تحديث حالة هذا العرض',
    },
    'bid.not_authorized_view_job': {
      en: 'You are not authorized to view bids for this job',
      ar: 'غير مخول لك عرض العطاءات لهذه الوظيفة',
    },
    'bid.not_found_or_unauthorized_delete': {
      en: 'Bid not found or you are not authorized to delete this bid',
      ar: 'العرض غير موجود أو غير مخول لك حذف هذا العرض',
    },
    'bid.cannot_delete_not_pending': {
      en: 'Cannot delete bid. Only pending bids can be deleted.',
      ar: 'لا يمكن حذف العرض. يمكن حذف العطاءات المعلقة فقط.',
    },
    'bid.only_service_providers_can_bid': {
      en: 'Only service providers can submit bids',
      ar: 'يمكن لمقدمي الخدمة فقط تقديم العطاءات',
    },
    'bid.only_service_providers_can_delete': {
      en: 'Only service providers can delete bids',
      ar: 'يمكن لمقدمي الخدمة فقط حذف العطاءات',
    },
    'completion.service_provider_not_found': {
      en: 'Service provider not found',
      ar: 'مقدم الخدمة غير موجود',
    },
    'completion.account_not_active': {
      en: 'Service provider account is not active',
      ar: 'حساب مقدم الخدمة غير نشط',
    },
    'completion.invalid_user_role': {
      en: 'Invalid user role',
      ar: 'دور المستخدم غير صالح',
    },
    'completion.only_service_providers_can_create': {
      en: 'Only service providers can create completion requests',
      ar: 'يمكن لمقدمي الخدمات فقط إنشاء طلبات الإكمال',
    },
    'completion.only_service_providers_can_view': {
      en: 'Only service providers can view their completion requests',
      ar: 'يمكن لمقدمي الخدمات فقط عرض طلبات الإكمال الخاصة بهم',
    },
    'completion.only_service_providers_can_view_jobs': {
      en: 'Only service providers can view their jobs',
      ar: 'يمكن لمقدمي الخدمات فقط عرض وظائفهم',
    },
    'auth.access_denied_insufficient_role': {
      en: 'Access denied: insufficient role',
      ar: 'تم رفض الوصول: دور غير كافٍ',
    },
    'chat.service_provider_id_not_found': {
      en: 'Service provider ID not found',
      ar: 'معرف مقدم الخدمة غير موجود',
    },
    'chat.only_service_providers_can_access': {
      en: 'Only service providers can access this endpoint',
      ar: 'يمكن لمقدمي الخدمات فقط الوصول إلى هذا النقطة',
    },
    'job.only_service_providers_can_view_jobs': {
      en: 'Only service providers can view their jobs',
      ar: 'يمكن لمقدمي الخدمات فقط عرض وظائفهم',
    },
    'job.cannot_update_not_open': {
      en: 'Cannot update job that is not in OPEN status',
      ar: 'لا يمكن تحديث الوظيفة التي ليست في حالة مفتوحة',
    },
    'job.cannot_delete_not_open': {
      en: 'Cannot delete job that is not in OPEN status',
      ar: 'لا يمكن حذف الوظيفة التي ليست في حالة مفتوحة',
    },
    'job.not_found_or_unauthorized_update': {
      en: 'Job not found or you are not authorized to update it',
      ar: 'الوظيفة غير موجودة أو غير مخول لك بتحديثها',
    },
    'job.not_found_or_unauthorized_delete': {
      en: 'Job not found or you are not authorized to delete it',
      ar: 'الوظيفة غير موجودة أو غير مخول لك بحذفها',
    },
    'job.only_leaders_can_view_pending_community': {
      en: 'Only leaders can view pending community service jobs',
      ar: 'يمكن للقادة فقط عرض وظائف الخدمة المجتمعية المعلقة',
    },
    'job.only_leaders_can_approve_community': {
      en: 'Only leaders can approve community service jobs',
      ar: 'يمكن للقادة فقط الموافقة على وظائف الخدمة المجتمعية',
    },
    'job.only_community_jobs_can_be_approved': {
      en: 'Only community service jobs can be approved',
      ar: 'يمكن الموافقة على وظائف الخدمة المجتمعية فقط',
    },
    'job.only_leaders_can_reject_community': {
      en: 'Only leaders can reject community service jobs',
      ar: 'يمكن للقادة فقط رفض وظائف الخدمة المجتمعية',
    },
    'job.only_community_jobs_can_be_rejected': {
      en: 'Only community service jobs can be rejected',
      ar: 'يمكن رفض وظائف الخدمة المجتمعية فقط',
    },
    'chat.chat_id_required': {
      en: 'chatId is required',
      ar: 'معرف المحادثة مطلوب',
    },
    'chat.content_required': {
      en: 'content is required',
      ar: 'المحتوى مطلوب',
    },
    'chat.file_required': {
      en: 'At least one file is required',
      ar: 'مطلوب ملف واحد على الأقل',
    },
  };

  // Success Messages
  private readonly successMessages: Record<string, BilingualMessage> = {
    // Authentication Success
    'auth.signup_success': {
      en: 'User registered successfully',
      ar: 'تم تسجيل المستخدم بنجاح',
    },
    'auth.login_success': {
      en: 'Login successful',
      ar: 'تم تسجيل الدخول بنجاح',
    },
    'auth.password_changed': {
      en: 'Password changed successfully',
      ar: 'تم تغيير كلمة المرور بنجاح',
    },

    // Job Success
    'job.created': {
      en: 'Job created successfully',
      ar: 'تم إنشاء الوظيفة بنجاح',
    },
    'job.updated': {
      en: 'Job updated successfully',
      ar: 'تم تحديث الوظيفة بنجاح',
    },
    'job.deleted': {
      en: 'Job deleted successfully',
      ar: 'تم حذف الوظيفة بنجاح',
    },
    'job.bid_submitted': {
      en: 'Bid submitted successfully',
      ar: 'تم تقديم العطاء بنجاح',
    },
    'job.bid_updated': {
      en: 'Bid updated successfully',
      ar: 'تم تحديث العطاء بنجاح',
    },
    'job.bid_accepted': {
      en: 'Bid accepted successfully',
      ar: 'تم قبول العطاء بنجاح',
    },
    'job.completion_submitted': {
      en: 'Completion request submitted successfully',
      ar: 'تم تقديم طلب الإكمال بنجاح',
    },
    'job.completion_approved': {
      en: 'Job completion request approved successfully',
      ar: 'تم الموافقة على طلب إكمال الوظيفة بنجاح',
    },
    'job.completion_rejected': {
      en: 'Job completion request rejected successfully',
      ar: 'تم رفض طلب إكمال الوظيفة بنجاح',
    },
    'job.home_service_created': {
      en: 'Home service job created successfully and is now visible to service providers',
      ar: 'تم إنشاء وظيفة الخدمة المنزلية بنجاح وهي الآن مرئية لمقدمي الخدمات',
    },
    'job.community_service_sent_to_leader': {
      en: 'Community service job request sent to leader for approval',
      ar: 'تم إرسال طلب وظيفة الخدمة المجتمعية إلى القائد للموافقة',
    },
    'job.community_service_created': {
      en: 'Community service job created successfully and is now visible to service providers',
      ar: 'تم إنشاء وظيفة الخدمة المجتمعية بنجاح وهي الآن مرئية لمقدمي الخدمات',
    },

    // Service Provider Success
    'service_provider.signup_success': {
      en: 'Service provider registered successfully. Please proceed to step 1 to upload government document.',
      ar: 'تم تسجيل مقدم الخدمة بنجاح. يرجى المتابعة إلى الخطوة 1 لرفع المستند الحكومي.',
    },
    'service_provider.document_uploaded': {
      en: 'Government document uploaded successfully. Please proceed to step 2 to select services.',
      ar: 'تم رفع المستند الحكومي بنجاح. يرجى المتابعة إلى الخطوة 2 لاختيار الخدمات.',
    },
    'service_provider.services_selected': {
      en: 'Services selected successfully. Please proceed to step 3 to set service rates.',
      ar: 'تم اختيار الخدمات بنجاح. يرجى المتابعة إلى الخطوة 3 لتحديد أسعار الخدمات.',
    },
    'service_provider.rates_set': {
      en: 'Service rates set successfully. Please proceed to step 4 to add service locations.',
      ar: 'تم تحديد أسعار الخدمات بنجاح. يرجى المتابعة إلى الخطوة 4 لإضافة مواقع الخدمة.',
    },
    'service_provider.locations_added': {
      en: 'Service locations added successfully. Please proceed to step 5 to add bio and profile picture.',
      ar: 'تم إضافة مواقع الخدمة بنجاح. يرجى المتابعة إلى الخطوة 5 لإضافة السيرة الذاتية وصورة الملف الشخصي.',
    },
    'service_provider.profile_completed': {
      en: 'Profile completed successfully. Please proceed to step 6 to add payment details.',
      ar: 'تم إكمال الملف الشخصي بنجاح. يرجى المتابعة إلى الخطوة 6 لإضافة تفاصيل الدفع.',
    },
    'service_provider.payment_added': {
      en: 'Payment details added successfully. Registration completed!',
      ar: 'تم إضافة تفاصيل الدفع بنجاح. اكتمل التسجيل!',
    },
    'service_provider.login_success': {
      en: 'Login successful',
      ar: 'تم تسجيل الدخول بنجاح',
    },

    // Chat Success
    'chat.message_sent': {
      en: 'Message sent successfully',
      ar: 'تم إرسال الرسالة بنجاح',
    },
    'chat.chat_created': {
      en: 'Chat created successfully',
      ar: 'تم إنشاء المحادثة بنجاح',
    },

    // Apartment Success
    'apartment.created': {
      en: 'Apartment created successfully',
      ar: 'تم إنشاء الشقة بنجاح',
    },
    'apartment.updated': {
      en: 'Apartment updated successfully',
      ar: 'تم تحديث الشقة بنجاح',
    },
    'apartment.house_added': {
      en: 'House added successfully',
      ar: 'تم إضافة المنزل بنجاح',
    },

    // Service Success
    'service.created': {
      en: 'Service created successfully',
      ar: 'تم إنشاء الخدمة بنجاح',
    },
    'service.updated': {
      en: 'Service updated successfully',
      ar: 'تم تحديث الخدمة بنجاح',
    },
    'service.deleted': {
      en: 'Service deleted successfully',
      ar: 'تم حذف الخدمة بنجاح',
    },

    // General Success
    'general.success': {
      en: 'Operation completed successfully',
      ar: 'تم إكمال العملية بنجاح',
    },
    'general.updated': {
      en: 'Updated successfully',
      ar: 'تم التحديث بنجاح',
    },
    'general.deleted': {
      en: 'Deleted successfully',
      ar: 'تم الحذف بنجاح',
    },

    // Additional Success Messages
    'bid.submitted': {
      en: 'Bid submitted successfully',
      ar: 'تم تقديم العطاء بنجاح',
    },
    'bid.status_updated': {
      en: 'Bid status updated successfully',
      ar: 'تم تحديث حالة العطاء بنجاح',
    },
    'bid.deleted': {
      en: 'Bid deleted successfully',
      ar: 'تم حذف العطاء بنجاح',
    },
    'job.updated_success': {
      en: 'Job updated successfully',
      ar: 'تم تحديث الوظيفة بنجاح',
    },
    'job.deleted_success': {
      en: 'Job deleted successfully',
      ar: 'تم حذف الوظيفة بنجاح',
    },
    'job.status_updated_success': {
      en: 'Job status updated successfully',
      ar: 'تم تحديث حالة الوظيفة بنجاح',
    },
    'job.community_approved': {
      en: 'Community service job approved and posted successfully',
      ar: 'تم الموافقة على وظيفة الخدمة المجتمعية ونشرها بنجاح',
    },
    'job.community_rejected': {
      en: 'Community service job rejected successfully',
      ar: 'تم رفض وظيفة الخدمة المجتمعية بنجاح',
    },
    'service_provider.bank_details_added': {
      en: 'Bank details added successfully. Your account is now active!',
      ar: 'تم إضافة تفاصيل البنك بنجاح. حسابك نشط الآن!',
    },
    'service_provider.services_selected_success': {
      en: 'Services selected successfully. Please proceed to step 3 to set service rates.',
      ar: 'تم اختيار الخدمات بنجاح. يرجى المتابعة إلى الخطوة 3 لتعيين أسعار الخدمات.',
    },
    'service_provider.rates_set_success': {
      en: 'Service rates set successfully. Please proceed to step 4 to add locations.',
      ar: 'تم تعيين أسعار الخدمات بنجاح. يرجى المتابعة إلى الخطوة 4 لإضافة المواقع.',
    },
    'service_provider.locations_added_success': {
      en: 'Locations added successfully. Please proceed to step 5 to add bio and profile picture.',
      ar: 'تم إضافة المواقع بنجاح. يرجى المتابعة إلى الخطوة 5 لإضافة السيرة الذاتية وصورة الملف الشخصي.',
    },
    'service_provider.profile_completed_success': {
      en: 'Bio and profile picture added successfully. Please proceed to step 6 to add bank details.',
      ar: 'تم إضافة السيرة الذاتية وصورة الملف الشخصي بنجاح. يرجى المتابعة إلى الخطوة 6 لإضافة تفاصيل البنك.',
    },
    'nafath.webhook_processed': {
      en: 'Webhook processed successfully',
      ar: 'تم معالجة الويب هوك بنجاح',
    },
    'nafath.webhook_failed': {
      en: 'Failed to process webhook',
      ar: 'فشل في معالجة الويب هوك',
    },
    'apartment.deleted_success': {
      en: 'Apartment deleted successfully',
      ar: 'تم حذف الشقة بنجاح',
    },
    'apartment.house_removed': {
      en: 'House removed successfully',
      ar: 'تم إزالة المنزل بنجاح',
    },
    'apartment.leader_assigned': {
      en: 'Leader assigned to apartment successfully',
      ar: 'تم تعيين القائد للشقة بنجاح',
    },
    'apartment.cannot_delete_with_houses': {
      en: 'Cannot delete apartment that has houses. Please remove all houses first.',
      ar: 'لا يمكن حذف الشقة التي تحتوي على منازل. يرجى إزالة جميع المنازل أولاً.',
    },
    'apartment.cannot_delete_with_jobs': {
      en: 'Cannot delete apartment that has jobs. Please remove all jobs first.',
      ar: 'لا يمكن حذف الشقة التي تحتوي على وظائف. يرجى إزالة جميع الوظائف أولاً.',
    },
    'apartment.not_found_or_unauthorized_delete': {
      en: 'Apartment not found or you are not authorized to delete it',
      ar: 'الشقة غير موجودة أو غير مخول لك بحذفها',
    },
    'apartment.not_found_or_unauthorized_add_houses': {
      en: 'Apartment not found or you are not authorized to add houses to it',
      ar: 'الشقة غير موجودة أو غير مخول لك بإضافة منازل إليها',
    },
    'apartment.house_not_found_or_unauthorized_remove': {
      en: 'House not found or you are not authorized to remove it',
      ar: 'المنزل غير موجود أو غير مخول لك بإزالته',
    },
    'apartment.only_leaders_can_be_assigned': {
      en: 'Only leaders can be assigned to apartments',
      ar: 'يمكن للقادة فقط أن يتم تعيينهم للشقق',
    },
    'service.seeded': {
      en: 'Services seeded successfully!',
      ar: 'تم بذر الخدمات بنجاح!',
    },
  };

  /**
   * Get error message in the specified language
   */
  getErrorMessage(key: string, language: SupportedLanguage = 'en'): string {
    const message = this.errorMessages[key];
    if (!message) {
      return this.errorMessages['general.internal_error'][language];
    }
    return message[language];
  }

  /**
   * Get success message in the specified language
   */
  getSuccessMessage(key: string, language: SupportedLanguage = 'en'): string {
    const message = this.successMessages[key];
    if (!message) {
      return this.successMessages['general.success'][language];
    }
    return message[language];
  }

  /**
   * Get bilingual error message
   */
  getBilingualErrorMessage(key: string): BilingualMessage {
    return (
      this.errorMessages[key] || this.errorMessages['general.internal_error']
    );
  }

  /**
   * Get bilingual success message
   */
  getBilingualSuccessMessage(key: string): BilingualMessage {
    return this.successMessages[key] || this.successMessages['general.success'];
  }

  /**
   * Get message in specified language (works for both error and success)
   */
  getMessage(key: string, language: SupportedLanguage = 'en'): string {
    // Try error messages first, then success messages
    const errorMessage = this.errorMessages[key];
    if (errorMessage) {
      return errorMessage[language];
    }

    const successMessage = this.successMessages[key];
    if (successMessage) {
      return successMessage[language];
    }

    // Fallback to general success message
    return this.successMessages['general.success'][language];
  }

  /**
   * Get bilingual message (works for both error and success)
   */
  getBilingualMessage(key: string): BilingualMessage {
    // Try error messages first, then success messages
    const errorMessage = this.errorMessages[key];
    if (errorMessage) {
      return errorMessage;
    }

    const successMessage = this.successMessages[key];
    if (successMessage) {
      return successMessage;
    }

    // Fallback to general success message
    return this.successMessages['general.success'];
  }
}
