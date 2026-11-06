// Malzeme metni ayrıştırma: "Toplu yapıştır" için saf yardımcılar.

import { getLang } from "../../i18n/core";

// Türkçe birim listesi (birim Autocomplete'i ve ayrıştırma için).
export const COMMON_UNITS_TR = [
  "adet",
  "gr",
  "kg",
  "ml",
  "lt",
  "su bardağı",
  "çay bardağı",
  "yemek kaşığı",
  "tatlı kaşığı",
  "çay kaşığı",
  "tutam",
  "diş",
  "demet",
  "paket",
];

// İngilizce birim listesi.
export const COMMON_UNITS_EN = [
  "g",
  "kg",
  "ml",
  "l",
  "cup",
  "tbsp",
  "tsp",
  "piece",
  "pinch",
  "clove",
  "bunch",
  "pack",
  "can",
  "slice",
];

/** Geriye dönük uyumluluk: varsayılan (Türkçe) liste. */
export const COMMON_UNITS = COMMON_UNITS_TR;

const UNITS = { tr: COMMON_UNITS_TR, en: COMMON_UNITS_EN };

/** Dile uygun birim listesi (form Autocomplete'i için). */
export const getCommonUnits = (lang = getLang()) => UNITS[lang] || COMMON_UNITS_TR;

// Yaygın yazım varyasyonları -> o dilin standart birimi
const UNIT_ALIASES = {
  tr: {
    g: "gr",
    gram: "gr",
    kilo: "kg",
    litre: "lt",
    l: "lt",
    yk: "yemek kaşığı",
    tk: "tatlı kaşığı",
    çk: "çay kaşığı",
  },
  en: {
    gr: "g",
    gram: "g",
    grams: "g",
    kilo: "kg",
    kilos: "kg",
    lt: "l",
    liter: "l",
    liters: "l",
    litre: "l",
    litres: "l",
    cups: "cup",
    tablespoon: "tbsp",
    tablespoons: "tbsp",
    tbs: "tbsp",
    teaspoon: "tsp",
    teaspoons: "tsp",
    pieces: "piece",
    pcs: "piece",
    pinches: "pinch",
    cloves: "clove",
    bunches: "bunch",
    packs: "pack",
    package: "pack",
    packages: "pack",
    cans: "can",
    slices: "slice",
  },
};

// Tüm dillerdeki birimler (uzun olan önce eşleşsin).
const ALL_UNITS = [...new Set([...COMMON_UNITS_TR, ...COMMON_UNITS_EN])].sort(
  (a, b) => b.length - a.length
);
const ALL_ALIASES = [
  ...new Set([...Object.keys(UNIT_ALIASES.tr), ...Object.keys(UNIT_ALIASES.en)]),
];

/**
 * Bulunan birim belirtecini geçerli dile göre standartlaştırır:
 * önce o dilin birimi / takma adı, sonra diğer dilin birimi / takma adı.
 */
const canonicalUnit = (token, lang) => {
  const own = UNITS[lang] ? lang : "tr";
  const other = own === "tr" ? "en" : "tr";
  if (UNITS[own].includes(token)) return token;
  if (UNIT_ALIASES[own][token]) return UNIT_ALIASES[own][token];
  if (UNITS[other].includes(token)) return token;
  return UNIT_ALIASES[other][token] || token;
};

const AMOUNT_RE =
  /^\s*((?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|\d*\s*[¼½¾⅓⅔⅛])(?:\s*-\s*(?:\d+\/\d+|\d+(?:[.,]\d+)?))?)\s*(.*)$/;


/**
 * Tek bir satırı { amount, unit, name } yapısına çevirir.
 * Türkçe ve İngilizce birimler dilden bağımsız tanınır; takma adlar
 * ("g", "cups"…) mümkünse `lang` dilinin standart birimine çevrilir.
 */
export const parseIngredientLine = (line, lang = getLang()) => {
  let text = String(line || "")
    .replace(/^\s*(?:[-*•·]|\d+[.)])\s+/, "") // madde işaretleri / numaralar
    .trim();
  if (!text) return null;

  let amount = "";
  const m = text.match(AMOUNT_RE);
  if (m && m[2] !== undefined) {
    amount = m[1].replace(/\s+/g, " ").trim();
    text = m[2].trim();
  }

  let unit = "";
  // Türkçe (I -> ı) ve genel küçük harf dönüşümleri ayrı ayrı denenir.
  const lowerings = [text.toLocaleLowerCase("tr-TR"), text.toLowerCase()];
  let match = null;
  for (const lowered of lowerings) {
    const found = ALL_UNITS.find(
      (u) => lowered === u || lowered.startsWith(`${u} `)
    );
    if (found) {
      match = { token: found, length: found.length };
      break;
    }
    const firstWord = lowered.split(/\s+/)[0];
    const bare = firstWord.replace(/\.$/, "");
    if (lowered.includes(" ") && ALL_ALIASES.includes(bare)) {
      match = { token: bare, length: firstWord.length };
      break;
    }
  }
  if (match) {
    unit = canonicalUnit(match.token, lang);
    text = text.slice(match.length).trim();
  }

  if (!text) {
    // Sadece birim/miktar yazıldıysa birimi isim olarak kullan
    if (!unit) return null;
    text = unit;
    unit = "";
  }

  return { amount, unit, name: text };
};

/** Çok satırlı metni malzeme listesine çevirir (boş satırlar atlanır). */
export const parseIngredientLines = (text, lang = getLang()) =>
  String(text || "")
    .split(/\r?\n/)
    .map((line) => parseIngredientLine(line, lang))
    .filter(Boolean);
