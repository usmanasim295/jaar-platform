'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { CONFIG } from './lib/config';

// Only initialize in browser environment
if (typeof window !== 'undefined' && !i18n.isInitialized) {
  // Get default language from config or fallback to Arabic
  const defaultLang = CONFIG.DEFAULT_LANGUAGE || 'ar';

  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: defaultLang, // Explicitly set initial language
      fallbackLng: defaultLang,
      supportedLngs: ['en', 'ar'],
      interpolation: { escapeValue: false },
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      detection: {
        order: ['localStorage', 'querystring', 'cookie', 'navigator'], // Check localStorage first
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
