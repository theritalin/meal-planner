// Porsiyon ölçekleme için saf yardımcı fonksiyonlar.
//
// Desteklenen miktar biçimleri: "2", "1.5", "1,5", "1/2", "1 1/2", "½",
// aralıklar ("2-3") ve sayının ardından gelen metin ("2 adet", "1/2 demet").
// Sayısal olmayan miktarlar ("bir tutam", "az") olduğu gibi bırakılır.
// Ayrıştırma dilden bağımsızdır; biçimlendirme dile uyar (TR "1,5", EN "1.5").

import { getLang } from "../../i18n/core";

const UNICODE_FRACTIONS = {
  "¼": 0.25,
  "½": 0.5,
  "¾": 0.75,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 0.125,
};

const NUMBER_TOKEN =
  "(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?|\\d*\\s*[¼½¾⅓⅔⅛])";
const LEADING_AMOUNT = new RegExp(
  `^\\s*(${NUMBER_TOKEN})(?:\\s*-\\s*(${NUMBER_TOKEN}))?(.*)$`
);

/** Tek bir sayısal belirteci sayıya çevirir; geçersizse null. */
export const parseNumberToken = (token) => {
  if (token === null || token === undefined) return null;
  const str = String(token).trim();
  if (!str) return null;

  const uni = str.match(/^(\d*)\s*([¼½¾⅓⅔⅛])$/);
  if (uni) {
    return (uni[1] ? parseInt(uni[1], 10) : 0) + UNICODE_FRACTIONS[uni[2]];
  }

  const mixed = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const den = parseInt(mixed[3], 10);
    if (!den) return null;
    return parseInt(mixed[1], 10) + parseInt(mixed[2], 10) / den;
  }

  const frac = str.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const den = parseInt(frac[2], 10);
    if (!den) return null;
    return parseInt(frac[1], 10) / den;
  }

  if (/^\d+(?:[.,]\d+)?$/.test(str)) {
    return parseFloat(str.replace(",", "."));
  }
  return null;
};

/**
 * Miktarın tamamı sayısalsa sayıyı döndürür ("1,5" -> 1.5, "1/2" -> 0.5).
 * Aralık veya metin içeren miktarlar için null döner.
 */
export const parseAmount = (amount) => {
  if (typeof amount === "number") return Number.isFinite(amount) ? amount : null;
  return parseNumberToken(amount);
};

/**
 * Sayıyı okunur biçime çevirir. Türkçe: 2 -> "2", 1.5 -> "1,5", 0.333 -> "0,33";
 * İngilizce: 1.5 -> "1.5".
 */
export const formatAmount = (value, lang = getLang()) => {
  if (!Number.isFinite(value)) return "";
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return String(rounded);
  return lang === "en" ? String(rounded) : String(rounded).replace(".", ",");
};

/**
 * Bir miktarı verilen katsayıyla ölçekler. Sayısal olmayan miktarlar
 * değişmeden döner; sayının ardındaki metin korunur.
 */
export const scaleAmount = (amount, factor, lang = getLang()) => {
  if (amount === null || amount === undefined || amount === "") return amount;
  if (!Number.isFinite(factor) || factor <= 0 || factor === 1) return amount;

  if (typeof amount === "number") {
    return Number.isFinite(amount) ? formatAmount(amount * factor, lang) : amount;
  }

  const match = String(amount).match(LEADING_AMOUNT);
  if (!match) return amount;

  const [, first, second, rest] = match;
  const a = parseNumberToken(first);
  if (a === null) return amount;

  let result = formatAmount(a * factor, lang);
  if (second !== undefined) {
    const b = parseNumberToken(second);
    if (b === null) return amount;
    result += `-${formatAmount(b * factor, lang)}`;
  }
  // "2adet" gibi bitişik metinlerde boşluk ekleme; aksi halde metni koru.
  return result + (rest || "");
};

/** Hedef porsiyon / temel porsiyon katsayısı (geçersiz girişte 1). */
export const getScaleFactor = (baseServings, targetServings) => {
  const base = Number(baseServings);
  const target = Number(targetServings);
  if (!base || !target || base <= 0 || target <= 0) return 1;
  return target / base;
};

/** Malzeme listesini ölçekler; yeni dizi döndürür, girdiyi değiştirmez. */
export const scaleIngredients = (ingredients, factor, lang = getLang()) => {
  if (!Array.isArray(ingredients)) return [];
  return ingredients.map((ing) => {
    if (!ing || typeof ing === "string") return ing;
    return { ...ing, amount: scaleAmount(ing.amount, factor, lang) };
  });
};
