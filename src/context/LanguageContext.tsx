import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations } from '../i18n/translations';

const STORAGE_KEY = 'app_language';
const DEFAULT_LANGUAGE: Language = 'bg';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Взима стойност по ключ във формат 'namespace.key' (напр. 'auth.loginTitle').
  // params позволява проста замяна на {{placeholder}} в текста.
  t: (key: string, params?: Record<string, string | number>) => string;
  // За масиви от преводи (напр. имена на месеци, дни от седмицата).
  tArray: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Извлича стойност от вложен обект по път 'a.b.c'.
const getNestedValue = (obj: any, path: string): any =>
  path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);

const interpolate = (text: string, params?: Record<string, string | number>): string => {
  if (!params) return text;
  return Object.keys(params).reduce(
    (result, key) => result.replace(new RegExp(`{{${key}}}`, 'g'), String(params[key])),
    text
  );
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'bg' || stored === 'en') {
          setLanguageState(stored);
        }
      } catch {
        // Ако AsyncStorage гръмне (напр. на web), просто оставаме на дефолтния език.
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch(() => {});
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[language];
    const value = getNestedValue(dict, key);
    if (typeof value !== 'string') {
      // Fallback към българския речник, а после към самия ключ, за да не се чупи UI-то.
      const fallback = getNestedValue(translations.bg, key);
      return typeof fallback === 'string' ? interpolate(fallback, params) : key;
    }
    return interpolate(value, params);
  };

  const tArray = (key: string): string[] => {
    const dict = translations[language];
    const value = getNestedValue(dict, key);
    if (Array.isArray(value)) return value;
    const fallback = getNestedValue(translations.bg, key);
    return Array.isArray(fallback) ? fallback : [];
  };

  // Изчакваме зареждането от AsyncStorage, за да не мигне грешен език при старт.
  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
