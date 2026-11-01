// PDF üretme ve indirme yardımcıları.
//
// @react-pdf/renderer büyük bir kütüphane olduğundan PDF bileşenleri burada
// dinamik import ile yüklenir; böylece ana paket hafif kalır ve kütüphane
// yalnızca kullanıcı bir PDF istediğinde indirilir.

import React from "react";

/** Türkçe karakterleri sadeleştirerek güvenli dosya adı üretir. */
export const slugify = (text, fallback = "tarif") => {
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

/**
 * Blob'u dosya olarak kaydeder.
 *
 * TODO(android): Capacitor WebView'da <a download> ile blob indirme çalışmaz.
 * Android sürümünde burada @capacitor/filesystem ile dosyayı
 * (Directory.Documents / Cache) yazıp @capacitor/share ile paylaşım sayfası
 * açılmalı. Örn:
 *   if (Capacitor.isNativePlatform()) {
 *     const data = await blobToBase64(blob);
 *     const { uri } = await Filesystem.writeFile({ path: filename, data,
 *       directory: Directory.Cache });
 *     await Share.share({ title: filename, url: uri });
 *     return;
 *   }
 * Tüm PDF indirmeleri bu tek fonksiyondan geçer.
 *
 * @param {Blob} blob
 * @param {string} filename
 * @returns {Promise<void>}
 */
export const saveBlob = async (blob, filename) => {
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

  // Dışa aktarma sonrası (sıklık sınırlı) geçiş reklamı — yalnızca Android.
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
export const previewPdf = async (makeBlob) => {
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
 *           cover?: boolean, toc?: boolean }} options
 * @returns {Promise<Blob>}
 */
export const generateCookbookBlob = async ({
  recipes,
  title = "Tarif Kitabım",
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
    />
  ).toBlob();
};

/**
 * Haftalık plan + alışveriş listesi PDF blob'u üretir.
 * @param {{ weekPlan: object, getRecipesForMeal?: Function,
 *           author?: string }} options
 * @returns {Promise<Blob>}
 */
export const generatePlanBlob = async ({
  weekPlan,
  getRecipesForMeal,
  author,
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
    />
  ).toBlob();
};

/**
 * Tek bir tarifi (tek sayfa, kapaksız) PDF olarak indirir.
 * Tarif detay sayfası tarafından kullanılır.
 *
 * @param {object} recipe  Tarif nesnesi (bkz. veri modeli)
 * @param {{ bookTitle?: string, mealType?: string }} [options]
 * @returns {Promise<void>}
 */
export const downloadRecipePdf = async (recipe, options = {}) => {
  if (!recipe) throw new Error("Tarif bulunamadı");
  const data = options.mealType ? { ...recipe, mealType: options.mealType } : recipe;
  const blob = await generateCookbookBlob({
    recipes: [data],
    title: options.bookTitle || "Tarif Kitabım",
    cover: false,
    toc: false,
  });
  await saveBlob(blob, `${slugify(recipe.name)}.pdf`);
};
