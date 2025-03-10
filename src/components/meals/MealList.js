import React from "react";
import { useDrag } from "react-dnd";
import { useMeals } from "../../context/MealContext";

// Sürüklenebilir yemek bileşeni
const DraggableMeal = ({ meal, index }) => {
  // Tam meal nesnesini item olarak geçirelim
  const [{ isDragging }, drag] = useDrag({
    type: "MEAL",
    item: meal, // Tüm meal nesnesini geçiyoruz
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const typeColors = {
    breakfast: "bg-yellow-100 text-yellow-800",
    lunch: "bg-green-100 text-green-800",
    dinner: "bg-purple-100 text-purple-800",
  };

  return (
    <div
      ref={drag}
      className={`p-2 bg-white rounded border border-gray-200 cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex justify-between items-center">
        <span className="font-medium text-sm">{meal.name}</span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${typeColors[meal.type]}`}
        >
          {meal.type === "breakfast"
            ? "Kahvaltı"
            : meal.type === "lunch"
            ? "Öğle"
            : "Akşam"}
        </span>
      </div>
    </div>
  );
};

const MealList = () => {
  const {
    filteredMeals,
    searchTerm,
    setSearchTerm,
    mealTypeFilter,
    setMealTypeFilter,
  } = useMeals();

  return (
    <div className="bg-white rounded shadow p-3">
      <h2 className="text-lg font-bold mb-3">Yemek Listesi</h2>

      <div className="mb-3">
        <input
          type="text"
          placeholder="Yemek ara..."
          className="w-full p-2 border rounded text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        <button
          className={`px-2 py-1 rounded text-xs ${
            mealTypeFilter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMealTypeFilter("all")}
        >
          Tümü
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${
            mealTypeFilter === "breakfast"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMealTypeFilter("breakfast")}
        >
          Kahvaltı
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${
            mealTypeFilter === "lunch"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMealTypeFilter("lunch")}
        >
          Öğle
        </button>
        <button
          className={`px-2 py-1 rounded text-xs ${
            mealTypeFilter === "dinner"
              ? "bg-purple-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setMealTypeFilter("dinner")}
        >
          Akşam
        </button>
      </div>

      <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal, index) => (
            <DraggableMeal key={meal.id} meal={meal} index={index} />
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            Sonuç bulunamadı
          </div>
        )}
      </div>
    </div>
  );
};

export default MealList;
