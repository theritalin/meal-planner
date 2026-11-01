// Tarif sayfası için "tek sayfaya sığdırma" (auto-fit) hesaplayıcısı.
//
// Saf (pure) fonksiyonlardır: react-pdf'e bağımlı değildir, böylece hem
// CookbookDocument hem de testler aynı ölçüleri kullanır. Metin yüksekliği,
// sütun genişliği + yazı boyutu + ortalama karakter genişliği ile kelime
// kaydırma simülasyonu yapılarak tahmin edilir. Tahmin bilinçli olarak biraz
// "kötümser" tutulur (taşıp ikinci sayfaya geçmektense biraz küçük yazı tercih
// edilir).

import { formatIngredient } from "../../utils/recipes";

// ---- Sayfa geometrisi (pt) ----
export const PAGE = {
  width: 595.28, // A4
  height: 841.89,
  marginTop: 50,
  marginBottom: 62, // altbilgi bu boşluğa yerleşir
  marginX: 54,
};
export const CONTENT_WIDTH = PAGE.width - PAGE.marginX * 2;
export const CONTENT_HEIGHT = PAGE.height - PAGE.marginTop - PAGE.marginBottom;

/** Büyükten küçüğe denenecek ölçek değerleri. */
export const SCALE_PRESETS = [1, 0.92, 0.85, 0.78, 0.72, 0.66];
export const MIN_SCALE = SCALE_PRESETS[SCALE_PRESETS.length - 1];

// Ortalama karakter genişliği (em cinsinden). Inter görece geniş bir yazı
// tipidir; Türkçe metinde ~0.5em ölçülür, güvenlik payıyla yukarı yuvarlanır.
const CHAR_W = { sans: 0.53, sansBold: 0.56, serif: 0.52, serifItalic: 0.47 };

// İki sütunlu düzende sol (malzemeler) sütunun payı.
export const LEFT_COLUMN_RATIO = 0.36;

/**
 * Verilen ölçek için tüm yazı boyutları ve boşluklar.
 * CookbookDocument stilleri doğrudan bu değerlerden üretilir.
 */
export const metricsFor = (scale = 1) => {
  const s = scale;
  const gutter = 26 * s;
  const leftWidth = (CONTENT_WIDTH - gutter) * LEFT_COLUMN_RATIO;
  return {
    scale: s,
    kickerSize: 7.5 * s,
    kickerGap: 6 * s,
    titleSize: 26 * s,
    titleLineHeight: 1.18,
    titleGap: 12 * s,
    metaLabelSize: 6.5 * s,
    metaValueSize: 12 * s,
    metaPadY: 8 * s,
    metaGap: 14 * s,
    descSize: 11 * s,
    descLineHeight: 1.5,
    descGap: 14 * s,
    ruleGap: 16 * s,
    sectionTitleSize: 14 * s,
    sectionTitleGap: 10 * s,
    ingSize: 9.5 * s,
    ingLineHeight: 1.45,
    ingGap: 5 * s,
    ingBullet: 10 * s,
    leftPad: 14 * s,
    stepSize: 10 * s,
    stepLineHeight: 1.55,
    stepGap: 9 * s,
    stepNumWidth: 22 * s,
    notesSize: 9.5 * s,
    notesLineHeight: 1.5,
    notesPad: 12 * s,
    notesGap: 18 * s,
    gutter,
    leftWidth,
    rightWidth: CONTENT_WIDTH - gutter - leftWidth,
  };
};

/**
 * Greedy kelime kaydırma ile satır sayısı tahmini.
 * @param {string} text
 * @param {number} width  kullanılabilir genişlik (pt)
 * @param {number} fontSize
 * @param {number} charEm ortalama karakter genişliği (em)
 */
export const estimateLines = (text, width, fontSize, charEm = CHAR_W.sans) => {
  const str = (text ?? "").toString().trim();
  if (!str) return 0;
  const cw = fontSize * charEm;
  const maxChars = Math.max(1, Math.floor(width / cw));
  let lines = 0;
  str.split(/\n+/).forEach((para) => {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) return;
    let current = 0;
    lines += 1;
    words.forEach((word) => {
      const len = word.length;
      // Satırdan uzun kelime: kırılarak birden fazla satır kaplar.
      if (len > maxChars) {
        if (current > 0) lines += 1;
        const chunks = Math.ceil(len / maxChars);
        lines += chunks - 1;
        current = len - (chunks - 1) * maxChars;
        return;
      }
      const needed = current === 0 ? len : current + 1 + len;
      if (needed > maxChars) {
        lines += 1;
        current = len;
      } else {
        current = needed;
      }
    });
  });
  return lines;
};

const textHeight = (text, width, size, lineHeight, charEm) =>
  estimateLines(text, width, size, charEm) * size * lineHeight;

const ingredientsOf = (recipe) =>
  (recipe?.ingredients || []).map(formatIngredient).filter(Boolean);

const stepsOf = (recipe) =>
  (recipe?.instructions || [])
    .map((s) => (typeof s === "string" ? s : s?.text || ""))
    .filter((s) => s.trim());

