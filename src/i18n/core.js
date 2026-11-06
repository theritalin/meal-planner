// Hafif çeviri çekirdeği (React'e bağımlı değil; PDF ve servis kodunda da kullanılabilir).
import tr from "./locales/tr";
import en from "./locales/en";

export const LANGUAGES = [
  { code: "tr", label: "Türkçe", short: "TR", locale: "tr-TR" },
  { code: "en", label: "English", short: "EN", locale: "en-US" },
];
export const DEFAULT_LANG = "tr";
const STORAGE_KEY = "mp_lang";
const DICTS = { tr, en };

export const isSupported = (code) => LANGUAGES.some((l) => l.code === code);
export const localeOf = (lang) =>
  (LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]).locale;

/** Kayıtlı dil; yoksa varsayılan (Türkçe). */
export const loadLang = () => {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isSupported(v) ? v : DEFAULT_LANG;
  } catch (e) {
    return DEFAULT_LANG;
  }
};

export const storeLang = (lang) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (e) {
    /* yoksay */
  }
};

let currentLang = typeof window !== "undefined" ? loadLang() : DEFAULT_LANG;
export const getLang = () => currentLang;
export const setCurrentLang = (lang) => {
  currentLang = isSupported(lang) ? lang : DEFAULT_LANG;
};

const lookup = (dict, key) =>
  key
    .split(".")
    .reduce((node, part) => (node == null ? node : node[part]), dict);

/**
 * Çeviri: t("planner.title"), t("recipes.count", { count: 3 }).
 * Değer bir fonksiyonsa parametrelerle çağrılır; metindeki {ad} yer tutucuları doldurulur.
 * Bulunamazsa Türkçeye, o da yoksa anahtarın kendisine düşer.
 */
export const translate = (lang, key, params) => {
  let value = lookup(DICTS[lang] || DICTS[DEFAULT_LANG], key);
  if (value == null && lang !== DEFAULT_LANG)
    value = lookup(DICTS[DEFAULT_LANG], key);
  if (value == null) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.warn(`[i18n] eksik çeviri: ${lang}:${key}`);
    }
    return key;
  }
  if (typeof value === "function") return value(params || {});
  if (typeof value !== "string" || !params) return value;
  return value.replace(/\{(\w+)\}/g, (m, name) =>
    params[name] !== undefined ? String(params[name]) : m,
  );
};

/** React dışı kod için: geçerli dilde çeviri. */
export const t = (key, params) => translate(currentLang, key, params);

/** Geçerli dile göre tarih biçimlendirme. */
export const formatDate = (date, options, lang = currentLang) =>
  new Date(date).toLocaleDateString(localeOf(lang), options);

export const formatNumber = (n, options, lang = currentLang) =>
  Number(n).toLocaleString(localeOf(lang), options);
