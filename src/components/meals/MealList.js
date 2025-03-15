import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import AddMealForm from "./AddMealForm";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
  Divider,
  IconButton,
  Typography,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CloseIcon from "@mui/icons-material/Close";

// Sürüklenebilir yemek bileşeni
const DraggableMeal = ({
  meal,
  index,
  onDelete,
  compactMode,
  onShowRecipe,
}) => {
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
          {meal.isPersonal && (
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onShowRecipe) onShowRecipe(meal);
            }}
            className="text-blue-500 hover:text-blue-700 mr-1 text-xs"
            title="Tarifi Göster"
          >
            <MenuBookIcon fontSize="small" />
          </button>
          <span
            className={`${
              typeColors[meal.type]
            } text-xs px-2 py-0.5 rounded-full`}
          >
            {meal.type === "breakfast"
              ? "Kahvaltı"
              : meal.type === "lunch"
              ? "Öğle"
              : "Akşam"}
          </span>
        </div>
      </div>
      {meal.isPersonal && (
        <div className="mt-1">
          <span
            className={`text-xs text-blue-500 ${
              compactMode ? "text-[10px]" : ""
            }`}
          >
            Kişisel
          </span>
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

// RecipeDialog bileşeni
const RecipeDialog = ({ open, onClose, meal, recipes }) => {
  const { getAllRecipes } = useRecipes();
  const allRecipes = getAllRecipes();

  // Yemeğe ait tarifi bul
  const recipe = meal
    ? allRecipes.find((r) => r.name.toLowerCase() === meal.name.toLowerCase())
    : null;

  // Malzeme formatını kontrol eden yardımcı fonksiyon
  const formatIngredient = (ingredient) => {
    if (typeof ingredient === "string") {
      return ingredient;
    } else if (typeof ingredient === "object" && ingredient !== null) {
      // Obje formatındaysa (name, amount, unit)
      return `${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`;
    }
    return "";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{meal ? meal.name : ""} Tarifi</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {recipe ? (
          <>
            <Box display="flex" gap={2} mb={2}>
              <Chip
                icon={<AccessTimeIcon />}
                label={`Hazırlık: ${recipe.prepTime} dk`}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<AccessTimeIcon />}
                label={`Pişirme: ${recipe.cookTime} dk`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                icon={<RestaurantIcon />}
                label={`${recipe.servings} Porsiyon`}
                color="success"
                variant="outlined"
              />
            </Box>

            <Typography variant="h6" gutterBottom>
              Malzemeler
            </Typography>
            <List dense>
              {recipe.ingredients &&
                recipe.ingredients.map((ingredient, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={formatIngredient(ingredient)} />
                  </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Hazırlanışı
            </Typography>
            <List dense>
              {recipe.instructions &&
                recipe.instructions.map((instruction, index) => (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemText primary={`${index + 1}. ${instruction}`} />
                  </ListItem>
                ))}
            </List>
          </>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <MenuBookIcon
              sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Bu yemek için tarif bulunamadı
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Bu yemeğin tarifi henüz eklenmemiş. Tarifler bölümünden yeni bir
              tarif ekleyebilirsiniz.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

const MealList = ({ compactMode = false }) => {
  const {
    meals,
    userMeals,
    loading,
    error,
    deletePersonalMeal,
    filteredMeals,
    searchTerm,
    setSearchTerm,
    mealTypeFilter,
    setMealTypeFilter,
    mealFilter,
    setMealFilter,
    user,
  } = useMeals();
  const { getAllRecipes } = useRecipes();
  const [recipes, setRecipes] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);

  useEffect(() => {
    // Tüm tarifleri al
    setRecipes(getAllRecipes());
  }, [getAllRecipes]);

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

  const handleShowRecipe = (meal) => {
    setSelectedMeal(meal);
    setOpenRecipeDialog(true);
  };

  const handleCloseRecipeDialog = () => {
    setOpenRecipeDialog(false);
    setSelectedMeal(null);
  };

  if (loading) return <div className="text-center py-4">Yükleniyor...</div>;
  if (error)
    return <div className="text-center py-4 text-red-500">{error}</div>;

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

          {user && (
            <div className="mb-2 flex flex-wrap gap-1">
              <button
                className={`${
                  compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
                } rounded ${
                  mealFilter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMealFilter("all")}
              >
                Tüm Yemekler
              </button>
              <button
                className={`${
                  compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
                } rounded ${
                  mealFilter === "default"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setMealFilter("default")}
              >
                Varsayılan
              </button>
              <button
                className={`${
                  compactMode ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-xs"
                } rounded ${
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

      {user && (
        <div className="mb-2 flex-shrink-0">
          {showAddForm ? (
            <AddMealForm onClose={() => setShowAddForm(false)} />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className={`w-full ${
                compactMode ? "py-1 text-xs" : "py-2 text-sm"
              } bg-green-500 hover:bg-green-600 text-white rounded`}
            >
              + Kişisel Yemek Ekle
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 overflow-y-auto flex-grow">
        {filteredMeals.map((meal, index) => (
          <DraggableMeal
            key={meal.id}
            meal={meal}
            index={index}
            onDelete={user ? handleDeleteMeal : null}
            compactMode={compactMode}
            onShowRecipe={handleShowRecipe}
          />
        ))}
      </div>

      {/* Tarif Dialog */}
      <RecipeDialog
        open={openRecipeDialog}
        onClose={handleCloseRecipeDialog}
        meal={selectedMeal}
        recipes={recipes}
      />
    </div>
  );
};

export default MealList;
