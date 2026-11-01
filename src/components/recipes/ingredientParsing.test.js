import { parseIngredientLine, parseIngredientLines } from "./ingredientParsing";

describe("parseIngredientLine", () => {
  it("parses amount, multi-word unit and name", () => {
    expect(parseIngredientLine("2 su bardağı un")).toEqual({
      amount: "2",
      unit: "su bardağı",
      name: "un",
    });
    expect(parseIngredientLine("1,5 yemek kaşığı tereyağı")).toEqual({
      amount: "1,5",
      unit: "yemek kaşığı",
      name: "tereyağı",
    });
    expect(parseIngredientLine("- 1/2 demet maydanoz")).toEqual({
      amount: "1/2",
      unit: "demet",
      name: "maydanoz",
    });
  });

  it("handles missing amount/unit and aliases", () => {
    expect(parseIngredientLine("Tuz")).toEqual({ amount: "", unit: "", name: "Tuz" });
    expect(parseIngredientLine("3 yumurta")).toEqual({
      amount: "3",
      unit: "",
      name: "yumurta",
    });
    expect(parseIngredientLine("200 g peynir")).toEqual({
      amount: "200",
      unit: "gr",
      name: "peynir",
    });
    expect(parseIngredientLine("   ")).toBeNull();
  });
});

describe("parseIngredientLines", () => {
  it("splits lines and skips empties", () => {
    const out = parseIngredientLines("2 adet soğan\n\n1 tutam tuz\r\n");
    expect(out).toHaveLength(2);
    expect(out[1]).toEqual({ amount: "1", unit: "tutam", name: "tuz" });
  });
});
