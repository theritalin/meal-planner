import React, { useState, useEffect } from "react";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalDiningIcon from "@mui/icons-material/LocalDining";

const RecipeDetail = () => {
  const { selectedMeal, selectMeal, meals, userMeals } = useMeals();
  const { getRecipesForMeal } = useRecipes();
  const [allMeals, setAllMeals] = useState([]);

  useEffect(() => {
    setAllMeals([...meals, ...userMeals]);
  }, [meals, userMeals]);

  const handleMealChange = (event) => {
    const mealId = event.target.value;
    const selectedMeal = allMeals.find((meal) => meal.id === mealId);
    if (selectedMeal) {
      selectMeal(selectedMeal);
    }
  };

  return (
    <Box>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="meal-select-label">Yemek Seçin</InputLabel>
        <Select
          labelId="meal-select-label"
          id="meal-select"
          value={selectedMeal?.id || ""}
          label="Yemek Seçin"
          onChange={handleMealChange}
        >
          {allMeals.map((meal) => (
            <MenuItem key={meal.id} value={meal.id}>
              {meal.name} {meal.isPersonal ? "(Kişisel)" : ""}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {!selectedMeal ? (
        <Card sx={{ minWidth: 275, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              Lütfen tarif detaylarını görmek için bir yemek seçin
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {(() => {
            const recipes = getRecipesForMeal(selectedMeal.id);

            if (recipes.length === 0) {
              return (
                <Card sx={{ minWidth: 275, mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                      {selectedMeal.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bu yemek için henüz tarif eklenmemiş.
                    </Typography>
                  </CardContent>
                </Card>
              );
            }

            // İlk tarifi göster (birden fazla tarif olabilir)
            const recipe = recipes[0];

            const difficultyColor = {
              easy: "success",
              medium: "warning",
              hard: "error",
            };

            return (
              <Card sx={{ minWidth: 275, mb: 2 }}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    {recipe.name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`Hazırlık: ${recipe.prepTime} dk`}
                      variant="outlined"
                    />
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`Pişirme: ${recipe.cookTime} dk`}
                      variant="outlined"
                    />
                    <Chip
                      icon={<RestaurantIcon />}
                      label={`${recipe.servings} Porsiyon`}
                      variant="outlined"
                    />
                    <Chip
                      icon={<LocalDiningIcon />}
                      label={
                        recipe.difficulty === "easy"
                          ? "Kolay"
                          : recipe.difficulty === "medium"
                          ? "Orta"
                          : "Zor"
                      }
                      color={difficultyColor[recipe.difficulty]}
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    Malzemeler
                  </Typography>
                  <List dense>
                    {recipe.ingredients.map((ingredient, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    Hazırlanışı
                  </Typography>
                  <List>
                    {recipe.instructions.map((step, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={`${index + 1}. ${step}`} />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            );
          })()}
        </>
      )}
    </Box>
  );
};

export default RecipeDetail;
