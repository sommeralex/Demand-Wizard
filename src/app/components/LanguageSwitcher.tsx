"use client";

import { useI18n } from '../../context/I18nContext';
import { Locale } from '../../lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLocale('de')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          locale === 'de'
            ? 'bg-[#005A9C] text-white'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        🇩🇪 DE
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-[#005A9C] text-white'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
