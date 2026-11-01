// Uygulama genelinde paylaşılan sabitler

export const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const DAY_LABELS = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
};

export const MEAL_TYPES = ["breakfast", "lunch", "dinner"];

export const MEAL_TYPE_LABELS = {
  breakfast: "Kahvaltı",
  lunch: "Öğle",
  dinner: "Akşam",
};

export const DIFFICULTY_LABELS = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

export const DIFFICULTY_COLORS = {
  easy: "success",
  medium: "warning",
  hard: "error",
};

export const MAX_MEALS_PER_SLOT = 3;

export const createEmptyWeekPlan = () =>
  DAYS.reduce((plan, day) => {
    plan[day] = MEAL_TYPES.reduce((slots, type) => {
      slots[type] = [];
      return slots;
    }, {});
    return plan;
  }, {});