/** Başlık + meta + açıklama bölümünün yüksekliği. */
const headerHeight = (recipe, m) => {
  let h = m.kickerSize * 1.3 + m.kickerGap;
  h +=
    textHeight(
      recipe?.name || "İsimsiz tarif",
      CONTENT_WIDTH,
      m.titleSize,
      m.titleLineHeight,
      CHAR_W.serif
    ) + m.titleGap;
  // meta satırı: etiket + değer + üst/alt çizgi boşlukları
  h += m.metaLabelSize * 1.3 + 3 + m.metaValueSize * 1.25 + m.metaPadY * 2;
  h += m.metaGap;
  if (recipe?.description) {
    h +=
      textHeight(
        recipe.description,
        CONTENT_WIDTH,
        m.descSize,
        m.descLineHeight,
        CHAR_W.serifItalic
      ) + m.descGap;
  }
  return h;
};

const sectionTitleHeight = (m) => m.sectionTitleSize * 1.3 + m.sectionTitleGap;

const ingredientsHeight = (items, width, m) =>
  items.reduce(
    (sum, text) =>
      sum +
      textHeight(text, width - m.ingBullet, m.ingSize, m.ingLineHeight) +
      m.ingGap,
    0
  );

const stepsHeight = (steps, width, m) =>
  steps.reduce(
    (sum, text) =>
      sum +
      Math.max(
        textHeight(text, width - m.stepNumWidth, m.stepSize, m.stepLineHeight),
        m.stepSize * m.stepLineHeight
      ) +
      m.stepGap,
    0
  );

const notesHeight = (recipe, m) => {
  if (!recipe?.notes || !String(recipe.notes).trim()) return 0;
  return (
    m.notesGap +
    m.notesPad * 2 +
    m.sectionTitleSize * 0.85 * 1.3 +
    6 * m.scale +
    textHeight(
      recipe.notes,
      CONTENT_WIDTH - m.notesPad * 2 - 3,
      m.notesSize,
      m.notesLineHeight
    )
  );
};

/** İki sütunlu düzenin toplam yüksekliği (pt). */
export const estimateTwoColumnHeight = (recipe, scale) => {
  const m = metricsFor(scale);
  const ings = ingredientsOf(recipe);
  const steps = stepsOf(recipe);
  const left =
    m.leftPad * 2 +
    sectionTitleHeight(m) +
    ingredientsHeight(ings, m.leftWidth - m.leftPad * 2, m);
  const right = sectionTitleHeight(m) + stepsHeight(steps, m.rightWidth, m);
  return (
    headerHeight(recipe, m) +
    m.ruleGap +
    Math.max(left, right) +
    notesHeight(recipe, m)
  );
};

/**
 * Tek sütunlu (kompakt) düzen: malzemeler tam genişlikte iki alt sütun,
 * ardından adımlar tam genişlikte.
 */
export const estimateSingleColumnHeight = (recipe, scale) => {
  const m = metricsFor(scale);
  const ings = ingredientsOf(recipe);
  const steps = stepsOf(recipe);
  const half = (CONTENT_WIDTH - m.gutter) / 2;
  const mid = Math.ceil(ings.length / 2);
  const colA = ingredientsHeight(ings.slice(0, mid), half, m);
  const colB = ingredientsHeight(ings.slice(mid), half, m);
  return (
    headerHeight(recipe, m) +
    m.ruleGap +
    sectionTitleHeight(m) +
    Math.max(colA, colB) +
    m.ruleGap +
    sectionTitleHeight(m) +
    stepsHeight(steps, CONTENT_WIDTH, m) +
    notesHeight(recipe, m)
  );
};

// Tahmin hatasına karşı güvenlik payı.
const SAFETY = 0.96;
const AVAILABLE = CONTENT_HEIGHT * SAFETY;

/**
 * Tarifin tek sayfaya sığacağı en büyük ölçeği ve düzeni seçer.
 * @returns {{ scale: number, layout: 'two-column'|'single-column',
 *             estimatedPages: number, estimatedHeight: number }}
 */
export const computeRecipeLayout = (recipe) => {
  for (const scale of SCALE_PRESETS) {
    const h = estimateTwoColumnHeight(recipe, scale);
    if (h <= AVAILABLE) {
      return {
        scale,
        layout: "two-column",
        estimatedPages: 1,
        estimatedHeight: h,
      };
    }
  }
  const h = estimateSingleColumnHeight(recipe, MIN_SCALE);
  return {
    scale: MIN_SCALE,
    layout: "single-column",
    estimatedPages: Math.max(1, Math.ceil(h / AVAILABLE)),
    estimatedHeight: h,
  };
};

// ---- İçindekiler sayfalaması ----
export const TOC = {
  firstPageEntries: 22, // başlık bloğu nedeniyle daha az
  entriesPerPage: 28,
};

export const tocPageCount = (count) => {
  if (count <= TOC.firstPageEntries) return 1;
  return 1 + Math.ceil((count - TOC.firstPageEntries) / TOC.entriesPerPage);
};

/**
 * Kitap planı: her tarifin düzeni ve başladığı sayfa numarası.
 * Sayfa 1 = kapak, ardından içindekiler, sonra tarifler.
 */
export const planCookbook = (recipes, { cover = true, toc = true } = {}) => {
  const list = recipes || [];
  const tocPages = toc && list.length ? tocPageCount(list.length) : 0;
  let page = (cover ? 1 : 0) + tocPages + 1;
  const entries = list.map((recipe) => {
    const layout = computeRecipeLayout(recipe);
    const entry = { recipe, ...layout, startPage: page };
    page += layout.estimatedPages;
    return entry;
  });
  return { tocPages, entries, totalPages: page - 1 };
};
