import enTranslations from '../data/translations/en.json';
import ruTranslations from '../data/translations/ru.json';
import elTranslations from '../data/translations/el.json';
import ukTranslations from '../data/translations/uk.json';

export const languages = {
  en: { code: 'en', name: 'English' },
  ru: { code: 'ru', name: 'Русский' },
  el: { code: 'el', name: 'Ελληνικά' },
  uk: { code: 'uk', name: 'Українська' },
} as const;

export type Language = keyof typeof languages;

export const defaultLanguage: Language = 'en';

const translations = {
  en: enTranslations,
  ru: ruTranslations,
  el: elTranslations,
  uk: ukTranslations,
};

export function getTranslations(lang: Language) {
  return translations[lang] || translations[defaultLanguage];
}

export function t(lang: Language, key: string): string {
  const trans = getTranslations(lang);
  const keys = key.split('.');

  let value: any = trans;
  for (const k of keys) {
    value = value?.[k];
  }

  return value || key;
}
