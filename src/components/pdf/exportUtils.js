// PDF üretme ve indirme yardımcıları.
//
// @react-pdf/renderer büyük bir kütüphane olduğundan PDF bileşenleri burada
// dinamik import ile yüklenir; böylece ana paket hafif kalır ve kütüphane
// yalnızca kullanıcı bir PDF istediğinde indirilir.

import React from "react";
import { isNativeApp } from "../../services/platform";
import { getLang, translate } from "../../i18n/core";

/** Türkçe karakterleri sadeleştirerek güvenli dosya adı üretir. */
export const slugify = (
  text,
  fallback = translate(getLang(), "pdf.files.recipe")
) => {
  const map = { ç: "c", ğ: "g", ı: "i", İ: "i", ö: "o", ş: "s", ü: "u" };
  const slug = (text || "")
    .toString()
    .replace(/[çğıİöşü]/gi, (ch) => map[ch] ?? map[ch.toLowerCase()] ?? ch)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || fallback;
};

const loadRenderer = () => import("@react-pdf/renderer");

/** Blob'u base64 (data: öneki olmadan) metne çevirir. */
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Android (Capacitor): PDF'i uygulama önbelleğine yazar ve sistem paylaşım
 * sayfasını açar (Drive'a kaydet, WhatsApp, Dosyalar vb.).
 */
const saveBlobNative = async (blob, filename) => {
  const [{ Filesystem, Directory }, { Share }] = await Promise.all([
    import("@capacitor/filesystem"),
    import("@capacitor/share"),
  ]);
  const data = await blobToBase64(blob);
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data,
    directory: Directory.Cache,
    recursive: true,
  });
  try {
    await Share.share({
      title: filename,
      files: [uri],
      dialogTitle: translate(getLang(), "pdf.files.shareTitle"),
    });
  } catch (err) {
    // Kullanıcı paylaşımı iptal ettiyse sessizce geç.
    if (!/cancel/i.test(err?.message || "")) throw err;
  }
};

/**
 * Blob'u dosya olarak kaydeder. Tüm PDF indirmeleri bu tek fonksiyondan geçer.
 * Web: <a download>. Android: Filesystem + Share.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {Promise<void>}
 */
export const saveBlob = async (blob, filename) => {
  if (isNativeApp()) {
    await saveBlobNative(blob, filename);
    showInterstitialAfterExport();
    return;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Tarayıcının indirmeyi başlatmasına zaman tanı.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);

  showInterstitialAfterExport();
};

/** Dışa aktarma sonrası (sıklık sınırlı) geçiş reklamı — yalnızca Android. */
const showInterstitialAfterExport = () => {
  import("../../services/ads")
    .then(({ maybeShowInterstitial }) =>
      maybeShowInterstitial({ reason: "pdf-export" })
    )
    .catch(() => {});
};

/**
 * Önizleme: PDF'i yeni sekmede açar. Açılır pencere engelleyicilerine
 * takılmamak için sekme, tıklama anında (await'ten önce) açılır ve PDF hazır
 * olunca adresi atanır.
 *
 * @param {() => Promise<Blob>} makeBlob
 * @returns {Promise<void>}
 */
export const previewPdf = async (
  makeBlob,
  filename = `${translate(getLang(), "pdf.files.preview")}.pdf`
) => {
  if (isNativeApp()) {
    // WebView'da yeni sekme yok: PDF'i paylaşım sayfasıyla bir PDF
    // görüntüleyicide açtır.
    await saveBlobNative(await makeBlob(), filename);
    return;
  }
  const win = window.open("", "_blank");
  try {
    const blob = await makeBlob();
    const url = URL.createObjectURL(blob);
    if (win) {
      win.location.href = url;
    } else {
      window.open(url, "_blank");
    }
    setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
  } catch (err) {
    if (win) win.close();
    throw err;
  }
};

/**
 * Tarif kitabı PDF blob'u üretir.
 * @param {{ recipes: Array, title?: string, author?: string,
 *           cover?: boolean, toc?: boolean, lang?: string }} options
 *        `lang` verilmezse geçerli arayüz dili kullanılır.
 * @returns {Promise<Blob>}
 */
export const generateCookbookBlob = async ({
  recipes,
  lang = getLang(),
  title = translate(lang, "pdf.doc.defaultBookTitle"),
  author,
  cover = true,
  toc = true,
}) => {
  const [{ pdf }, { default: CookbookDocument }] = await Promise.all([
    loadRenderer(),
    import("./CookbookDocument"),
  ]);
  return pdf(
    <CookbookDocument
      recipes={recipes}
      title={title}
      author={author}
      cover={cover}
      toc={toc}
      date={new Date()}
      lang={lang}
    />
  ).toBlob();
};

/**
 * Haftalık plan + alışveriş listesi PDF blob'u üretir.
 * @param {{ weekPlan: object, getRecipesForMeal?: Function,
 *           author?: string, lang?: string }} options
 * @returns {Promise<Blob>}
 */
export const generatePlanBlob = async ({
  weekPlan,
  getRecipesForMeal,
  author,
  lang = getLang(),
}) => {
  const [{ pdf }, { default: PlanDocument }] = await Promise.all([
    loadRenderer(),
    import("./PlanDocument"),
  ]);
  return pdf(
    <PlanDocument
      weekPlan={weekPlan}
      getRecipesForMeal={getRecipesForMeal}
      author={author}
      date={new Date()}
      lang={lang}
    />
  ).toBlob();
};

/**
 * Tek bir tarifi (tek sayfa, kapaksız) PDF olarak indirir.
 * Tarif detay sayfası tarafından kullanılır.
 *
 * @param {object} recipe  Tarif nesnesi (bkz. veri modeli)
 * @param {{ bookTitle?: string, mealType?: string, lang?: string }} [options]
 * @returns {Promise<void>}
 */
export const downloadRecipePdf = async (recipe, options = {}) => {
  if (!recipe) throw new Error("Tarif bulunamadı");
  const lang = options.lang || getLang();
  const data = options.mealType ? { ...recipe, mealType: options.mealType } : recipe;
  const blob = await generateCookbookBlob({
    recipes: [data],
    title: options.bookTitle || translate(lang, "pdf.doc.defaultBookTitle"),
    cover: false,
    toc: false,
    lang,
  });
  await saveBlob(
    blob,
    `${slugify(recipe.name, translate(lang, "pdf.files.recipe"))}.pdf`
  );
};
