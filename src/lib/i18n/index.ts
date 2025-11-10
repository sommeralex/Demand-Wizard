import { de } from './locales/de';
import { en } from './locales/en';

export type Locale = 'de' | 'en';
export type TranslationKeys = typeof de;

const translations = {
  de,
  en,
} as const;

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] as TranslationKeys;
}

export { de, en };
