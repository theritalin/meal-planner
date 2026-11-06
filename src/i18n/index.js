import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_LANG,
  LANGUAGES,
  formatDate,
  formatNumber,
  loadLang,
  localeOf,
  setCurrentLang,
  storeLang,
  translate,
} from "./core";

export { LANGUAGES, DEFAULT_LANG, localeOf } from "./core";
export { t as tStatic, getLang, formatDate, formatNumber } from "./core";

const I18nContext = createContext(null);

export function LanguageProvider({ children, initialLang }) {
  const [lang, setLangState] = useState(() => initialLang || loadLang());

  // Modül düzeyindeki dil, React dışı kod (PDF, servisler) için senkron tutulur.
  setCurrentLang(lang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    setCurrentLang(next);
    storeLang(next);
    setLangState(next);
  }, []);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      locale: localeOf(lang),
      t: (key, params) => translate(lang, key, params),
      formatDate: (d, o) => formatDate(d, o, lang),
      formatNumber: (n, o) => formatNumber(n, o, lang),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** { lang, setLang, locale, t, formatDate, formatNumber } */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (ctx) return ctx;
  // Sağlayıcı dışında (ör. testler) varsayılan Türkçe ile çalış.
  return {
    lang: DEFAULT_LANG,
    setLang: () => {},
    locale: localeOf(DEFAULT_LANG),
    t: (key, params) => translate(DEFAULT_LANG, key, params),
    formatDate: (d, o) => formatDate(d, o, DEFAULT_LANG),
    formatNumber: (n, o) => formatNumber(n, o, DEFAULT_LANG),
  };
}

export const useT = () => useI18n().t;

export const languageLabel = (code) =>
  (LANGUAGES.find((l) => l.code === code) || LANGUAGES[0]).label;
