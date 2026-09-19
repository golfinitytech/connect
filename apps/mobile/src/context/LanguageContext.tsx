import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { translations, Language, TranslationKeys } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLang] = useState<Language>('en');

  useEffect(() => {
    // Load saved language on mount
    const loadLang = async () => {
      try {
        const savedLang = await SecureStore.getItemAsync('app_language');
        if (savedLang && (savedLang in translations)) {
          setLang(savedLang as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };
    loadLang();
  }, []);

  const setLanguage = async (lang: Language) => {
    setLang(lang);
    try {
      await SecureStore.setItemAsync('app_language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
