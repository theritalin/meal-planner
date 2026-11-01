import { DAYS, MEAL_TYPES } from "../../constants";

/** Bugünün gün anahtarı ("monday" ... "sunday"). */
export const getTodayKey = () => DAYS[(new Date().getDay() + 6) % 7];

export const TOTAL_SLOTS = DAYS.length * MEAL_TYPES.length;

const EMPTY = Object.freeze([]);

const slotMeals = (plan, day, type) => {
  const slot = plan?.[day]?.[type];
  return Array.isArray(slot) ? slot : EMPTY;
};

export const getDayMealCount = (plan, day) =>
  MEAL_TYPES.reduce((sum, type) => sum + slotMeals(plan, day, type).length, 0);

/** Haftalık plan özeti: dolu slot sayısı ve toplam kalori. */
export const getPlanSummary = (plan) => {
  let plannedSlots = 0;
  let totalCalories = 0;
  DAYS.forEach((day) => {
    MEAL_TYPES.forEach((type) => {
      const meals = slotMeals(plan, day, type);
      if (meals.length > 0) plannedSlots += 1;
      meals.forEach((m) => {
        totalCalories += Number(m.calories) || 0;
      });
    });
  });
  return { plannedSlots, totalSlots: TOTAL_SLOTS, totalCalories };
};

export { slotMeals };
