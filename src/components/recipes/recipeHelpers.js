import { useMemo } from "react";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { palette } from "../../theme";

/** Öğün tipine göre vurgu rengi (bilinmiyorsa ana renk). */
export const mealTypeColor = (type) => palette[type] || palette.primary;

/**
 * id -> yemek eşlemesi (varsayılan + kişisel yemekler).
 * Tarifin mealId'sinden öğün tipini bulmak için kullanılır.
 */
export const useMealIndex = () => {
  const { meals = [], userMeals = [] } = useMeals();
  const { defaultMeals = [] } = useRecipes();
  return useMemo(() => {
    const map = new Map();
    [...defaultMeals, ...meals, ...userMeals].forEach((meal) => {
      if (meal?.id) map.set(meal.id, meal);
    });
    return map;
  }, [meals, userMeals, defaultMeals]);
};

/** Tarif kullanıcının kendi tarifi mi? */
export const isOwnRecipe = (recipe, userRecipes = []) =>
  Boolean(recipe?.isPersonal && userRecipes.some((r) => r.id === recipe.id));

/** Tarifin toplam metin uzunluğu (PDF sığma uyarısı için). */
export const recipeTextLength = (recipe) => {
  if (!recipe) return 0;
  const parts = [
    recipe.name,
    recipe.description,
    recipe.notes,
    ...(recipe.instructions || []),
    ...(recipe.ingredients || []).map((i) =>
      typeof i === "string" ? i : [i?.amount, i?.unit, i?.name].join(" ")
    ),
  ];
  return parts.reduce((sum, p) => sum + (p ? String(p).length : 0), 0);
};
