// Herkese açık içerik (tarifler + rehberler) için veri yardımcıları.
// Veri kaynağı: src/content/*.json (prerender betiği de aynı dosyaları okur).
import recipesData from "../../content/recipes.json";
import guidesData from "../../content/guides.json";

export const RECIPES = Array.isArray(recipesData) ? recipesData : [];
export const GUIDES = Array.isArray(guidesData) ? guidesData : [];

export { SITE_URL, CONTACT_EMAIL } from "./siteInfo";

/** Kategori slug'ı → i18n etiket anahtarı (sıra = filtre çiplerinin sırası). */
export const CATEGORIES = {
  corba: "public.categories.corba",
  "ana-yemek": "public.categories.anaYemek",
  zeytinyagli: "public.categories.zeytinyagli",
  sebze: "public.categories.sebze",
  kahvalti: "public.categories.kahvalti",
  salata: "public.categories.salata",
  "hamur-isi": "public.categories.hamurIsi",
  "pilav-makarna": "public.categories.pilavMakarna",
  tatli: "public.categories.tatli",
};

/** Kategorinin i18n anahtarı (bilinmeyen kategori → "diğer"). */
export const categoryKey = (slug) =>
  CATEGORIES[slug] || "public.categories.other";

const bySlug = (list) => {
  const map = new Map();
  list.forEach((item) => item?.slug && map.set(item.slug, item));
  return map;
};
const recipeIndex = bySlug(RECIPES);
const guideIndex = bySlug(GUIDES);

export const getRecipe = (slug) => recipeIndex.get(slug) || null;
export const getGuide = (slug) => guideIndex.get(slug) || null;

/** Toplam süre (dakika). */
export const recipeMinutes = (recipe) =>
  (Number(recipe?.prepTime) || 0) + (Number(recipe?.cookTime) || 0);

/**
 * Benzer tarifler: önce aynı kategori, sonra aynı öğün, sonra diğerleri.
 * Tarifin kendisi hariç, en fazla n adet.
 */
export const relatedRecipes = (recipe, n = 3) => {
  if (!recipe) return RECIPES.slice(0, n);
  const others = RECIPES.filter((r) => r.slug !== recipe.slug);
  const score = (r) =>
    (r.category === recipe.category ? 2 : 0) +
    (r.mealType === recipe.mealType ? 1 : 0);
  return others
    .map((r, i) => ({ r, i, s: score(r) }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, n)
    .map(({ r }) => r);
};

/** Rehberde belirtilen tarif slug'larını tarif nesnelerine çevirir. */
export const guideRecipes = (guide) =>
  (guide?.relatedRecipes || []).map(getRecipe).filter(Boolean);

/** Genel tarifi, uygulamanın tarif modeline (kaydedilen tarifler) dönüştürür. */
export const toUserRecipe = (recipe) => ({
  id: `public-${recipe.slug}`,
  name: recipe.name,
  description: recipe.description || "",
  ingredients: (recipe.ingredients || []).map((i) => ({
    name: i.name || "",
    amount: i.amount || "",
    unit: i.unit || "",
  })),
  instructions: [...(recipe.instructions || [])],
  prepTime: Number(recipe.prepTime) || 0,
  cookTime: Number(recipe.cookTime) || 0,
  servings: Number(recipe.servings) || 0,
  difficulty: recipe.difficulty || "easy",
  notes: (recipe.tips || []).join("\n"),
  isPersonal: false,
  source: "public",
  slug: recipe.slug,
});
