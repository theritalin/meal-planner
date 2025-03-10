import React from "react";
import { useDrop } from "react-dnd";
import MealSlot from "./MealSlot";
import { useMeals } from "../../context/MealContext";

// Türkçe gün adlarını İngilizce'ye çeviren fonksiyon
const translateDayToEnglish = (turkishDay) => {
  const dayMap = {
    Pazartesi: "monday",
    Salı: "tuesday",
    Çarşamba: "wednesday",
    Perşembe: "thursday",
    Cuma: "friday",
    Cumartesi: "saturday",
    Pazar: "sunday",
  };

  return dayMap[turkishDay] || turkishDay.toLowerCase();
};

// Bırakılabilir yemek slotu bileşeni
const DroppableMealSlot = ({ type, dayIndex, dayName, meals = [] }) => {
  const { updateMealPlan } = useMeals();

  // Güvenlik kontrolü
  const safeMeals = Array.isArray(meals) ? meals : [];

  // Gün adını İngilizce'ye çevir
  const englishDayName = translateDayToEnglish(dayName);

  // Basitleştirilmiş drop işlemi
  const [{ isOver }, drop] = useDrop({
    accept: "MEAL",
    drop: (item) => {
      console.log("Drop item:", item); // Debug için

      // Yemek bilgisini al ve güncelle
      if (!item || !item.id) {
        console.error("Invalid drop item:", item);
        return;
      }

      // Doğrudan meal nesnesini kullanıyoruz ve İngilizce gün adını geçiyoruz
      updateMealPlan(englishDayName, type, item, "add");

      return { dayName: englishDayName, type };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });

  const mealTypeLabels = {
    breakfast: "Kahvaltı",
    lunch: "Öğle",
    dinner: "Akşam",
  };

  const mealTypeColors = {
    breakfast: "bg-yellow-50 border-yellow-200",
    lunch: "bg-green-50 border-green-200",
    dinner: "bg-purple-50 border-purple-200",
  };

  return (
    <div className="meal-slot flex-1 flex flex-col mb-1">
      <div className="flex items-center mb-1">
        <div className="text-xs font-medium text-gray-600">
          {mealTypeLabels[type] || type}
        </div>
      </div>
      <div
        ref={drop}
        className={`${mealTypeColors[type] || ""} p-1 rounded flex-1 border ${
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
        }`}
      >
        {safeMeals.length > 0 ? (
          safeMeals.map((meal, mealIndex) => (
            <MealSlot
              key={`${meal.id}-${mealIndex}`}
              meal={meal}
              type={type}
              dayIndex={dayIndex}
              mealIndex={mealIndex}
              dayName={englishDayName} // İngilizce gün adını geçiyoruz
            />
          ))
        ) : (
          <div className="text-gray-400 text-xs text-center">
            Yemek eklemek için sürükleyin
          </div>
        )}
      </div>
    </div>
  );
};

const DayCell = ({ day, index }) => {
  const { weekPlan } = useMeals();

  // Gün adını İngilizce'ye çevir
  const englishDay = translateDayToEnglish(day);

  // İngilizce gün adını kullanarak veriyi al
  const dayMeals =
    weekPlan && weekPlan[englishDay]
      ? weekPlan[englishDay]
      : { breakfast: [], lunch: [], dinner: [] };

  if (!day) return null;

  return (
    <div className="border rounded p-2 bg-white h-full flex flex-col">
      <h3 className="text-sm font-bold text-center mb-2 bg-gray-50 py-1 rounded">
        {day}
      </h3>

      <div className="flex flex-col flex-1">
        <DroppableMealSlot
          type="breakfast"
          dayIndex={index}
          dayName={day}
          meals={dayMeals.breakfast}
        />

        <DroppableMealSlot
          type="lunch"
          dayIndex={index}
          dayName={day}
          meals={dayMeals.lunch}
        />

        <DroppableMealSlot
          type="dinner"
          dayIndex={index}
          dayName={day}
          meals={dayMeals.dinner}
        />
      </div>
    </div>
  );
};

export default DayCell;
