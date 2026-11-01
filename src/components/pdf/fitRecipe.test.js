import {
  computeRecipeLayout,
  estimateLines,
  estimateTwoColumnHeight,
  planCookbook,
  tocPageCount,
  SCALE_PRESETS,
  MIN_SCALE,
  TOC,
} from "./fitRecipe";

const sentence =
  "Soğanları ince ince doğrayıp tereyağında pembeleşene kadar kavurun, ardından salçayı ekleyip kokusu çıkana kadar karıştırın.";

const makeRecipe = (ingredientCount, stepCount, extra = {}) => ({
  id: `r-${ingredientCount}-${stepCount}`,
  name: "Test Tarifi",
  prepTime: 10,
  cookTime: 20,
  servings: 4,
  difficulty: "easy",
  ingredients: Array.from({ length: ingredientCount }, (_, i) => ({
    name: `malzeme ${i + 1}`,
    amount: "2",
    unit: "yemek kaşığı",
  })),
  instructions: Array.from({ length: stepCount }, () => sentence),
  ...extra,
});

describe("estimateLines", () => {
  it("boş metin için 0 döner", () => {
    expect(estimateLines("", 200, 10)).toBe(0);
    expect(estimateLines(null, 200, 10)).toBe(0);
  });

  it("kısa metin tek satırdır, dar sütunda satır sayısı artar", () => {
    expect(estimateLines("Mercimek çorbası", 300, 10)).toBe(1);
    const wide = estimateLines(sentence, 400, 10);
    const narrow = estimateLines(sentence, 150, 10);
    expect(narrow).toBeGreaterThan(wide);
  });

  it("satırdan uzun kelimeyi birden çok satıra böler", () => {
    expect(estimateLines("a".repeat(200), 50, 10)).toBeGreaterThan(3);
  });
});

describe("computeRecipeLayout", () => {
  it("kısa tarif tam ölçekte, iki sütunda, tek sayfadır", () => {
    expect(computeRecipeLayout(makeRecipe(5, 3))).toMatchObject({
      scale: 1,
      layout: "two-column",
      estimatedPages: 1,
    });
  });

  it("orta uzunlukta tarif için daha küçük bir ölçek seçer", () => {
    const layout = computeRecipeLayout(
      makeRecipe(16, 12, { description: sentence, notes: sentence })
    );
    expect(layout.layout).toBe("two-column");
    expect(layout.scale).toBeLessThan(1);
    expect(SCALE_PRESETS).toContain(layout.scale);
    expect(layout.estimatedPages).toBe(1);
  });

  it("çok uzun tarifte tek sütun + en küçük ölçeğe geçer ve sayfa sayısını tahmin eder", () => {
    const layout = computeRecipeLayout(makeRecipe(40, 45, { notes: sentence }));
    expect(layout.layout).toBe("single-column");
    expect(layout.scale).toBe(MIN_SCALE);
    expect(layout.estimatedPages).toBeGreaterThan(1);
  });

  it("içerik arttıkça ölçek asla büyümez", () => {
    let previous = Infinity;
    for (let steps = 1; steps <= 30; steps += 1) {
      const { scale } = computeRecipeLayout(makeRecipe(8, steps));
      expect(scale).toBeLessThanOrEqual(previous);
      previous = scale;
    }
  });

  it("yükseklik ölçekle birlikte azalır", () => {
    const recipe = makeRecipe(12, 10);
    expect(estimateTwoColumnHeight(recipe, 0.66)).toBeLessThan(
      estimateTwoColumnHeight(recipe, 1)
    );
  });

  it("eksik alanlara dayanıklıdır", () => {
    expect(computeRecipeLayout({})).toMatchObject({ estimatedPages: 1 });
    expect(
      computeRecipeLayout({ ingredients: ["2 adet yumurta"], instructions: [{ text: "Çırpın." }] })
    ).toMatchObject({ layout: "two-column" });
  });
});

describe("planCookbook", () => {
  it("kapak + içindekilerden sonra tarif sayfalarını numaralar", () => {
    const recipes = [makeRecipe(4, 3), makeRecipe(40, 45), makeRecipe(4, 3)];
    const plan = planCookbook(recipes);
    expect(plan.tocPages).toBe(1);
    expect(plan.entries[0].startPage).toBe(3);
    expect(plan.entries[1].startPage).toBe(4);
    expect(plan.entries[2].startPage).toBe(4 + plan.entries[1].estimatedPages);
    expect(plan.totalPages).toBe(plan.entries[2].startPage);
  });

  it("kapak ve içindekiler olmadan ilk tarif 1. sayfadır", () => {
    const plan = planCookbook([makeRecipe(3, 2)], { cover: false, toc: false });
    expect(plan.entries[0].startPage).toBe(1);
  });

  it("çok sayıda tarifte içindekiler birden fazla sayfaya yayılır", () => {
    expect(tocPageCount(TOC.firstPageEntries)).toBe(1);
    expect(tocPageCount(TOC.firstPageEntries + 1)).toBe(2);
    const many = Array.from({ length: 60 }, () => makeRecipe(3, 2));
    const plan = planCookbook(many);
    expect(plan.tocPages).toBe(tocPageCount(60));
    expect(plan.entries[0].startPage).toBe(1 + plan.tocPages + 1);
  });
});
