// Haftalık plandan toplu alışveriş listesi üretimi (saf fonksiyonlar).

import { DAYS, MEAL_TYPES } from "../../constants";
import { normalizeText } from "../../utils/recipes";
import { getLang, localeOf } from "../../i18n/core";

const UNICODE_FRACTIONS = {
  "½": 0.5,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "¼": 0.25,
  "¾": 0.75,
};

/**
 * Miktar metnini sayıya çevirir: "2", "1,5", "1.5", "1/2", "1 1/2", "½",
 * "1½". Çevrilemezse null döner ("bir tutam", "2-3" gibi).
 */
export const parseAmount = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let str = String(value).trim();
  if (!str) return null;
  let extra = 0;
  const last = str.slice(-1);
  if (UNICODE_FRACTIONS[last] !== undefined) {
    extra = UNICODE_FRACTIONS[last];
    str = str.slice(0, -1).trim();
    if (!str) return extra;
  }
  let m = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3]) + extra;
  m = str.match(/^(\d+)\/(\d+)$/);
  if (m && Number(m[2])) return Number(m[1]) / Number(m[2]) + extra;
  m = str.match(/^\d+(?:[.,]\d+)?$/);
  if (m) return Number(str.replace(",", ".")) + extra;
  return null;
};

/**
 * Sayıyı dile uygun biçimde yazar: tr → 1.5 → "1,5", en → "1.5".
 * @param {number} n
 * @param {string} [lang] varsayılan: geçerli arayüz dili
 */
export const formatAmount = (n, lang = getLang()) => {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString(localeOf(lang), { maximumFractionDigits: 2 });
};

const cleanName = (name) => (name || "").toString().trim().replace(/\s+/g, " ");

/**
 * Planlanan yemeklerin tariflerinden toplu alışveriş listesi oluşturur.
 * Aynı isimli malzemeler birleştirilir; aynı birimdeki sayısal miktarlar
 * toplanır, sayısal olmayanlar ayrıca listelenir.
 *
 * @param {object} weekPlan  { monday: { breakfast: [meal], ... }, ... }
 * @param {(mealId: string) => Array} getRecipesForMeal
 * @param {string} [lang] sayı biçimi ve sıralama dili (varsayılan: arayüz dili)
 * @returns {Array<{ key, name, quantities: string[], meals: string[] }>}
 *          ada göre (Türkçe) sıralı
 */
export const buildShoppingList = (
  weekPlan,
  getRecipesForMeal,
  lang = getLang()
) => {
  const items = new Map();

  const recipesFor = (meal) => {
    const fromFn =
      typeof getRecipesForMeal === "function" && meal?.id
        ? getRecipesForMeal(meal.id) || []
        : [];
    if (fromFn.length) return fromFn;
    return Array.isArray(meal?.recipes) ? meal.recipes : [];
  };

  DAYS.forEach((day) => {
    MEAL_TYPES.forEach((type) => {
      const meals = weekPlan?.[day]?.[type];
      if (!Array.isArray(meals)) return;
      meals.forEach((meal) => {
        // Bir yemeğin birden fazla tarifi olabilir; ilkini kullan.
        const recipe = recipesFor(meal)[0];
        if (!recipe) return;
        (recipe.ingredients || []).forEach((ing) => {
          const raw = typeof ing === "string" ? { name: ing } : ing || {};
          const name = cleanName(raw.name);
          if (!name) return;
          const key = normalizeText(name);
          if (!items.has(key)) {
            items.set(key, {
              key,
              name,
              sums: new Map(), // birim -> toplam
              others: [],
              meals: new Set(),
            });
          }
          const item = items.get(key);
          item.meals.add(meal.name || recipe.name || "");
          const unit = cleanName(raw.unit);
          const amount = parseAmount(raw.amount);
          if (amount !== null) {
            const unitKey = normalizeText(unit);
            const prev = item.sums.get(unitKey);
            item.sums.set(unitKey, {
              unit: prev?.unit || unit,
              total: (prev?.total || 0) + amount,
            });
          } else {
            const text = [raw.amount, unit].filter(Boolean).join(" ").trim();
            if (text && !item.others.includes(text)) item.others.push(text);
          }
        });
      });
    });
  });

  return [...items.values()]
    .map((item) => ({
      key: item.key,
      name: item.name,
      quantities: [
        ...[...item.sums.values()].map(({ unit, total }) =>
          [formatAmount(total, lang), unit].filter(Boolean).join(" ")
        ),
        ...item.others,
      ],
      meals: [...item.meals].filter(Boolean),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, localeOf(lang)));
};

/** Plandaki toplam yemek sayısı ve dolu gün sayısı. */
export const summarizePlan = (weekPlan) => {
  let mealCount = 0;
  let activeDays = 0;
  const unique = new Set();
  DAYS.forEach((day) => {
    let dayCount = 0;
    MEAL_TYPES.forEach((type) => {
      const meals = weekPlan?.[day]?.[type];
      if (!Array.isArray(meals)) return;
      dayCount += meals.length;
      meals.forEach((m) => unique.add(m?.id || m?.name));
    });
    mealCount += dayCount;
    if (dayCount) activeDays += 1;
  });
  return { mealCount, activeDays, uniqueMeals: unique.size };
};
