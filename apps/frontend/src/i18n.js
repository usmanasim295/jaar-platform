'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Only initialize in browser environment
if (typeof window !== 'undefined' && !i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      supportedLngs: ['en', 'ar'],
      interpolation: { escapeValue: false },
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator'],
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
