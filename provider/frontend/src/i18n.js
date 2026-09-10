import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationHI from './locales/hi/translation.json';
import translationPA from './locales/pa/translation.json';
import translationBN from './locales/bn/translation.json';
import translationGU from './locales/gu/translation.json';
import translationRAJ from './locales/raj/translation.json';
import translationHAR from './locales/har/translation.json';

const resources = {
  en: {
    translation: translationEN,
  },
  hi: {
    translation: translationHI,
  },
  pa: {
    translation: translationPA,
  },
  bn: {
    translation: translationBN,
  },
  gu: {
    translation: translationGU,
  },
  raj: {
    translation: translationRAJ,
  },
  har: {
    translation: translationHAR,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
