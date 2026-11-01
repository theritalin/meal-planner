import { useMemo } from "react";
import { useMeals } from "../../context/MealContext";
import { normalizeText } from "../../utils/recipes";

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

export const formatMealMeta = (meal) =>
  [
    meal.calories ? `${meal.calories} kcal` : null,
    meal.prepTime ? `${meal.prepTime} dk` : null,
  ]
    .filter(Boolean)
    .join(" · ");
