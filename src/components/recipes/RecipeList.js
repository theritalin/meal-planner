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
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import RecipeForm from "./RecipeForm";
import FavoriteIcon from "@mui/icons-material/Favorite";

const RecipeCard = ({
  recipe,
  onDelete,
  onExpand,
  isSaved,
  onSave,
  onUnsave,
  onAddToPersonal,
  isAdmin,
  isPersonal,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleExpandClick = () => {
    if (onExpand) {
      onExpand(recipe);
    } else {
      setExpanded(!expanded);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave(recipe);
    } else {
      onSave(recipe);
    }
  };

  const handleAddOrDeletePersonal = (e) => {
    e.stopPropagation();
    if (isPersonal) {
      // Eğer tarif zaten kişisel ise, silme işlemi yap
      onDelete(recipe.id);
    } else {
      // Değilse kişisel tariflere ekle
      onAddToPersonal(recipe);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Varsayılan yemek tarifi ve kullanıcı admin değilse gösterme
  if (recipe.isDefault && !isAdmin) {
    return null;
  }

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea onClick={handleExpandClick}>
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
          <MenuBookIcon sx={{ fontSize: 60, color: "rgba(0, 0, 0, 0.3)" }} />
        </CardMedia>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {recipe.name}
          </Typography>

          {/* Tarif sahibi bilgisi */}
          {recipe.createdBy && (
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Avatar
                src={recipe.createdByPhoto}
                alt={recipe.createdBy}
                sx={{ width: 24, height: 24, mr: 1, fontSize: "0.8rem" }}
              >
                {!recipe.createdByPhoto &&
                  recipe.createdBy.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {recipe.createdBy}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
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
          </Box>

          <Typography variant="body2" color="text.secondary" noWrap>
            {recipe.ingredients &&
              recipe.ingredients
                .slice(0, 2)
                .map((ing) =>
                  typeof ing === "string"
                    ? ing
                    : `${ing.name} ${ing.amount} ${ing.unit}`
                )
                .join(", ")}
            {recipe.ingredients && recipe.ingredients.length > 2 && "..."}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions>
        <IconButton
          aria-label="kaydet"
          onClick={handleSaveClick}
          color={isSaved ? "primary" : "default"}
        >
          <FavoriteIcon />
        </IconButton>
        <Button
          size="small"
          onClick={handleAddOrDeletePersonal}
          color={isPersonal ? "error" : "primary"}
          startIcon={isPersonal ? <DeleteIcon /> : <AddIcon />}
        >
          {isPersonal ? "Tarifi Sil" : "Kişisel Tariflere Ekle"}
        </Button>
      </CardActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

const RecipeList = ({ userOnly = false, savedOnly = false, userId = null }) => {
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
    userRecipes,
    savedRecipes,
    saveRecipe,
    unsaveRecipe,
    addPersonalRecipe,
    getUserRecipes,
  } = useRecipes();
  const { user, meals, userMeals, isAdmin } = useMeals();
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [filteredLocalRecipes, setFilteredLocalRecipes] = useState([]);
  const [isSaved, setIsSaved] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Yemek ID'lerini memoize et
  const mealIds = useMemo(() => {
    return [...meals, ...userMeals].map((meal) => meal.id);
  }, [meals, userMeals]);

  // Tarifleri yükleme fonksiyonunu memoize et
  const loadRecipes = useCallback(() => {
    console.log("Tarifler yükleniyor - loadRecipes çağrıldı");

    // Kaydedilen tarifleri göster
    if (savedOnly) {
      setRecipes(savedRecipes || []);
      return;
    }

    // Belirli bir kullanıcının tariflerini göster
    if (userOnly) {
      // Eğer userId belirtilmişse o kullanıcının tariflerini göster
      if (userId && userId !== user?.uid) {
        // Diğer kullanıcının tariflerini getir
        const fetchOtherUserRecipes = async () => {
          try {
            const otherUserRecipes = await getUserRecipes(userId);
            console.log(
              "Diğer kullanıcının tarifleri yüklendi:",
              otherUserRecipes?.length || 0
            );
            setRecipes(otherUserRecipes || []);
          } catch (error) {
            console.error(
              "Diğer kullanıcının tarifleri yüklenirken hata:",
              error
            );
            setRecipes([]);
          }
        };

        fetchOtherUserRecipes();
        return;
      }
      // Kendi tariflerimizi göster
      setRecipes(userRecipes);
      return;
    }

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
      ...userRecipes, // Doğrudan userRecipes kullan
    ];

    // Sadece bir yemeğe bağlı olan tarifleri filtrele
    const recipesWithMeals = allRecipes.filter((recipe) =>
      mealIds.includes(recipe.mealId)
    );

    setRecipes(recipesWithMeals);
  }, [
    defaultMeals,
    mealIds,
    userOnly,
    userRecipes,
    savedOnly,
    userId,
    user,
    savedRecipes,
    getUserRecipes,
  ]);

  // Sadece yemeklere eklenen tarifleri göster
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Kaydedilen tarifleri kontrol et
  useEffect(() => {
    if (!user || !savedRecipes) return;

    const savedMap = {};
    savedRecipes.forEach((recipe) => {
      savedMap[recipe.id] = true;
    });

    setIsSaved(savedMap);
  }, [savedRecipes, user]);

  // Arama ve filtreleme işlemleri
  useEffect(() => {
    if (recipes.length === 0) return;

    let filtered = [...recipes];

    // Arama terimini uygula
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (recipe) =>
          (recipe.name && recipe.name.toLowerCase().includes(term)) ||
          (recipe.description &&
            recipe.description.toLowerCase().includes(term))
      );
    }

    // Tarif türü filtresini uygula (userOnly veya savedOnly modunda bu filtreyi atla)
    if (!userOnly && !savedOnly && recipeFilter !== "all") {
      filtered = filtered.filter((recipe) => {
        if (recipeFilter === "default") {
          return !recipe.isPersonal;
        } else if (recipeFilter === "personal") {
          return recipe.isPersonal;
        }
        return true;
      });
    }

    setFilteredLocalRecipes(filtered);
  }, [recipes, searchTerm, recipeFilter, userOnly, savedOnly]);

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

  const handleSaveRecipe = async (recipe) => {
    if (!user) return;

    try {
      if (isSaved[recipe.id]) {
        // Kaydı kaldır
        await unsaveRecipe(user.uid, recipe.id);

        // İşlem başarılı olduğunda state'i güncelle
        setIsSaved((prev) => ({ ...prev, [recipe.id]: false }));

        setSnackbar({
          open: true,
          message: "Tarif kaydedilenlerden kaldırıldı",
          severity: "success",
        });
      } else {
        // Kaydet
        await saveRecipe(user.uid, recipe);

        // İşlem başarılı olduğunda state'i güncelle
        setIsSaved((prev) => ({ ...prev, [recipe.id]: true }));

        setSnackbar({
          open: true,
          message: "Tarif kaydedildi",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Tarif kaydetme/kaldırma hatası:", error);
      setSnackbar({
        open: true,
        message: "İşlem sırasında bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleUnsaveRecipe = async (recipe) => {
    if (!user) return;

    try {
      // Kaydı kaldır
      await unsaveRecipe(user.uid, recipe.id);

      // İşlem başarılı olduğunda state'i güncelle
      setIsSaved((prev) => ({ ...prev, [recipe.id]: false }));

      setSnackbar({
        open: true,
        message: "Tarif kaydedilenlerden kaldırıldı",
        severity: "success",
      });
    } catch (error) {
      console.error("Tarif kaydedilenlerden kaldırma hatası:", error);
      setSnackbar({
        open: true,
        message: "İşlem sırasında bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleAddToPersonal = async (recipe) => {
    if (!user) return;

    try {
      // Tarifi kişiselleştir
      const personalRecipe = {
        ...recipe,
        isPersonal: true,
        originalId: recipe.id,
        originalCreatedBy: recipe.createdBy || "Bilinmeyen",
        originalCreatedByUid: recipe.createdByUid || null,
        createdBy: user.displayName || user.email,
        createdByUid: user.uid,
        createdByPhoto: user.photoURL,
        createdByEmail: user.email,
        createdAt: new Date(),
      };

      // ID'yi kaldır, yeni bir ID oluşturulacak
      delete personalRecipe.id;

      await addPersonalRecipe(user.uid, personalRecipe);
      setSnackbar({
        open: true,
        message: "Tarif kişisel tariflere eklendi",
        severity: "success",
      });

      // Tarifleri yeniden yükle
      loadRecipes();
    } catch (error) {
      console.error("Tarifi kişiselleştirme hatası:", error);
      setSnackbar({
        open: true,
        message: "İşlem sırasında bir hata oluştu",
        severity: "error",
      });
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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

  // Tarif kişisel mi kontrolü
  const isPersonalRecipe = useCallback(
    (recipeId) => {
      return userRecipes.some((recipe) => recipe.id === recipeId);
    },
    [userRecipes]
  );

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
      {!userOnly && !savedOnly && (
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
      )}

      {userOnly && filteredLocalRecipes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Henüz hiç tarif eklenmemiş.
          </Typography>
        </Box>
      )}

      {savedOnly && filteredLocalRecipes.length === 0 && (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Henüz hiç tarif kaydedilmemiş.
          </Typography>
        </Box>
      )}

      {!userOnly && !savedOnly && (
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
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {filteredLocalRecipes.length > 0 ? (
          filteredLocalRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <RecipeCard
                recipe={recipe}
                onDelete={() => handleDeleteRecipe(recipe.id)}
                onExpand={handleOpenRecipeDialog}
                isSaved={isSaved[recipe.id]}
                onSave={() => handleSaveRecipe(recipe)}
                onUnsave={() => handleUnsaveRecipe(recipe)}
                onAddToPersonal={() => handleAddToPersonal(recipe)}
                isAdmin={isAdmin}
                isPersonal={isPersonalRecipe(recipe.id)}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm
                  ? "Arama kriterlerine uygun tarif bulunamadı"
                  : "Henüz tarif eklenmemiş"}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenFormDialog}
                sx={{ mt: 2 }}
              >
                Yeni Tarif Ekle
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecipeList;
