// Malzeme metni ayrıştırma: "Toplu yapıştır" için saf yardımcılar.

export const COMMON_UNITS = [
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

// Yaygın yazım varyasyonları -> standart birim
const UNIT_ALIASES = {
  g: "gr",
  gram: "gr",
  kilo: "kg",
  litre: "lt",
  l: "lt",
  "yk": "yemek kaşığı",
  "tk": "tatlı kaşığı",
  "çk": "çay kaşığı",
};

const AMOUNT_RE =
  /^\s*((?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|\d*\s*[¼½¾⅓⅔⅛])(?:\s*-\s*(?:\d+\/\d+|\d+(?:[.,]\d+)?))?)\s*(.*)$/;

const lower = (s) => s.toLocaleLowerCase("tr-TR");

/** Tek bir satırı { amount, unit, name } yapısına çevirir. */
export const parseIngredientLine = (line) => {
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
  const lowered = lower(text);
  const units = [...COMMON_UNITS].sort((a, b) => b.length - a.length);
  const found = units.find(
    (u) => lowered === u || lowered.startsWith(`${u} `)
  );
  if (found) {
    unit = found;
    text = text.slice(found.length).trim();
  } else {
    const firstWord = lowered.split(/\s+/)[0].replace(/\.$/, "");
    if (UNIT_ALIASES[firstWord] && lowered.includes(" ")) {
      unit = UNIT_ALIASES[firstWord];
      text = text.slice(text.indexOf(" ") + 1).trim();
    }
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
export const parseIngredientLines = (text) =>
  String(text || "")
    .split(/\r?\n/)
    .map(parseIngredientLine)
    .filter(Boolean);
