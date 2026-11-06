import tr from "./locales/tr";
import en from "./locales/en";
import { translate } from "./core";

const keys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

test("TR ve EN sözlükleri aynı anahtarlara sahip", () => {
  const a = keys(tr).sort();
  const b = keys(en).sort();
  expect(a.filter((k) => !b.includes(k))).toEqual([]); // EN'de eksik
  expect(b.filter((k) => !a.includes(k))).toEqual([]); // TR'de eksik
});

test("çeviri, parametre ve geri düşme", () => {
  expect(translate("en", "common.days.monday")).toBe("Monday");
  expect(translate("tr", "common.minutes", { count: 5 })).toBe("5 dk");
  expect(translate("en", "common.servings", { count: 1 })).toBe("1 serving");
  expect(translate("en", "olmayan.anahtar")).toBe("olmayan.anahtar");
});
