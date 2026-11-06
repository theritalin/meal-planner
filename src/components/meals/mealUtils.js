import { useMemo } from "react";
import { useMeals } from "../../context/MealContext";
import { normalizeText } from "../../utils/recipes";
import { t as tStatic } from "../../i18n/core";

/** Varsayılan + kişisel yemekler (id'ye göre tekilleştirilmiş). */
export const useAllMeals = () => {
  const { meals, userMeals } = useMeals();
  return useMemo(() => {
    const seen = new Set();
    return [...(userMeals || []), ...(meals || [])].filter((m) => {
      if (!m?.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [meals, userMeals]);
};

export const mealMatchesQuery = (meal, query) => {
  const q = normalizeText(query);
  if (!q) return true;
  return (
    normalizeText(meal.name).includes(q) ||
    normalizeText(meal.description).includes(q)
  );
};

/**
 * "280 kcal · 10 dk" biçiminde kısa yemek bilgisi.
 * React bileşenleri dil değişiminde yeniden çizilmek için kendi `t`'sini geçmeli;
 * verilmezse modül düzeyindeki (geçerli dil) çeviri kullanılır.
 */
export const formatMealMeta = (meal, t = tStatic) =>
  [
    meal.calories ? t("common.kcal", { count: meal.calories }) : null,
    meal.prepTime ? t("common.minutes", { count: meal.prepTime }) : null,
  ]
    .filter(Boolean)
    .join(" · ");
