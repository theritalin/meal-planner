import {
  COMMON_UNITS,
  getCommonUnits,
  parseIngredientLine,
  parseIngredientLines,
} from "./ingredientParsing";

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

describe("English units", () => {
  it("recognises English units and plurals regardless of language", () => {
    expect(parseIngredientLine("2 cups flour", "en")).toEqual({
      amount: "2",
      unit: "cup",
      name: "flour",
    });
    expect(parseIngredientLine("1 Tbsp olive oil", "en")).toEqual({
      amount: "1",
      unit: "tbsp",
      name: "olive oil",
    });
    expect(parseIngredientLine("3 cloves garlic", "tr")).toEqual({
      amount: "3",
      unit: "clove",
      name: "garlic",
    });
    expect(parseIngredientLine("1.5 teaspoons. salt", "en")).toEqual({
      amount: "1.5",
      unit: "tsp",
      name: "salt",
    });
  });

  it("maps shared aliases to the current language's unit", () => {
    expect(parseIngredientLine("200 g cheese", "en").unit).toBe("g");
    expect(parseIngredientLine("200 gr cheese", "en").unit).toBe("g");
    expect(parseIngredientLine("200 g peynir", "tr").unit).toBe("gr");
    // Türkçe birimler İngilizce arayüzde de tanınır
    expect(parseIngredientLine("2 su bardağı un", "en").unit).toBe("su bardağı");
  });

  it("offers the unit list matching the language", () => {
    expect(getCommonUnits("tr")).toBe(COMMON_UNITS);
    expect(getCommonUnits("en")).toEqual(expect.arrayContaining(["cup", "tbsp", "tsp"]));
  });
});

describe("parseIngredientLines", () => {
  it("splits lines and skips empties", () => {
    const out = parseIngredientLines("2 adet soğan\n\n1 tutam tuz\r\n");
    expect(out).toHaveLength(2);
    expect(out[1]).toEqual({ amount: "1", unit: "tutam", name: "tuz" });
  });
});
