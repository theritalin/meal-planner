import React, { useState, useEffect, useMemo } from "react";
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
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
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
  const [mealType, setMealType] = useState("personal");
  const [existingRecipe, setExistingRecipe] = useState(null);
  const [showExistingRecipeAlert, setShowExistingRecipeAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    console.log("Admin durumu:", isAdmin);
    console.log("Seçili yemek tipi:", mealType);
    console.log("Varsayılan yemekler:", meals.length);
    console.log(
      "Kişisel yemekler:",
      userMeals.filter((m) => m.isPersonal).length
    );

    // Sadece kişisel yemekleri göster
    setAvailableMeals(userMeals.filter((meal) => meal.isPersonal));
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

  // Yemek seçeneklerini hazırla
  const mealOptions = useMemo(() => {
    // Sadece kişisel yemekler
    return userMeals
      .filter((meal) => meal.isPersonal)
      .map((meal) => ({
        id: meal.id,
        name: meal.name,
      }));
  }, [userMeals]);

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

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: "", amount: "", unit: "" },
      ],
    });
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...formData.ingredients];
    newIngredients.splice(index, 1);
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({
      ...formData,
      ingredients: newIngredients,
    });
  };

  const handleAddInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, ""],
    });
  };

  const handleRemoveInstruction = (index) => {
    const newInstructions = [...formData.instructions];
    newInstructions.splice(index, 1);
    setFormData({
      ...formData,
      instructions: newInstructions,
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tarif adı gerekli";
    }

    if (!formData.mealId) {
      newErrors.mealId = "Yemek seçimi gerekli";
    }

    // Malzemeleri kontrol et
    const hasEmptyIngredient = formData.ingredients.some(
      (ing) => !ing.name.trim()
    );
    if (hasEmptyIngredient) {
      newErrors.ingredients = "Tüm malzemelerin adı girilmelidir";
    }

    // Talimatları kontrol et
    const hasEmptyInstruction = formData.instructions.some(
      (inst) => !inst.trim()
    );
    if (hasEmptyInstruction) {
      newErrors.instructions = "Tüm talimatlar girilmelidir";
    }

    if (!formData.prepTime) {
      newErrors.prepTime = "Hazırlık süresi gerekli";
    }

    if (!formData.cookTime) {
      newErrors.cookTime = "Pişirme süresi gerekli";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Sayısal değerleri dönüştür
      const recipeData = {
        ...formData,
        prepTime: parseInt(formData.prepTime, 10),
        cookTime: parseInt(formData.cookTime, 10),
        servings: parseInt(formData.servings, 10),
        isPersonal: true, // Kişisel tarif olarak işaretle
        createdAt: new Date().toISOString(),
        createdBy: user.displayName,
        createdById: user.uid,
        createdByPhoto: user.photoURL || null,
        createdByEmail: user.email || null,
      };

      // Sadece kişisel tarif eklenebilir
      const result = await addPersonalRecipe(user.uid, recipeData);

      if (result) {
        setSuccess("Tarif başarıyla eklendi");
        // Formu sıfırla
        setFormData({
          name: "",
          mealId: "",
          ingredients: [{ name: "", amount: "", unit: "" }],
          instructions: [""],
          prepTime: "",
          cookTime: "",
          difficulty: "medium",
          servings: "1",
        });
        // Başarılı olduğunda kapat
        setTimeout(() => {
          onClose && onClose();
        }, 1500);
      } else {
        setError("Tarif eklenirken bir hata oluştu");
      }
    } catch (err) {
      console.error("Tarif eklenirken hata:", err);
      setError("Tarif eklenirken bir hata oluştu: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Yemek tipi seçimi - Sadece kişisel yemekler için tarif eklenebilir */}
      <Alert severity="info" sx={{ mb: 2 }}>
        Sadece kişisel yemekleriniz için tarif ekleyebilirsiniz.
      </Alert>

      {showExistingRecipeAlert && existingRecipe && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bu yemek için zaten bir tarif mevcut. Yeni tarif eklerseniz, mevcut
          tarif güncellenecektir.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Tarif Adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth error={!!errors.mealId} required>
            <InputLabel>Yemek</InputLabel>
            <Select
              name="mealId"
              value={formData.mealId}
              onChange={handleChange}
              label="Yemek"
            >
              {mealOptions.map((meal) => (
                <MenuItem key={meal.id} value={meal.id}>
                  {meal.name}
                </MenuItem>
              ))}
            </Select>
            {errors.mealId && <FormHelperText>{errors.mealId}</FormHelperText>}
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Hazırlık Süresi (dk)"
            name="prepTime"
            type="number"
            value={formData.prepTime}
            onChange={handleChange}
            error={!!errors.prepTime}
            helperText={errors.prepTime}
            required
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Pişirme Süresi (dk)"
            name="cookTime"
            type="number"
            value={formData.cookTime}
            onChange={handleChange}
            error={!!errors.cookTime}
            helperText={errors.cookTime}
            required
            inputProps={{ min: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Porsiyon Sayısı"
            name="servings"
            type="number"
            value={formData.servings}
            onChange={handleChange}
            inputProps={{ min: 1 }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Zorluk Derecesi</FormLabel>
            <RadioGroup
              row
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <FormControlLabel
                value="easy"
                control={<Radio />}
                label="Kolay"
              />
              <FormControlLabel
                value="medium"
                control={<Radio />}
                label="Orta"
              />
              <FormControlLabel value="hard" control={<Radio />} label="Zor" />
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Malzemeler
          </Typography>
          {errors.ingredients && (
            <FormHelperText error>{errors.ingredients}</FormHelperText>
          )}
          {formData.ingredients.map((ingredient, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                gap: 1,
              }}
            >
              <TextField
                label="Malzeme"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                sx={{ flexGrow: 2 }}
              />
              <TextField
                label="Miktar"
                value={ingredient.amount}
                onChange={(e) =>
                  handleIngredientChange(index, "amount", e.target.value)
                }
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="Birim"
                value={ingredient.unit}
                onChange={(e) =>
                  handleIngredientChange(index, "unit", e.target.value)
                }
                sx={{ flexGrow: 1 }}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveIngredient(index)}
                disabled={formData.ingredients.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddIngredient}
            sx={{ mt: 1 }}
          >
            Malzeme Ekle
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Hazırlanışı
          </Typography>
          {errors.instructions && (
            <FormHelperText error>{errors.instructions}</FormHelperText>
          )}
          {formData.instructions.map((instruction, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 1,
                gap: 1,
              }}
            >
              <Typography sx={{ minWidth: "30px" }}>{index + 1}.</Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
              />
              <IconButton
                color="error"
                onClick={() => handleRemoveInstruction(index)}
                disabled={formData.instructions.length <= 1}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={handleAddInstruction}
            sx={{ mt: 1 }}
          >
            Adım Ekle
          </Button>
        </Grid>

        <Grid
          item
          xs={12}
          sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            İptal
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Kaydediliyor..." : "Tarifi Kaydet"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RecipeForm;
