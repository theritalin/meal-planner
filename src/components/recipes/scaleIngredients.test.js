import {
  parseAmount,
  formatAmount,
  scaleAmount,
  getScaleFactor,
  scaleIngredients,
} from "./scaleIngredients";

describe("parseAmount", () => {
  it.each([
    ["2", 2],
    ["1.5", 1.5],
    ["1,5", 1.5],
    ["1/2", 0.5],
    ["1 1/2", 1.5],
    ["½", 0.5],
    ["1½", 1.5],
    [3, 3],
  ])("parses %p", (input, expected) => {
    expect(parseAmount(input)).toBeCloseTo(expected);
  });

  it.each(["", "bir tutam", "az", "1/0", null, undefined, "2-3"])(
    "returns null for %p",
    (input) => {
      expect(parseAmount(input)).toBeNull();
    }
  );
});

describe("formatAmount", () => {
  it("formats integers and decimals with Turkish comma", () => {
    expect(formatAmount(2)).toBe("2");
    expect(formatAmount(1.5)).toBe("1,5");
    expect(formatAmount(1 / 3)).toBe("0,33");
    expect(formatAmount(2.999)).toBe("3");
    expect(formatAmount(1.5, "tr")).toBe("1,5");
  });

  it("formats decimals with a point in English", () => {
    expect(formatAmount(2, "en")).toBe("2");
    expect(formatAmount(1.5, "en")).toBe("1.5");
    expect(formatAmount(1 / 3, "en")).toBe("0.33");
  });
});

describe("scaleAmount", () => {
  it("scales simple numbers", () => {
    expect(scaleAmount("2", 2)).toBe("4");
    expect(scaleAmount("1,5", 2)).toBe("3");
    expect(scaleAmount("1.5", 0.5)).toBe("0,75");
    expect(scaleAmount("1/2", 3)).toBe("1,5");
    expect(scaleAmount(4, 0.5)).toBe("2");
  });

  it("scales ranges and keeps trailing text", () => {
    expect(scaleAmount("2-3", 2)).toBe("4-6");
    expect(scaleAmount("2 adet", 1.5)).toBe("3 adet");
  });

  it("parses both separators and formats per language", () => {
    expect(scaleAmount("1,5", 3, "en")).toBe("4.5");
    expect(scaleAmount("1.5", 3, "en")).toBe("4.5");
    expect(scaleAmount("1/2", 3, "en")).toBe("1.5");
    expect(scaleAmount("1-1.5", 0.5, "en")).toBe("0.5-0.75");
    expect(scaleAmount("1.5", 3, "tr")).toBe("4,5");
  });

  it("leaves non-numeric or unchanged amounts as-is", () => {
    expect(scaleAmount("bir tutam", 2)).toBe("bir tutam");
    expect(scaleAmount("", 2)).toBe("");
    expect(scaleAmount(undefined, 2)).toBeUndefined();
    expect(scaleAmount("2", 1)).toBe("2");
    expect(scaleAmount("2", NaN)).toBe("2");
  });
});

describe("getScaleFactor", () => {
  it("computes target/base and falls back to 1", () => {
    expect(getScaleFactor(2, 4)).toBe(2);
    expect(getScaleFactor("4", "2")).toBe(0.5);
    expect(getScaleFactor(0, 4)).toBe(1);
    expect(getScaleFactor(undefined, 4)).toBe(1);
  });
});

describe("scaleIngredients", () => {
  it("returns a new scaled array without mutating input", () => {
    const input = [
      { name: "Un", amount: "2", unit: "su bardağı" },
      { name: "Tuz", amount: "bir tutam", unit: "" },
      "Karabiber",
    ];
    const out = scaleIngredients(input, 2);
    expect(out).toEqual([
      { name: "Un", amount: "4", unit: "su bardağı" },
      { name: "Tuz", amount: "bir tutam", unit: "" },
      "Karabiber",
    ]);
    expect(input[0].amount).toBe("2");
    expect(out[0]).not.toBe(input[0]);
  });

  it("formats scaled amounts in the requested language", () => {
    const out = scaleIngredients([{ name: "Flour", amount: "1", unit: "cup" }], 1.5, "en");
    expect(out[0].amount).toBe("1.5");
  });

  it("handles non-arrays", () => {
    expect(scaleIngredients(null, 2)).toEqual([]);
  });
});
