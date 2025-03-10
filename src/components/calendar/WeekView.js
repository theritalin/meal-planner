import React, { useState, useEffect } from "react";
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
  const [selectedDay, setSelectedDay] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // İlk yükleme
    checkScreenSize();

    // Ekran boyutu değiştiğinde
    window.addEventListener("resize", checkScreenSize);

    // Temizleme
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Önceki güne geç
  const goToPreviousDay = () => {
    setSelectedDay((prev) => (prev > 0 ? prev - 1 : 6));
  };

  // Sonraki güne geç
  const goToNextDay = () => {
    setSelectedDay((prev) => (prev < 6 ? prev + 1 : 0));
  };

  return (
    <div className="bg-white rounded shadow p-3">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-center">Haftalık Yemek Planı</h2>
      </div>

      {isMobile ? (
        // Mobil görünüm - Tek gün gösterimi
        <div>
          <div className="flex justify-between items-center mb-3 bg-gray-100 p-2 rounded">
            <button
              onClick={goToPreviousDay}
              className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
            >
              ←
            </button>
            <h3 className="text-md font-bold">
              {DAY_NAMES[DAYS[selectedDay]]}
            </h3>
            <button
              onClick={goToNextDay}
              className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center"
            >
              →
            </button>
          </div>
          <DayCell
            key={DAYS[selectedDay]}
            day={DAY_NAMES[DAYS[selectedDay]]}
            index={selectedDay}
          />
        </div>
      ) : (
        // Masaüstü görünüm - Tüm hafta gösterimi
        <div className="grid grid-cols-1 md:grid-cols-7 gap-2 h-[calc(100vh-250px)] overflow-y-auto">
          {DAYS.map((day, index) => (
            <DayCell key={day} day={DAY_NAMES[day]} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeekView;
