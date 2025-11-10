"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, getTranslations } from '../lib/i18n';
import { TranslationKeys } from '../lib/i18n/locales/de';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const LOCALE_STORAGE_KEY = 'demand-wizard-locale';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('de');
  const [translations, setTranslations] = useState<TranslationKeys>(getTranslations('de'));

  // Load locale from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
    if (stored && (stored === 'de' || stored === 'en')) {
      setLocaleState(stored);
      setTranslations(getTranslations(stored));
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    setTranslations(getTranslations(newLocale));
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: translations }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
