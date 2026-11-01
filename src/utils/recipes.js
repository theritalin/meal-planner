// Tarif verisi için yardımcı fonksiyonlar.
//
// Tarif veri modeli:
// {
//   id, name, mealId, description?, category?,
//   ingredients: [{ name, amount, unit }],
//   instructions: [string],
//   prepTime, cookTime, servings, difficulty: "easy" | "medium" | "hard",
//   notes?, isPersonal?
// }

/** Türkçe'ye duyarlı küçük harfe çevirme (arama için). */
export const normalizeText = (text) =>
  (text || "").toString().toLocaleLowerCase("tr-TR").trim();

/** Malzeme satırını okunur metne çevirir: "2 su bardağı Un". */
export const formatIngredient = (ing) => {
  if (!ing) return "";
  if (typeof ing === "string") return ing;
  const qty = [ing.amount, ing.unit].filter(Boolean).join(" ");
  return qty ? `${qty} ${ing.name || ""}`.trim() : ing.name || "";
};

/** Toplam süre (dakika). */
export const totalTime = (recipe) =>
  (Number(recipe?.prepTime) || 0) + (Number(recipe?.cookTime) || 0);

/** id'ye göre tekrarları kaldırır, ilk görüleni korur. */
export const dedupeById = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || !item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

/** Arama terimiyle tarif eşleşmesi (isim, açıklama, malzeme). */
export const recipeMatches = (recipe, term) => {
  const q = normalizeText(term);
  if (!q) return true;
  if (normalizeText(recipe.name).includes(q)) return true;
  if (normalizeText(recipe.description).includes(q)) return true;
  return (recipe.ingredients || []).some((ing) =>
    normalizeText(typeof ing === "string" ? ing : ing?.name).includes(q)
  );
};
