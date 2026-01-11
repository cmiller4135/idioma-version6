import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English locale files
import enCommon from './locales/en/common.json';
import enNavigation from './locales/en/navigation.json';
import enTools from './locales/en/tools.json';
import enTeach from './locales/en/teach.json';
import enQuiz from './locales/en/quiz.json';
import enHome from './locales/en/home.json';
import enProfile from './locales/en/profile.json';
import enAuth from './locales/en/auth.json';

// Spanish locale files
import esCommon from './locales/es/common.json';
import esNavigation from './locales/es/navigation.json';
import esTools from './locales/es/tools.json';
import esTeach from './locales/es/teach.json';
import esQuiz from './locales/es/quiz.json';
import esHome from './locales/es/home.json';
import esProfile from './locales/es/profile.json';
import esAuth from './locales/es/auth.json';

// French locale files
import frCommon from './locales/fr/common.json';
import frNavigation from './locales/fr/navigation.json';
import frTools from './locales/fr/tools.json';
import frTeach from './locales/fr/teach.json';
import frQuiz from './locales/fr/quiz.json';
import frHome from './locales/fr/home.json';
import frProfile from './locales/fr/profile.json';
import frAuth from './locales/fr/auth.json';

// Portuguese locale files
import ptCommon from './locales/pt/common.json';
import ptNavigation from './locales/pt/navigation.json';
import ptTools from './locales/pt/tools.json';
import ptTeach from './locales/pt/teach.json';
import ptQuiz from './locales/pt/quiz.json';
import ptHome from './locales/pt/home.json';
import ptProfile from './locales/pt/profile.json';
import ptAuth from './locales/pt/auth.json';

export const supportedLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷', nativeName: 'Português' },
] as const;

export type SupportedLanguage = typeof supportedLanguages[number]['code'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        navigation: enNavigation,
        tools: enTools,
        teach: enTeach,
        quiz: enQuiz,
        home: enHome,
        profile: enProfile,
        auth: enAuth,
      },
      es: {
        common: esCommon,
        navigation: esNavigation,
        tools: esTools,
        teach: esTeach,
        quiz: esQuiz,
        home: esHome,
        profile: esProfile,
        auth: esAuth,
      },
      fr: {
        common: frCommon,
        navigation: frNavigation,
        tools: frTools,
        teach: frTeach,
        quiz: frQuiz,
        home: frHome,
        profile: frProfile,
        auth: frAuth,
      },
      pt: {
        common: ptCommon,
        navigation: ptNavigation,
        tools: ptTools,
        teach: ptTeach,
        quiz: ptQuiz,
        home: ptHome,
        profile: ptProfile,
        auth: ptAuth,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'tools', 'teach', 'quiz', 'home', 'profile', 'auth'],
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

export default i18n;
