"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "sw";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang?: Language }) {
  const [lang, setLang] = useState<Language>(initialLang ?? "en");

  // Hii inasaidia kukumbuka lugha mteja aliyochagua hata akirefresh page
  useEffect(() => {
    const savedLang = localStorage.getItem("bahmad_lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
localStorage.setItem("bahmad_lang", newLang);
  };

  // persist user preference server-side (fire-and-forget)
  const persistPreference = (newLang: Language) => {
    try {
      fetch('/api/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang: newLang })
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  const handleSetLangWithPersist = (newLang: Language) => {
    handleSetLang(newLang);
    persistPreference(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLangWithPersist }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage lazima itumike ndani ya LanguageProvider");
  }
  return context;
}