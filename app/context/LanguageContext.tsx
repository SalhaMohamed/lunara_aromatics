"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "sw";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang = "sw" }: { children: React.ReactNode; initialLang?: Language }) {
  // Tunaanza na initialLang ambayo tumeset iwe "sw"
  const [lang, setLang] = useState<Language>(initialLang);

  // 1. Pakia lugha iliyohifadhiwa mara tu component inapoingia kwenye browser
  useEffect(() => {
    const savedLang = localStorage.getItem("bahmad_lang") as Language;
    if (savedLang && savedLang !== lang) {
      setLang(savedLang);
    }
  }, []);

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("bahmad_lang", newLang);
    
    // 2. Persist to API (Fire and forget)
    fetch('/api/language', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang: newLang })
    }).catch(() => {
      // Tunapuuza error hapa ili isisumbue uzoefu wa mteja
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
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