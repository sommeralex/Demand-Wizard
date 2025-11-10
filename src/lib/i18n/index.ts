import { de, TranslationKeys } from './locales/de';
import { en } from './locales/en';

export type Locale = 'de' | 'en';

const translations: Record<Locale, TranslationKeys> = {
  de,
  en: en as TranslationKeys,
} as const;

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale];
}

export { de, en };
export type { TranslationKeys };
