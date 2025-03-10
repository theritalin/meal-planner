import React from "react";
import DayCell from "./DayCell";
import { useMeals } from "../../context/MealContext";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_NAMES = {
  monday: "Pazartesi",
  tuesday: "Salı",
  wednesday: "Çarşamba",
  thursday: "Perşembe",
  friday: "Cuma",
  saturday: "Cumartesi",
  sunday: "Pazar",
};

const WeekView = () => {
  const { generateRandomMealPlan, clearMealPlan } = useMeals();

  return (
    <div className="bg-white rounded shadow p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-center">Haftalık Yemek Planı</h2>
        <div className="flex gap-2">
          <button
            onClick={generateRandomMealPlan}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
          >
            <span className="mr-2">🎲</span>
            Rastgele Plan
          </button>
          <button
            onClick={clearMealPlan}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center"
          >
            <span className="mr-2">🗑️</span>
            Temizle
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {DAYS.map((day, index) => (
          <DayCell key={day} day={DAY_NAMES[day]} index={index} />
        ))}
      </div>
    </div>
  );
};

export default WeekView;
