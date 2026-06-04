import { Injectable } from '@nestjs/common';

export type SupportedLanguage = 'en' | 'ar';

const enumTranslations: Record<string, string> = {
  // Roles
  HOME_OWNER: 'صاحب المنزل',
  LEADER: 'قائد',
  ADMIN: 'مسؤول',
  SERVICE_PROVIDER: 'مقدم خدمة',

  // JobStatus
  SENT_TO_LEADER: 'أرسلت للقائد',
  POSTED_BY_LEADER: 'نشرت من القائد',
  OPEN: 'مفتوح',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',

  // JobType
  HOME_SERVICE: 'خدمة منزلية',
  COMMUNITY_SERVICE: 'خدمة مجتمعية',
  RFQ: 'طلب تسعير',

  // BidStatus & JobCompletionRequestStatus & TicketStatus
  PENDING: 'قيد الانتظار',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
  APPROVED: 'موافق عليه',

  // TicketPriority
  LOW: 'منخفض',
  MEDIUM: 'متوسط',
  HIGH: 'عالي',
  URGENT: 'عاجل',

  // ChatType
  COMMUNITY_GROUP: 'مجموعة مجتمعية',
  ONE_TO_ONE: 'محادثة خاصة',
  SERVICE_CHAT: 'محادثة خدمة',

  // MessageType
  TEXT: 'نص',
  IMAGE: 'صورة',
  VOICE_NOTE: 'ملاحظة صوتية',
  FILE: 'ملف',
  POLL: 'تصويت',
  SYSTEM: 'نظام',
};

const enumFieldsToTranslate = new Set([
  'status',
  'jobType',
  'role',
  'priority',
  'type',
]);

@Injectable()
export class LanguageService {
  /**
   * Validate and normalize language parameter
   */
  validateLanguage(lang?: string): SupportedLanguage {
    if (!lang) {
      return 'en'; // Default to English
    }
    
    const normalizedLang = lang.toLowerCase();
    if (normalizedLang === 'ar' || normalizedLang === 'arabic') {
      return 'ar';
    }
    
    return 'en'; // Default to English for any other value
  }

  /**
   * Extract the appropriate language value from a translation object
   */
  extractTranslation(translationObj: any, lang: SupportedLanguage): string {
    if (!translationObj || typeof translationObj !== 'object') {
      return '';
    }
    
    return translationObj[lang] || translationObj['en'] || '';
  }

  /**
   * Transform an object with translation fields to return only the requested language
   */
  transformObjectForLanguage<T extends Record<string, any>>(
    obj: T,
    lang: SupportedLanguage,
    translatableFields: (keyof T)[] = []
  ): T {
    if (!obj) return obj;

    const result = { ...obj } as any;

    // If no translatable fields specified, try to detect them
    if (translatableFields.length === 0) {
      translatableFields = Object.keys(obj).filter(key => 
        obj[key] && 
        typeof obj[key] === 'object' && 
        (obj[key].en !== undefined || obj[key].ar !== undefined)
      ) as (keyof T)[];
    }

    // Transform translatable fields
    for (const field of translatableFields) {
      if (obj[field] && typeof obj[field] === 'object') {
        result[field] = this.extractTranslation(obj[field], lang);
      }
    }

    // Transform enums if lang is Arabic
    if (lang === 'ar') {
      for (const field of Object.keys(obj)) {
        if (
          enumFieldsToTranslate.has(field) &&
          typeof obj[field] === 'string' &&
          enumTranslations[obj[field]]
        ) {
          result[field] = enumTranslations[obj[field]];
        }
      }
    }

    return result;
  }

  /**
   * Transform an array of objects with translation fields
   */
  transformArrayForLanguage<T extends Record<string, any>>(
    array: T[],
    lang: SupportedLanguage,
    translatableFields: (keyof T)[] = []
  ): T[] {
    if (!Array.isArray(array)) return array;

    return array.map(item => this.transformObjectForLanguage(item, lang, translatableFields));
  }

  /**
   * Transform nested objects (like includes in Prisma queries)
   */
  transformNestedObjectForLanguage<T extends Record<string, any>>(
    obj: T,
    lang: SupportedLanguage,
    nestedTranslatableFields: Record<string, (keyof any)[]> = {}
  ): T {
    if (!obj) return obj;

    const result = { ...obj } as any;

    // Transform main object
    const mainTranslatableFields = Object.keys(obj).filter(key => 
      obj[key] && 
      typeof obj[key] === 'object' && 
      (obj[key].en !== undefined || obj[key].ar !== undefined) &&
      !Array.isArray(obj[key])
    ) as (keyof T)[];

    for (const field of mainTranslatableFields) {
      if (obj[field] && typeof obj[field] === 'object' && !Array.isArray(obj[field])) {
        result[field] = this.extractTranslation(obj[field], lang);
      }
    }

    // Transform main object enums if lang is Arabic
    if (lang === 'ar') {
      for (const field of Object.keys(obj)) {
        if (
          enumFieldsToTranslate.has(field) &&
          typeof obj[field] === 'string' &&
          enumTranslations[obj[field]]
        ) {
          result[field] = enumTranslations[obj[field]];
        }
      }
    }

    // Transform nested objects
    for (const [nestedKey, nestedFields] of Object.entries(nestedTranslatableFields)) {
      if (obj[nestedKey]) {
        if (Array.isArray(obj[nestedKey])) {
          result[nestedKey] = this.transformArrayForLanguage(obj[nestedKey], lang, nestedFields);
        } else if (typeof obj[nestedKey] === 'object') {
          result[nestedKey] = this.transformObjectForLanguage(obj[nestedKey], lang, nestedFields);
        }
      }
    }

    return result;
  }

  /**
   * Transform nested arrays (like includes in Prisma queries)
   */
  transformNestedArrayForLanguage<T extends Record<string, any>>(
    array: T[],
    lang: SupportedLanguage,
    nestedTranslatableFields: Record<string, (keyof any)[]> = {}
  ): T[] {
    if (!Array.isArray(array)) return array;

    return array.map(item => this.transformNestedObjectForLanguage(item, lang, nestedTranslatableFields));
  }
}
