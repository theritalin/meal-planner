import React from "react";
import { useDrag } from "react-dnd";
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

const MealSlot = ({ meal, type, dayIndex, mealIndex, dayName }) => {
  const { updateMealPlan } = useMeals();

  // Gün adını İngilizce'ye çevir
  const englishDayName = translateDayToEnglish(dayName);

  // Basitleştirilmiş sürükle-bırak
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "MEAL",
      item: meal, // Tüm meal nesnesini geçiyoruz
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();

        // Eğer başka bir slota bırakıldıysa ve başarılı olduysa, bu slottan kaldır
        if (dropResult && dropResult.dayName && dropResult.type) {
          // Aynı yere bırakılmadıysa kaldır
          if (
            dropResult.dayName.toLowerCase() !== englishDayName.toLowerCase() ||
            dropResult.type !== type
          ) {
            updateMealPlan(englishDayName, type, meal, "remove");
          }
        }
      },
    }),
    [meal, englishDayName, type, updateMealPlan]
  );

  // Yemeği kaldırmak için tıklama işleyicisi
  const handleRemove = (e) => {
    e.stopPropagation();
    if (meal && englishDayName && type) {
      updateMealPlan(englishDayName, type, meal, "remove");
    }
  };

  // Gerekli prop'lar eksikse null döndür
  if (!meal || !meal.id || !dayName || !type) {
    return null;
  }

  // Basitleştirilmiş kart tasarımı - sadece isim ve kaldır butonu
  return (
    <div
      ref={drag}
      className={`bg-white p-1 mt-1 rounded border border-gray-200 cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-xs">{meal.name}</span>
        <button
          onClick={handleRemove}
          className="ml-1 text-gray-400 hover:text-red-500 text-xs"
          aria-label="Yemeği kaldır"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default MealSlot;
