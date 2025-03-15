import React, { useState, useEffect } from "react";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Grid,
  Paper,
  Divider,
  FormHelperText,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const RecipeForm = ({ onClose }) => {
  const {
    addPersonalRecipe,
    addRecipeToFirestoreDb,
    getRecipesForMeal,
    defaultMeals,
  } = useRecipes();
  const { user, meals, userMeals, isAdmin } = useMeals();
  const [formData, setFormData] = useState({
    name: "",
    mealId: "",
    ingredients: [{ name: "", amount: "", unit: "" }],
    instructions: [""],
    prepTime: "",
    cookTime: "",
    difficulty: "medium",
    servings: "1",
  });
  const [errors, setErrors] = useState({});
  const [availableMeals, setAvailableMeals] = useState([]);
  const [mealType, setMealType] = useState(isAdmin ? "default" : "personal");
  const [existingRecipe, setExistingRecipe] = useState(null);
  const [showExistingRecipeAlert, setShowExistingRecipeAlert] = useState(false);

  useEffect(() => {
    console.log("Admin durumu:", isAdmin);
    console.log("Seçili yemek tipi:", mealType);
    console.log("Varsayılan yemekler:", meals.length);
    console.log(
      "Kişisel yemekler:",
      userMeals.filter((m) => m.isPersonal).length
    );

    if (isAdmin && mealType === "default") {
      // Admin için varsayılan yemekleri göster
      setAvailableMeals(meals);
    } else {
      // Normal kullanıcılar için sadece kişisel yemekleri göster
      setAvailableMeals(userMeals.filter((meal) => meal.isPersonal));
    }
  }, [userMeals, meals, isAdmin, mealType]);

  // Yemek seçildiğinde mevcut tarifi kontrol et
  useEffect(() => {
    if (formData.mealId) {
      // Seçilen yemeğin tariflerini getir
      const recipes = getRecipesForMeal(formData.mealId);

      if (recipes && recipes.length > 0) {
        // Mevcut tarif varsa kaydet
        setExistingRecipe(recipes[0]);
        setShowExistingRecipeAlert(true);
      } else {
        setExistingRecipe(null);
        setShowExistingRecipeAlert(false);
      }
    }
  }, [formData.mealId, getRecipesForMeal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Hata varsa temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null,
      });
    }
  };

  const handleMealTypeChange = (event, newValue) => {
    setMealType(newValue);
    // Yemek seçimini sıfırla
    setFormData({
      ...formData,
      mealId: "",
    });
    setExistingRecipe(null);
    setShowExistingRecipeAlert(false);
  };

  // Mevcut tarifi forma yükle
  const loadExistingRecipe = () => {
    if (existingRecipe) {
      setFormData({
        ...existingRecipe,
        // Eğer bazı alanlar eksikse varsayılan değerlerle doldur
        ingredients: existingRecipe.ingredients || [
          { name: "", amount: "", unit: "" },
        ],
        instructions: existingRecipe.instructions || [""],
        prepTime: existingRecipe.prepTime || "",
        cookTime: existingRecipe.cookTime || "",
        difficulty: existingRecipe.difficulty || "medium",
        servings: existingRecipe.servings || "1",
      });
      setShowExistingRecipeAlert(false);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({
      ...formData,
      instructions: newInstructions,
    });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: "", amount: "", unit: "" },
      ],
    });
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = [...formData.ingredients];
      newIngredients.splice(index, 1);
      setFormData({
        ...formData,
        ingredients: newIngredients,
      });
    }
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ""],
    });
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = [...formData.instructions];
      newInstructions.splice(index, 1);
      setFormData({
        ...formData,
        instructions: newInstructions,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tarif adı gerekli";
    }
    if (!formData.mealId) {
      newErrors.mealId = "Yemek seçimi gerekli";
    }
    if (!formData.prepTime || isNaN(formData.prepTime)) {
      newErrors.prepTime = "Geçerli bir hazırlık süresi girin";
    }
    if (!formData.cookTime || isNaN(formData.cookTime)) {
      newErrors.cookTime = "Geçerli bir pişirme süresi girin";
    }

    // Malzemeleri kontrol et
    const ingredientErrors = [];
    formData.ingredients.forEach((ingredient, index) => {
      const error = {};
      if (!ingredient.name.trim()) {
        error.name = "Malzeme adı gerekli";
      }
      if (!ingredient.amount) {
        error.amount = "Miktar gerekli";
      }
      if (!ingredient.unit.trim()) {
        error.unit = "Birim gerekli";
      }
      if (Object.keys(error).length > 0) {
        ingredientErrors[index] = error;
      }
    });
    if (ingredientErrors.length > 0) {
      newErrors.ingredients = ingredientErrors;
    }

    // Talimatları kontrol et
    const instructionErrors = [];
    formData.instructions.forEach((instruction, index) => {
      if (!instruction.trim()) {
        instructionErrors[index] = "Talimat gerekli";
      }
    });
    if (instructionErrors.length > 0) {
      newErrors.instructions = instructionErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      // Sayısal değerleri dönüştür
      const recipeData = {
        ...formData,
        prepTime: parseInt(formData.prepTime, 10),
        cookTime: parseInt(formData.cookTime, 10),
        servings: parseInt(formData.servings, 10),
        ingredients: formData.ingredients.map((ing) => ({
          ...ing,
          amount: parseFloat(ing.amount),
        })),
      };

      if (isAdmin && mealType === "default") {
        // Admin kullanıcı varsayılan tarif ekliyor
        await addRecipeToFirestoreDb(recipeData);
      } else {
        // Normal kullanıcı kişisel tarif ekliyor
        await addPersonalRecipe(user.uid, recipeData);
      }

      onClose && onClose();
    } catch (error) {
      console.error("Tarif eklenirken hata oluştu:", error);
      setErrors({
        submit: "Tarif eklenirken bir hata oluştu. Lütfen tekrar deneyin.",
      });
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
      <Typography variant="h6" gutterBottom>
        Yeni Tarif Ekle
      </Typography>

      {isAdmin && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={mealType}
            onChange={handleMealTypeChange}
            aria-label="meal type tabs"
          >
            <Tab value="default" label="Varsayılan Yemekler" />
            <Tab value="personal" label="Kişisel Yemekler" />
          </Tabs>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            id="name"
            label="Tarif Adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required error={!!errors.mealId}>
            <InputLabel id="meal-select-label">Yemek</InputLabel>
            <Select
              labelId="meal-select-label"
              id="mealId"
              name="mealId"
              value={formData.mealId}
              label="Yemek"
              onChange={handleChange}
            >
              {availableMeals.length > 0 ? (
                availableMeals.map((meal) => (
                  <MenuItem key={meal.id} value={meal.id}>
                    {meal.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value="">
                  {isAdmin && mealType === "default"
                    ? "Varsayılan yemek bulunamadı"
                    : "Önce kişisel yemek eklemelisiniz"}
                </MenuItem>
              )}
            </Select>
            {errors.mealId && <FormHelperText>{errors.mealId}</FormHelperText>}
            {availableMeals.length === 0 && (
              <FormHelperText>
                {isAdmin && mealType === "default"
                  ? "Varsayılan yemek bulunamadı"
                  : "Tarif eklemek için önce kişisel yemek eklemelisiniz"}
              </FormHelperText>
            )}
          </FormControl>
        </Grid>

        {showExistingRecipeAlert && (
          <Grid item xs={12}>
            <Alert
              severity="info"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={loadExistingRecipe}
                >
                  Yükle
                </Button>
              }
            >
              Bu yemek için zaten bir tarif var. Mevcut tarifi düzenlemek için
              "Yükle" butonuna tıklayın.
            </Alert>
          </Grid>
        )}

        <Grid item xs={4}>
          <TextField
            required
            fullWidth
            id="prepTime"
            label="Hazırlık Süresi (dk)"
            name="prepTime"
            type="number"
            value={formData.prepTime}
            onChange={handleChange}
            error={!!errors.prepTime}
            helperText={errors.prepTime}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            required
            fullWidth
            id="cookTime"
            label="Pişirme Süresi (dk)"
            name="cookTime"
            type="number"
            value={formData.cookTime}
            onChange={handleChange}
            error={!!errors.cookTime}
            helperText={errors.cookTime}
          />
        </Grid>

        <Grid item xs={4}>
          <TextField
            required
            fullWidth
            id="servings"
            label="Porsiyon"
            name="servings"
            type="number"
            value={formData.servings}
            onChange={handleChange}
            error={!!errors.servings}
            helperText={errors.servings}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Malzemeler
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        {formData.ingredients.map((ingredient, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
            <Grid item xs={5}>
              <TextField
                required
                fullWidth
                label="Malzeme"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                error={errors.ingredients && errors.ingredients[index]?.name}
                helperText={
                  errors.ingredients && errors.ingredients[index]?.name
                }
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                required
                fullWidth
                label="Miktar"
                type="number"
                value={ingredient.amount}
                onChange={(e) =>
                  handleIngredientChange(index, "amount", e.target.value)
                }
                error={errors.ingredients && errors.ingredients[index]?.amount}
                helperText={
                  errors.ingredients && errors.ingredients[index]?.amount
                }
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                required
                fullWidth
                label="Birim"
                value={ingredient.unit}
                onChange={(e) =>
                  handleIngredientChange(index, "unit", e.target.value)
                }
                error={errors.ingredients && errors.ingredients[index]?.unit}
                helperText={
                  errors.ingredients && errors.ingredients[index]?.unit
                }
              />
            </Grid>
            <Grid item xs={1} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="error"
                onClick={() => removeIngredient(index)}
                disabled={formData.ingredients.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={addIngredient}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Malzeme Ekle
        </Button>
      </Paper>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Hazırlanışı
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        {formData.instructions.map((instruction, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
            <Grid item xs={11}>
              <TextField
                required
                fullWidth
                label={`Adım ${index + 1}`}
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                error={errors.instructions && !!errors.instructions[index]}
                helperText={errors.instructions && errors.instructions[index]}
              />
            </Grid>
            <Grid item xs={1} sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="error"
                onClick={() => removeInstruction(index)}
                disabled={formData.instructions.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={addInstruction}
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Adım Ekle
        </Button>
      </Paper>

      {errors.submit && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {errors.submit}
        </Typography>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button onClick={onClose} sx={{ mr: 1 }}>
          İptal
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Tarifi Kaydet
        </Button>
      </Box>
    </Box>
  );
};

export default RecipeForm;
