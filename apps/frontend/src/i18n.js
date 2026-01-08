'use client';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { CONFIG } from './lib/config';

if (!i18n.isInitialized) {
  const defaultLang = CONFIG.DEFAULT_LANGUAGE || 'ar';

  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: defaultLang,
      fallbackLng: defaultLang,
      supportedLngs: ['en', 'ar'],
      interpolation: { escapeValue: false },
      backend: {
        loadPath: '/locales/{{lng}}/translation.json',
      },
      detection: {
        order: ['localStorage', 'querystring', 'cookie', 'navigator'],
        lookupLocalStorage: 'i18nextLng',
        caches: ['localStorage'],
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
