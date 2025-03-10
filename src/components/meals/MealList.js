import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useMeals } from "../../context/MealContext";
import AddMealForm from "./AddMealForm";

// Sürüklenebilir yemek bileşeni
const DraggableMeal = ({ meal, index, onDelete, compactMode }) => {
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
      className={`${
        compactMode ? "p-1" : "p-2"
      } bg-white rounded border border-gray-200 cursor-move ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${meal.isPersonal ? "border-blue-300" : ""}`}
    >
      <div className="flex justify-between items-center">
        <span className={`font-medium ${compactMode ? "text-xs" : "text-sm"}`}>
          {meal.name}
        </span>
        <div className="flex items-center">
          {meal.isPersonal && !compactMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(meal.id);
              }}
              className="text-red-500 hover:text-red-700 mr-1 text-xs"
              title="Sil"
            >
              ✕
            </button>
          )}
          <span
            className={`${
              compactMode ? "text-xs px-1 py-0.5" : "text-xs px-2 py-1"
            } rounded-full ${typeColors[meal.type]}`}
          >
            {meal.type === "breakfast"
              ? "Kahvaltı"
              : meal.type === "lunch"
              ? "Öğle"
              : "Akşam"}
          </span>
        </div>
      </div>
      {meal.isPersonal && !compactMode && (
        <div className="mt-1">
          <span className="text-xs text-blue-500">Kişisel</span>
        </div>
      )}
      {meal.calories && !compactMode && (
        <div className="mt-1 text-xs text-gray-500">
          {meal.calories} kal | {meal.prepTime} dk
        </div>
      )}
    </div>
  );
};

const MealList = ({ compactMode = false }) => {
  const {
    filteredMeals,
    searchTerm,
    setSearchTerm,
    mealTypeFilter,
    setMealTypeFilter,
    mealFilter,
    setMealFilter,
    user,
    deletePersonalMeal,
  } = useMeals();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm("Bu yemeği silmek istediğinize emin misiniz?")) {
      await deletePersonalMeal(mealId);
    }
  };

  return (
    <div
      className={`bg-white rounded shadow ${
        compactMode ? "p-2" : "p-3"
      } h-full flex flex-col`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className={`${compactMode ? "text-base" : "text-lg"} font-bold`}>
          Yemek Listesi
        </h2>
        {isMobile && !compactMode && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            {showFilters ? "Filtreleri Gizle" : "Filtrele"}
          </button>
        )}
      </div>

      <div className="mb-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Yemek ara..."
          className={`w-full ${
            compactMode ? "p-1 text-xs" : "p-2 text-sm"
          } border rounded`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {(!isMobile || showFilters || compactMode) && (
        <div className="flex-shrink-0">
          <div className="mb-2 flex flex-wrap gap-1">
            <button
              className={`${
                compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
              } rounded ${
                mealTypeFilter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setMealTypeFilter("all")}
            >
              Tümü
            </button>
            <button
              className={`${
                compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
              } rounded ${
                mealTypeFilter === "breakfast"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setMealTypeFilter("breakfast")}
            >
              Kahvaltı
            </button>
            <button
              className={`${
                compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
              } rounded ${
                mealTypeFilter === "lunch"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setMealTypeFilter("lunch")}
            >
              Öğle
            </button>
            <button
              className={`${
                compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
              } rounded ${
                mealTypeFilter === "dinner"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setMealTypeFilter("dinner")}
            >
              Akşam
            </button>
          </div>

          {user && !compactMode && (
            <div className="mb-2 flex flex-wrap gap-1">
              <button
                className={`px-2 py-1 rounded text-xs ${
                  mealFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMealFilter("all")}
              >
                Tüm Yemekler
              </button>
              <button
                className={`px-2 py-1 rounded text-xs ${
                  mealFilter === "default"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMealFilter("default")}
              >
                Varsayılan
              </button>
              <button
                className={`px-2 py-1 rounded text-xs ${
                  mealFilter === "personal"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMealFilter("personal")}
              >
                Kişisel
              </button>
            </div>
          )}
        </div>
      )}

      {user && !compactMode && (
        <div className="mb-2 flex-shrink-0">
          {showAddForm ? (
            <AddMealForm onClose={() => setShowAddForm(false)} />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            >
              + Kişisel Yemek Ekle
            </button>
          )}
        </div>
      )}

      <div className="flex-grow overflow-y-auto space-y-1">
        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal, index) => (
            <DraggableMeal
              key={meal.id}
              meal={meal}
              index={index}
              onDelete={meal.isPersonal ? handleDeleteMeal : null}
              compactMode={compactMode}
            />
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
