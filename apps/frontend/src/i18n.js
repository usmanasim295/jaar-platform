"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

if (!i18n.isInitialized) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      supportedLngs: ["en", "ar"],
      interpolation: { escapeValue: false },
      backend: {
        loadPath: "/locales/{{lng}}/translation.json",
        allowMultiLoading: false,
        crossDomain: false,
        // Add error handling for missing translation files
        loadPathOptions: {
          addPath: "/locales/{{lng}}/translation.json",
        },
      },
      detection: {
        order: ["querystring", "cookie", "localStorage", "navigator"],
      },
      // Add error handling
      saveMissing: false,
      missingKeyHandler: (lng, ns, key) => {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      },
      // Add fallback resources
      resources: {
        en: {
          translation: {
            // Add some basic fallback translations
            "Find Jobs": "Find Jobs",
            "Messages": "Messages",
            "Sign In": "Sign In",
            "Sign Up": "Sign Up",
          }
        },
        ar: {
          translation: {
            "Find Jobs": "ابحث عن وظيفة",
            "Messages": "الرسائل", 
            "Sign In": "تسجيل الدخول",
            "Sign Up": "إنشاء حساب",
          }
        }
      }
    });
}

export default i18n;
