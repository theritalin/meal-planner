import {
  CATEGORIES,
  GUIDES,
  RECIPES,
  categoryKey,
  getGuide,
  getRecipe,
  guideRecipes,
  relatedRecipes,
  toUserRecipe,
} from "./contentData";
import tr from "../../i18n/locales/tr";

test("tarif ve rehberler slug ile bulunur", () => {
  expect(RECIPES.length).toBeGreaterThan(0);
  expect(GUIDES.length).toBeGreaterThan(0);
  expect(getRecipe(RECIPES[0].slug)).toBe(RECIPES[0]);
  expect(getGuide(GUIDES[0].slug)).toBe(GUIDES[0]);
  expect(getRecipe("olmayan-tarif")).toBeNull();
  expect(getGuide("olmayan-rehber")).toBeNull();
});

test("slug'lar benzersiz ve kategoriler tanımlı", () => {
  const slugs = RECIPES.map((r) => r.slug);
  expect(new Set(slugs).size).toBe(slugs.length);
  RECIPES.forEach((r) => expect(CATEGORIES[r.category]).toBeTruthy());
});

test("kategori etiketleri sözlükte var", () => {
  Object.values(CATEGORIES).forEach((key) => {
    const name = key.split(".").pop();
    expect(typeof tr.public.categories[name]).toBe("string");
  });
  expect(categoryKey("bilinmeyen")).toBe("public.categories.other");
});

test("benzer tarifler: kendisi hariç, önce aynı kategori", () => {
  const recipe = RECIPES[0];
  const related = relatedRecipes(recipe, 5);
  expect(related.length).toBeLessThanOrEqual(5);
  expect(related.find((r) => r.slug === recipe.slug)).toBeUndefined();
  const sameCount = RECIPES.filter(
    (r) => r.slug !== recipe.slug && r.category === recipe.category,
  ).length;
  related
    .slice(0, Math.min(sameCount, 5))
    .forEach((r) => expect(r.category).toBe(recipe.category));
});

test("rehberdeki ilgili tarifler var olan tariflere çözülür", () => {
  GUIDES.forEach((g) => {
    guideRecipes(g).forEach((r) => expect(getRecipe(r.slug)).toBe(r));
  });
});

test("toUserRecipe uygulama tarif modeline dönüştürür", () => {
  const recipe = RECIPES[0];
  const mapped = toUserRecipe(recipe);
  expect(mapped).toMatchObject({
    id: `public-${recipe.slug}`,
    name: recipe.name,
    description: recipe.description,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    isPersonal: false,
    source: "public",
    slug: recipe.slug,
  });
  expect(mapped.ingredients).toHaveLength(recipe.ingredients.length);
  expect(mapped.ingredients[0]).toEqual({
    name: recipe.ingredients[0].name,
    amount: recipe.ingredients[0].amount,
    unit: recipe.ingredients[0].unit,
  });
  expect(mapped.instructions).toEqual(recipe.instructions);
  expect(mapped.notes).toBe((recipe.tips || []).join("\n"));
});
