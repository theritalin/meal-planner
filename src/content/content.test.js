// Herkese açık tarif ve rehber içeriklerinin (src/content/*.json) yapısını denetler.
import recipes from "./recipes.json";
import guides from "./guides.json";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CATEGORIES = [
  "corba",
  "ana-yemek",
  "zeytinyagli",
  "sebze",
  "kahvalti",
  "salata",
  "hamur-isi",
  "pilav-makarna",
  "tatli",
];
const MEAL_TYPES = ["breakfast", "lunch", "dinner"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const BLOCK_TYPES = ["h2", "p", "ul", "ol", "tip"];

const wordCount = (s) => s.trim().split(/\s+/).filter(Boolean).length;
const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const isNonNegInt = (v) => Number.isInteger(v) && v >= 0;

describe("recipes.json", () => {
  test("is a non-empty array", () => {
    expect(Array.isArray(recipes)).toBe(true);
    expect(recipes.length).toBeGreaterThanOrEqual(30);
  });

  test("slugs are unique kebab-case ASCII", () => {
    const slugs = recipes.map((r) => r.slug);
    slugs.forEach((s) => expect(s).toMatch(SLUG_RE));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("covers every category", () => {
    const used = new Set(recipes.map((r) => r.category));
    CATEGORIES.forEach((c) => expect(used.has(c)).toBe(true));
  });

  describe.each(recipes.map((r) => [r.slug, r]))("%s", (slug, r) => {
    test("required fields and types", () => {
      ["name", "description", "intro"].forEach((k) =>
        expect(isNonEmptyString(r[k])).toBe(true)
      );
      ["prepTime", "cookTime"].forEach((k) => expect(isNonNegInt(r[k])).toBe(true));
      expect(Number.isInteger(r.servings) && r.servings > 0).toBe(true);
      expect(Number.isInteger(r.calories) && r.calories > 0).toBe(true);
      expect(r.prepTime + r.cookTime).toBeGreaterThan(0);
    });

    test("enums", () => {
      expect(CATEGORIES).toContain(r.category);
      expect(MEAL_TYPES).toContain(r.mealType);
      expect(DIFFICULTIES).toContain(r.difficulty);
    });

    test("description ≤ 160 chars, intro 50–140 words", () => {
      expect(r.description.length).toBeLessThanOrEqual(160);
      const w = wordCount(r.intro);
      expect(w).toBeGreaterThanOrEqual(50);
      expect(w).toBeLessThanOrEqual(140);
    });

    test("ingredients, instructions, tips, tags", () => {
      expect(Array.isArray(r.ingredients)).toBe(true);
      expect(r.ingredients.length).toBeGreaterThanOrEqual(5);
      r.ingredients.forEach((i) => {
        expect(typeof i.amount).toBe("string");
        expect(typeof i.unit).toBe("string");
        expect(isNonEmptyString(i.name)).toBe(true);
      });
      expect(r.instructions.length).toBeGreaterThanOrEqual(4);
      r.instructions.forEach((s) => expect(isNonEmptyString(s)).toBe(true));
      expect(Array.isArray(r.tips)).toBe(true);
      r.tips.forEach((s) => expect(isNonEmptyString(s)).toBe(true));
      expect(r.tags.length).toBeGreaterThanOrEqual(1);
      r.tags.forEach((s) => expect(isNonEmptyString(s)).toBe(true));
    });

    test("plain text only (no HTML tags)", () => {
      const all = [r.name, r.description, r.intro, ...r.instructions, ...r.tips].join(" ");
      expect(all).not.toMatch(/<[a-z/][^>]*>/i);
    });
  });
});

describe("guides.json", () => {
  const recipeSlugs = new Set(recipes.map((r) => r.slug));

  test("is a non-empty array", () => {
    expect(Array.isArray(guides)).toBe(true);
    expect(guides.length).toBeGreaterThanOrEqual(8);
  });

  test("slugs are unique kebab-case ASCII", () => {
    const slugs = guides.map((g) => g.slug);
    slugs.forEach((s) => expect(s).toMatch(SLUG_RE));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe.each(guides.map((g) => [g.slug, g]))("%s", (slug, g) => {
    test("required fields and types", () => {
      expect(isNonEmptyString(g.title)).toBe(true);
      expect(isNonEmptyString(g.description)).toBe(true);
      expect(g.description.length).toBeLessThanOrEqual(160);
      expect(Number.isInteger(g.readingMinutes) && g.readingMinutes > 0).toBe(true);
      expect(g.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test("has at least 6 valid blocks", () => {
      expect(g.blocks.length).toBeGreaterThanOrEqual(6);
      const isValidBlock = (b) =>
        b.type === "ul" || b.type === "ol"
          ? Array.isArray(b.items) && b.items.length > 0 && b.items.every(isNonEmptyString)
          : isNonEmptyString(b.text);
      g.blocks.forEach((b) => {
        expect(BLOCK_TYPES).toContain(b.type);
        expect(isValidBlock(b)).toBe(true);
      });
    });

    test("relatedRecipes all exist", () => {
      expect(g.relatedRecipes.length).toBeGreaterThan(0);
      g.relatedRecipes.forEach((s) => expect(recipeSlugs.has(s)).toBe(true));
    });
  });
});
