import { buildShoppingList, parseAmount, summarizePlan } from "./shoppingList";
import { createEmptyWeekPlan } from "../../constants";

describe("parseAmount", () => {
  it.each([
    ["2", 2],
    ["1,5", 1.5],
    ["1.5", 1.5],
    ["1/2", 0.5],
    ["1 1/2", 1.5],
    ["½", 0.5],
    ["1½", 1.5],
    [3, 3],
  ])("%s → %s", (input, expected) => {
    expect(parseAmount(input)).toBeCloseTo(expected);
  });

  it.each(["", "bir tutam", "2-3", null, undefined])(
    "%s sayı değildir",
    (input) => {
      expect(parseAmount(input)).toBeNull();
    }
  );
});

describe("buildShoppingList", () => {
  const recipes = {
    m1: [
      {
        name: "Menemen",
        ingredients: [
          { name: "Domates", amount: "3", unit: "adet" },
          { name: "Yumurta", amount: "2", unit: "adet" },
          { name: "Tuz", amount: "", unit: "" },
        ],
      },
    ],
    m2: [
      {
        name: "Çorba",
        ingredients: [
          { name: "domates", amount: "1,5", unit: "Adet" },
          { name: "Domates", amount: "200", unit: "g" },
          { name: "Tuz", amount: "bir tutam", unit: "" },
        ],
      },
    ],
  };
  const plan = createEmptyWeekPlan();
  plan.monday.breakfast = [{ id: "m1", name: "Menemen" }];
  plan.tuesday.breakfast = [{ id: "m1", name: "Menemen" }];
  plan.monday.lunch = [{ id: "m2", name: "Çorba" }];
  plan.friday.dinner = [{ id: "nope", name: "Tarifsiz" }];

  const list = buildShoppingList(plan, (id) => recipes[id] || []);
  const byKey = Object.fromEntries(list.map((i) => [i.key, i]));

  it("aynı malzemeyi ve aynı birimi toplar, farklı birimleri ayırır", () => {
    expect(byKey.domates.quantities).toEqual(["7,5 adet", "200 g"]);
    expect(byKey.yumurta.quantities).toEqual(["4 adet"]);
  });

  it("sayısal olmayan miktarları korur ve yemekleri listeler", () => {
    expect(byKey.tuz.quantities).toEqual(["bir tutam"]);
    expect(byKey.domates.meals.sort()).toEqual(["Menemen", "Çorba"].sort());
  });

  it("Türkçe alfabetik sıralar", () => {
    expect(list.map((i) => i.key)).toEqual(["domates", "tuz", "yumurta"]);
  });

  it("plan özeti", () => {
    expect(summarizePlan(plan)).toEqual({
      mealCount: 4,
      activeDays: 3,
      uniqueMeals: 3,
    });
  });
});
