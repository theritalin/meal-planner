// PDF'ler için Türkçe karakter destekli yazı tipleri.
//
// Dosyalar public/fonts/ altındadır (Inter + Playfair Display, OFL lisanslı,
// Latin + Latin Extended-A alt kümesine indirgenmiş). Tarayıcıda
// `${PUBLIC_URL}/fonts` üzerinden yüklenir; Node/Jest ortamında
// registerPdfFonts("/abs/path/public/fonts") ile yerel dosya yolu verilebilir.

import { Font } from "@react-pdf/renderer";
import { localeOf } from "../../i18n/core";

export const FONT_SANS = "Inter";
export const FONT_SERIF = "Playfair Display";

const defaultBase = () => `${process.env.PUBLIC_URL || ""}/fonts`;

let registeredBase = null;

/**
 * Yazı tiplerini kaydeder. Bir kez çağrılması yeterlidir; react-pdf aynı aile
 * için kaynakları biriktirdiğinden sonraki çağrılar yok sayılır.
 * @param {string} [basePath] yazı tipi klasörü (sonunda "/" olmadan)
 */
export const registerPdfFonts = (basePath) => {
  const base = (basePath || defaultBase()).replace(/\/$/, "");
  if (registeredBase) return;
  registeredBase = base;

  Font.register({
    family: FONT_SANS,
    fonts: [
      { src: `${base}/Inter-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/Inter-Italic.ttf`, fontWeight: 400, fontStyle: "italic" },
      { src: `${base}/Inter-Medium.ttf`, fontWeight: 500 },
      { src: `${base}/Inter-SemiBold.ttf`, fontWeight: 600 },
      { src: `${base}/Inter-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.register({
    family: FONT_SERIF,
    fonts: [
      { src: `${base}/PlayfairDisplay-Regular.ttf`, fontWeight: 400 },
      {
        src: `${base}/PlayfairDisplay-Italic.ttf`,
        fontWeight: 400,
        fontStyle: "italic",
      },
      { src: `${base}/PlayfairDisplay-Bold.ttf`, fontWeight: 700 },
    ],
  });

  // Türkçe heceleme sözlüğü yok; İngilizce kurallarıyla yanlış tirelemeyi
  // önlemek için kelimeleri bölmeden bırak.
  Font.registerHyphenationCallback((word) => [word]);
};

/**
 * Henüz kayıt yapılmadıysa varsayılan (PUBLIC_URL) yoluyla kaydeder.
 * PDF bileşenleri render sırasında bunu çağırır; Node/Jest'te önceden
 * registerPdfFonts(yerelYol) çağrılmışsa ona dokunmaz.
 */
export const ensurePdfFonts = () => {
  if (!registeredBase) registerPdfFonts();
};

/** Türkçe'ye uygun büyük harf (i → İ). */
export const upperTr = (text) =>
  (text || "").toString().toLocaleUpperCase("tr-TR");

/** Dile uygun büyük harf: tr → "i" → "İ", en → "i" → "I". */
export const upperFor = (text, lang) =>
  (text || "").toString().toLocaleUpperCase(localeOf(lang));

/** PDF'lerde ortak renkler (theme.js paletiyle uyumlu, baskı dostu). */
export const PDF_COLORS = {
  accent: "#C2410C",
  accentSoft: "#FDF1EA",
  ink: "#1C1917",
  body: "#3F3A36",
  muted: "#8A817A",
  rule: "#E3DAD0",
  cream: "#FBF7F2",
  breakfast: "#D97706",
  lunch: "#4D7C0F",
  dinner: "#7C3AED",
};
