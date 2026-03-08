"use client";

import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/app/data/translations";

export type TranslationsMap = Record<string, string>;

export function useTranslation(): TranslationsMap {
  const { lang } = useLanguage();
  return (translations as any)[lang] ?? translations.en;
}
