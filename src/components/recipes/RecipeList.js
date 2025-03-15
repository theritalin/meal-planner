import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  CardMedia,
  CardActionArea,
  DialogActions,
  CardActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RecipeForm from "./RecipeForm";

const RecipeList = () => {
  const {
    filteredRecipes,
    searchTerm,
    setSearchTerm,
    recipeFilter,
    setRecipeFilter,
    deletePersonalRecipe,
    getRecipesForMeal,
    getAllRecipes,
    defaultMeals,
  } = useRecipes();
  const { user, meals, userMeals } = useMeals();
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredLocalRecipes, setFilteredLocalRecipes] = useState([]);

  // Yemek ID'lerini memoize et
  const mealIds = useMemo(() => {
    return [...meals, ...userMeals].map((meal) => meal.id);
  }, [meals, userMeals]);

  // Tarifleri yükleme fonksiyonunu memoize et
  const loadRecipes = useCallback(() => {
    console.log("Tarifler yükleniyor - loadRecipes çağrıldı");

    // Tarifleri doğrudan defaultMeals'den al
    const extractedRecipes = [];
    defaultMeals.forEach((meal) => {
      if (meal.recipes && Array.isArray(meal.recipes)) {
        extractedRecipes.push(...meal.recipes);
      }
    });

    // Kişisel tarifleri de ekle
    const allRecipes = [
      ...extractedRecipes,
      ...getAllRecipes().filter((r) => r.isPersonal),
    ];

    // Sadece bir yemeğe bağlı olan tarifleri filtrele
    const recipesWithMeals = allRecipes.filter((recipe) =>
      mealIds.includes(recipe.mealId)
    );

    setRecipes(recipesWithMeals);
  }, [defaultMeals, getAllRecipes, mealIds]);

  // Sadece yemeklere eklenen tarifleri göster
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Filtreleme işlemini memoize et
  const filterRecipes = useCallback(() => {
    console.log("Filtreleme yapılıyor - filterRecipes çağrıldı");
    let result = [...recipes];

    // Arama terimini uygula
    if (searchTerm) {
      result = result.filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients?.some(
            (ing) =>
              typeof ing === "object" &&
              ing.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filtre türünü uygula
    if (recipeFilter !== "all") {
      result = result.filter((recipe) =>
        recipeFilter === "personal" ? recipe.isPersonal : !recipe.isPersonal
      );
    }

    setFilteredLocalRecipes(result);
  }, [recipes, searchTerm, recipeFilter]);

  // Arama ve filtre uygulaması
  useEffect(() => {
    filterRecipes();
  }, [filterRecipes]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRecipeFilterChange = (e) => {
    setRecipeFilter(e.target.value);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm("Bu tarifi silmek istediğinizden emin misiniz?")) {
      await deletePersonalRecipe(user.uid, recipeId);
    }
  };

  const handleOpenFormDialog = () => {
    setOpenFormDialog(true);
  };

  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
  };

  const handleOpenRecipeDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenRecipeDialog(true);
  };

  const handleCloseRecipeDialog = () => {
    setOpenRecipeDialog(false);
    setSelectedRecipe(null);
  };

  // Yemek adını bulmak için yardımcı fonksiyon
  const getMealName = (mealId) => {
    const meal = [...meals, ...userMeals].find((m) => m.id === mealId);
    return meal ? meal.name : "Bilinmeyen Yemek";
  };

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

  // Tarif detaylarını gösteren dialog bileşeni
  const RecipeDetailDialog = () => {
    if (!selectedRecipe) return null;

    return (
      <Dialog
        open={openRecipeDialog}
        onClose={handleCloseRecipeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">{selectedRecipe.name}</Typography>
            <IconButton onClick={handleCloseRecipeDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {getMealName(selectedRecipe.mealId)}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip
                size="small"
                icon={<AccessTimeIcon />}
                label={`Hazırlık: ${selectedRecipe.prepTime} dk`}
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<AccessTimeIcon />}
                label={`Pişirme: ${selectedRecipe.cookTime} dk`}
                variant="outlined"
              />
              <Chip
                size="small"
                icon={<RestaurantIcon />}
                label={`${selectedRecipe.servings} Porsiyon`}
                variant="outlined"
              />
              {selectedRecipe.isPersonal && (
                <Chip size="small" label="Kişisel" color="primary" />
              )}
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Malzemeler
          </Typography>
          <List dense>
            {selectedRecipe.ingredients &&
              selectedRecipe.ingredients.map((ingredient, index) => (
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
            {selectedRecipe.instructions &&
              selectedRecipe.instructions.map((instruction, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${index + 1}. ${instruction}`} />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRecipeDialog}>Kapat</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tarif Ara"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="recipe-filter-label">Tarif Türü</InputLabel>
              <Select
                labelId="recipe-filter-label"
                id="recipe-filter"
                value={recipeFilter}
                label="Tarif Türü"
                onChange={handleRecipeFilterChange}
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value="default">Varsayılan</MenuItem>
                <MenuItem value="personal">Kişisel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenFormDialog}
          startIcon={<AddIcon />}
        >
          Yeni Tarif Ekle
        </Button>
      </Box>

      {filteredLocalRecipes.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Arama kriterlerinize uygun tarif bulunamadı.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filteredLocalRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardActionArea onClick={() => handleOpenRecipeDialog(recipe)}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      bgcolor: "rgba(0, 0, 0, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MenuBookIcon
                      sx={{ fontSize: 60, color: "rgba(0, 0, 0, 0.3)" }}
                    />
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant="h6"
                      component="div"
                      noWrap
                    >
                      {recipe.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {getMealName(recipe.mealId)}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mt: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        icon={<AccessTimeIcon />}
                        label={`${recipe.prepTime + recipe.cookTime} dk`}
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        icon={<RestaurantIcon />}
                        label={`${recipe.servings} Porsiyon`}
                        variant="outlined"
                      />
                      {recipe.isPersonal && (
                        <Chip size="small" label="Kişisel" color="primary" />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
                {recipe.isPersonal && (
                  <CardActions sx={{ justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecipe(recipe.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Yeni Tarif Ekleme Dialog */}
      <Dialog
        open={openFormDialog}
        onClose={handleCloseFormDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Yeni Tarif Ekle</DialogTitle>
        <DialogContent>
          <RecipeForm onClose={handleCloseFormDialog} />
        </DialogContent>
      </Dialog>

      {/* Tarif Detay Dialog */}
      <RecipeDetailDialog />
    </Box>
  );
};

export default RecipeList;
