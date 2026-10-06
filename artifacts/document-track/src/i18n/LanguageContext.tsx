import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { LANGUAGES, translations, type Language } from './translations';
import { Globe, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const STORAGE_KEY = 'documenttrack_language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        return saved as Language;
      }
    } catch {
      // Ignore localStorage read errors
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore localStorage write errors
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const { recordActivity } = useApp();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const selectLanguage = (langCode: Language) => {
    setLanguage(langCode);
    const selected = LANGUAGES.find((l) => l.code === langCode);
    if (selected) {
      recordActivity(
        'language_change',
        `Changed language to ${selected.name} (${selected.nativeName})`,
        `Language setting updated to ${selected.name}`,
        { code: langCode, name: selected.name }
      );
    }
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} data-testid="language-selector">
      <button
        type="button"
        className="btn btn-ghost"
        style={{
          minHeight: 36,
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#334155',
        }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Select language"
        data-testid="button-language-dropdown"
      >
        <Globe size={15} color="#475569" />
        <span>{currentLang.nativeName}</span>
        <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 90 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 6,
              width: 170,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e2e8f0',
              padding: '6px 0',
              zIndex: 100,
              maxHeight: 280,
              overflowY: 'auto',
            }}
            data-testid="language-menu"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 14px',
                  fontSize: 13,
                  backgroundColor: language === lang.code ? '#f1f5f9' : 'transparent',
                  fontWeight: language === lang.code ? 600 : 400,
                  color: language === lang.code ? '#0f172a' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => selectLanguage(lang.code)}
                data-testid={`option-lang-${lang.code}`}
              >
                <span>{lang.nativeName}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
