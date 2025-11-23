'use client';

import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { locales, defaultLocale, type Locale, LOCALE_STORAGE_KEY } from '@/lib/i18n/config';
import { messages, type Messages } from '@/lib/i18n/messages';
import { getNestedValue } from '@/lib/i18n/messages';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  // Load locale from storage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
    } else {
      // Try to detect from browser
      const browserLang = navigator.language.split('-')[0];
      if (locales.includes(browserLang as Locale)) {
        setLocaleState(browserLang as Locale);
      }
    }
  }, []);

  // Update html lang attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined' && mounted) {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  // Save locale to storage when changed
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  };

  // Translation function - use useCallback to ensure it updates when locale changes
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Get messages for current locale, fallback to English if locale not found
    const currentMessages = messages[locale] || messages.en;
    let translated = getNestedValue(currentMessages, key);
    
    // If translation not found, try English as fallback
    if (translated === key && locale !== 'en') {
      translated = getNestedValue(messages.en, key);
    }
    
    // Replace parameters in translation
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translated = translated.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return translated;
  }, [locale]);

  // Always provide context, even before mounted to prevent errors
  // Use default locale until mounted and localStorage is read
  const contextValue = useMemo(() => mounted 
    ? { locale, setLocale, t }
    : { 
        locale: defaultLocale, 
        setLocale: () => {
          // No-op until mounted
        }, 
        t: (key: string, params?: Record<string, string | number>) => {
          // Fallback: return key or translated value if available
          const defaultMessages = messages[defaultLocale];
          const translated = getNestedValue(defaultMessages, key);
          if (params) {
            return translated.replace(/\{(\w+)\}/g, (match, paramKey) => {
              return params[paramKey] ? String(params[paramKey]) : match;
            });
          }
          return translated;
        }
      }, [mounted, locale, setLocale, t]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

