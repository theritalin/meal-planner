import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  ListSubheader,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import { useI18n } from "../../i18n";
import { getCommonUnits, parseIngredientLines } from "./ingredientParsing";
import { DIFFICULTIES, recipeTextLength } from "./recipeHelpers";

const LONG_RECIPE_CHARS = 2500;

let keySeq = 0;
const nextKey = () => `row_${Date.now().toString(36)}_${keySeq++}`;

const emptyIngredient = () => ({ _key: nextKey(), amount: "", unit: "", name: "" });
const emptyInstruction = () => ({ _key: nextKey(), text: "" });

const toFormState = (recipe) => {
  const ingredients = (recipe?.ingredients || []).map((ing) =>
    typeof ing === "string"
      ? { _key: nextKey(), amount: "", unit: "", name: ing }
      : {
          _key: nextKey(),
          amount: ing?.amount != null ? String(ing.amount) : "",
          unit: ing?.unit || "",
          name: ing?.name || "",
        }
  );
  const instructions = (recipe?.instructions || []).map((text) => ({
    _key: nextKey(),
    text: String(text || ""),
  }));
  return {
    name: recipe?.name || "",
    description: recipe?.description || "",
    mealId: recipe?.mealId || "",
    prepTime: recipe?.prepTime != null ? String(recipe.prepTime) : "",
    cookTime: recipe?.cookTime != null ? String(recipe.cookTime) : "",
    servings: recipe?.servings != null ? String(recipe.servings) : "2",
    difficulty: recipe?.difficulty || "medium",
    notes: recipe?.notes || "",
    ingredients: ingredients.length ? ingredients : [emptyIngredient()],
    instructions: instructions.length ? instructions : [emptyInstruction()],
  };
};

const isBlankIngredient = (i) => !i.name.trim() && !i.amount.trim() && !i.unit.trim();

// Hata değerleri çeviri anahtarlarıdır (dil değişince yeniden çevrilir).
const validate = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = "recipes.form.errors.nameRequired";
  else if (form.name.trim().length > 120) errors.name = "recipes.form.errors.nameTooLong";

  ["prepTime", "cookTime"].forEach((field) => {
    const v = form[field].trim();
    if (v && (!/^\d+$/.test(v) || Number(v) > 1440)) {
      errors[field] = "recipes.form.errors.minutes";
    }
  });
  const s = form.servings.trim();
  if (s && (!/^\d+$/.test(s) || Number(s) < 1 || Number(s) > 100)) {
    errors.servings = "recipes.form.errors.servings";
  }

  const filled = form.ingredients.filter((i) => !isBlankIngredient(i));
  const rowErrors = {};
  form.ingredients.forEach((i) => {
    if (!isBlankIngredient(i) && !i.name.trim()) {
      rowErrors[i._key] = "recipes.form.errors.ingredientName";
    }
  });
  if (Object.keys(rowErrors).length) errors.ingredientRows = rowErrors;
  if (!filled.length) errors.ingredients = "recipes.form.errors.ingredientsRequired";

  if (!form.instructions.some((i) => i.text.trim())) {
    errors.instructions = "recipes.form.errors.stepsRequired";
  }
  return errors;
};

const toRecipeData = (form) => ({
  name: form.name.trim(),
  description: form.description.trim(),
  mealId: form.mealId || null,
  prepTime: Number(form.prepTime) || 0,
  cookTime: Number(form.cookTime) || 0,
  servings: Number(form.servings) || 1,
  difficulty: form.difficulty,
  notes: form.notes.trim(),
  ingredients: form.ingredients
    .filter((i) => i.name.trim())
    .map(({ amount, unit, name }) => ({
      amount: amount.trim(),
      unit: unit.trim(),
      name: name.trim(),
    })),
  instructions: form.instructions.map((i) => i.text.trim()).filter(Boolean),
});

const SectionTitle = ({ children, action }) => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="space-between"
    sx={{ mt: 3, mb: 1.5 }}
  >
    <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700 }}>
      {children}
    </Typography>
    {action}
  </Stack>
);

/**
 * Tarif oluşturma / düzenleme formu.
 * Props:
 *  - onClose: () => void — iptal / kayıt sonrası kapatma
 *  - initialRecipe?: Recipe — verilirse düzenleme modu (updatePersonalRecipe)
 *  - onSaved?: (recipe) => void — başarılı kayıttan sonra çağrılır
 */
const RecipeForm = ({ onClose, initialRecipe, onSaved }) => {
  const { addPersonalRecipe, updatePersonalRecipe, defaultMeals = [] } =
    useRecipes();
  const { user, meals = [], userMeals = [] } = useMeals();
  const { t, lang } = useI18n();
  const isEdit = Boolean(initialRecipe?.id);
  const tErr = (key) => (key ? t(key) : key);
  const units = getCommonUnits(lang);

  const [form, setForm] = useState(() => toFormState(initialRecipe));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const instructionRefs = useRef({});

  const mealGroups = useMemo(() => {
    const personal = userMeals.filter((m) => m?.id);
    const personalIds = new Set(personal.map((m) => m.id));
    const seen = new Set(personalIds);
    const defaults = [...meals, ...defaultMeals].filter((m) => {
      if (!m?.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    const byName = (a, b) => (a.name || "").localeCompare(b.name || "", lang);
    return { personal: personal.sort(byName), defaults: defaults.sort(byName) };
  }, [meals, userMeals, defaultMeals, lang]);

  const knownMealIds = useMemo(
    () => new Set([...mealGroups.personal, ...mealGroups.defaults].map((m) => m.id)),
    [mealGroups]
  );

  const isLong = useMemo(
    () => recipeTextLength(toRecipeData(form)) > LONG_RECIPE_CHARS,
    [form]
  );

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    clearError(field);
  };

  // ---- Malzemeler ----
  const updateIngredient = (key, field, value) => {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((i) =>
        i._key === key ? { ...i, [field]: value } : i
      ),
    }));
    if (errors.ingredientRows?.[key] && field === "name") {
      setErrors((prev) => {
        const rows = { ...prev.ingredientRows };
        delete rows[key];
        return { ...prev, ingredientRows: rows };
      });
    }
    clearError("ingredients");
  };

  const addIngredient = () =>
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, emptyIngredient()],
    }));

  const removeIngredient = (key) =>
    setForm((prev) => {
      const next = prev.ingredients.filter((i) => i._key !== key);
      return { ...prev, ingredients: next.length ? next : [emptyIngredient()] };
    });

  const applyPaste = () => {
    const parsed = parseIngredientLines(pasteText, lang).map((i) => ({
      ...i,
      _key: nextKey(),
    }));
    if (!parsed.length) return;
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients.filter((i) => !isBlankIngredient(i)),
        ...parsed,
      ],
    }));
    clearError("ingredients");
    setPasteText("");
    setPasteOpen(false);
  };

  // ---- Adımlar ----
  const updateInstruction = (key, text) => {
    setForm((prev) => ({
      ...prev,
      instructions: prev.instructions.map((i) =>
        i._key === key ? { ...i, text } : i
      ),
    }));
    clearError("instructions");
  };

  const addInstruction = () => {
    const row = emptyInstruction();
    setForm((prev) => ({ ...prev, instructions: [...prev.instructions, row] }));
    setTimeout(() => instructionRefs.current[row._key]?.focus(), 0);
  };

  const removeInstruction = (key) =>
    setForm((prev) => {
      const next = prev.instructions.filter((i) => i._key !== key);
      return { ...prev, instructions: next.length ? next : [emptyInstruction()] };
    });

  const moveInstruction = (index, delta) =>
    setForm((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.instructions.length) return prev;
      const next = [...prev.instructions];
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, instructions: next };
    });

  // ---- Kaydet ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    const found = validate(form);
    const hasErrors = Object.values(found).some(Boolean);
    setErrors(found);
    if (hasErrors) {
      setSubmitError("recipes.form.errors.checkFields");
      return;
    }
    if (!user?.uid) {
      setSubmitError("recipes.form.errors.loginToSave");
      return;
    }

    setSaving(true);
    try {
      const data = toRecipeData(form);
      const saved = isEdit
        ? await updatePersonalRecipe(user.uid, initialRecipe.id, data)
        : await addPersonalRecipe(user.uid, data);
      if (!saved) throw new Error("Kayıt başarısız");
      onSaved?.(saved);
      onClose?.();
    } catch (err) {
      console.error("Tarif kaydedilemedi:", err);
      setSubmitError("recipes.form.errors.saveFailed");
    } finally {
      setSaving(false);
    }
  };

  const renderMealOption = (meal) => (
    <MenuItem key={meal.id} value={meal.id}>
      <Box component="span" sx={{ flexGrow: 1 }}>
        {meal.name}
      </Box>
      {meal.type && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          {t(`common.mealTypes.${meal.type}`)}
        </Typography>
      )}
    </MenuItem>
  );

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ pt: 1 }}>
      {!user && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("recipes.form.loginRequired")}
        </Alert>
      )}

      <Stack spacing={2}>
        <TextField
          label={t("recipes.form.name")}
          value={form.name}
          onChange={setField("name")}
          required
          fullWidth
          autoFocus={!isEdit}
          error={Boolean(errors.name)}
          helperText={tErr(errors.name)}
          inputProps={{ maxLength: 140 }}
        />
        <TextField
          label={t("recipes.form.description")}
          value={form.description}
          onChange={setField("description")}
          fullWidth
          multiline
          minRows={2}
          placeholder={t("recipes.form.descriptionPlaceholder")}
        />
        <TextField
          select
          label={t("recipes.form.meal")}
          value={form.mealId && knownMealIds.has(form.mealId) ? form.mealId : form.mealId ? "__current" : ""}
          onChange={(e) => {
            if (e.target.value === "__current") return;
            setForm((prev) => ({ ...prev, mealId: e.target.value }));
          }}
          fullWidth
          helperText={t("recipes.form.mealHelper")}
        >
          <MenuItem value="">
            <em>{t("recipes.form.noMeal")}</em>
          </MenuItem>
          {form.mealId && !knownMealIds.has(form.mealId) && (
            <MenuItem value="__current">{t("recipes.form.currentLink")}</MenuItem>
          )}
          {mealGroups.personal.length > 0 && (
            <ListSubheader>{t("recipes.form.myMeals")}</ListSubheader>
          )}
          {mealGroups.personal.map(renderMealOption)}
          {mealGroups.defaults.length > 0 && (
            <ListSubheader>{t("recipes.form.defaultMeals")}</ListSubheader>
          )}
          {mealGroups.defaults.map(renderMealOption)}
        </TextField>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label={t("recipes.form.prepTime")}
            value={form.prepTime}
            onChange={setField("prepTime")}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            error={Boolean(errors.prepTime)}
            helperText={tErr(errors.prepTime)}
            fullWidth
          />
          <TextField
            label={t("recipes.form.cookTime")}
            value={form.cookTime}
            onChange={setField("cookTime")}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            error={Boolean(errors.cookTime)}
            helperText={tErr(errors.cookTime)}
            fullWidth
          />
          <TextField
            label={t("recipes.form.servings")}
            value={form.servings}
            onChange={setField("servings")}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            error={Boolean(errors.servings)}
            helperText={tErr(errors.servings)}
            fullWidth
          />
        </Stack>

        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 0.75 }}
            id="recipe-difficulty-label"
          >
            {t("recipes.form.difficulty")}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={form.difficulty}
            onChange={(_, v) => v && setForm((prev) => ({ ...prev, difficulty: v }))}
            aria-labelledby="recipe-difficulty-label"
          >
            {DIFFICULTIES.map((value) => (
              <ToggleButton key={value} value={value} sx={{ px: 2.5 }}>
                {t(`common.difficulty.${value}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Stack>

      {/* Malzemeler */}
      <SectionTitle
        action={
          <Button
            size="small"
            startIcon={<ContentPasteIcon />}
            onClick={() => setPasteOpen((o) => !o)}
            aria-expanded={pasteOpen}
          >
            {t("recipes.form.bulkPaste")}
          </Button>
        }
      >
        {t("recipes.form.ingredients")}
      </SectionTitle>

      <Collapse in={pasteOpen} unmountOnExit>
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <TextField
            label={t("recipes.form.pasteLabel")}
            placeholder={t("recipes.form.pastePlaceholder")}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            multiline
            minRows={4}
            fullWidth
            helperText={t("recipes.form.pasteHelper")}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
            <Button onClick={() => setPasteOpen(false)}>{t("recipes.form.cancel")}</Button>
            <Button
              variant="contained"
              onClick={applyPaste}
              disabled={!pasteText.trim()}
            >
              {t("recipes.form.add")}
            </Button>
          </Stack>
        </Box>
      </Collapse>

      {errors.ingredients && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {tErr(errors.ingredients)}
        </Alert>
      )}

      <Stack spacing={1.5}>
        {form.ingredients.map((ing, index) => {
          const rowError = errors.ingredientRows?.[ing._key];
          return (
            <Stack
              key={ing._key}
              direction="row"
              spacing={1}
              alignItems="flex-start"
              flexWrap={{ xs: "wrap", sm: "nowrap" }}
              useFlexGap
            >
              <TextField
                label={t("recipes.form.amount")}
                value={ing.amount}
                onChange={(e) => updateIngredient(ing._key, "amount", e.target.value)}
                sx={{ width: { xs: "calc(40% - 4px)", sm: 96 }, flexShrink: 0 }}
                inputProps={{ "aria-label": t("recipes.form.amountAria", { n: index + 1 }) }}
              />
              <Autocomplete
                freeSolo
                options={units}
                value={ing.unit}
                onChange={(_, v) => updateIngredient(ing._key, "unit", v || "")}
                onInputChange={(_, v) => updateIngredient(ing._key, "unit", v || "")}
                sx={{ width: { xs: "calc(60% - 4px)", sm: 170 }, flexShrink: 0 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("recipes.form.unit")}
                    inputProps={{
                      ...params.inputProps,
                      "aria-label": t("recipes.form.unitAria", { n: index + 1 }),
                    }}
                  />
                )}
              />
              <TextField
                label={t("recipes.form.ingredient")}
                value={ing.name}
                onChange={(e) => updateIngredient(ing._key, "name", e.target.value)}
                error={Boolean(rowError)}
                helperText={tErr(rowError)}
                sx={{ flexGrow: 1, minWidth: { xs: "calc(100% - 48px)", sm: 0 } }}
              />
              <IconButton
                onClick={() => removeIngredient(ing._key)}
                aria-label={t("recipes.form.removeIngredientAria", { n: index + 1 })}
                size="small"
                sx={{ mt: 0.5 }}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Stack>
          );
        })}
      </Stack>
      <Button startIcon={<AddIcon />} onClick={addIngredient} sx={{ mt: 1.5 }}>
        {t("recipes.form.addIngredient")}
      </Button>

      {/* Adımlar */}
      <SectionTitle>{t("recipes.form.steps")}</SectionTitle>
      {errors.instructions && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {tErr(errors.instructions)}
        </Alert>
      )}
      <Stack spacing={1.5}>
        {form.instructions.map((step, index) => (
          <Stack key={step._key} direction="row" spacing={1} alignItems="flex-start">
            <Box
              aria-hidden
              sx={{
                width: 30,
                height: 30,
                mt: 0.5,
                flexShrink: 0,
                borderRadius: "50%",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {index + 1}
            </Box>
            <TextField
              value={step.text}
              onChange={(e) => updateInstruction(step._key, e.target.value)}
              placeholder={t("recipes.form.stepPlaceholder", { n: index + 1 })}
              multiline
              minRows={2}
              fullWidth
              inputRef={(el) => {
                instructionRefs.current[step._key] = el;
              }}
              inputProps={{ "aria-label": t("recipes.form.stepAria", { n: index + 1 }) }}
            />
            <Stack spacing={0.25}>
              <IconButton
                size="small"
                onClick={() => moveInstruction(index, -1)}
                disabled={index === 0}
                aria-label={t("recipes.form.moveUpAria", { n: index + 1 })}
              >
                <ArrowUpwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => moveInstruction(index, 1)}
                disabled={index === form.instructions.length - 1}
                aria-label={t("recipes.form.moveDownAria", { n: index + 1 })}
              >
                <ArrowDownwardIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => removeInstruction(step._key)}
                aria-label={t("recipes.form.removeStepAria", { n: index + 1 })}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        ))}
      </Stack>
      <Button startIcon={<AddIcon />} onClick={addInstruction} sx={{ mt: 1.5 }}>
        {t("recipes.form.addStep")}
      </Button>

      {/* Notlar */}
      <SectionTitle>{t("recipes.form.notes")}</SectionTitle>
      <TextField
        value={form.notes}
        onChange={setField("notes")}
        multiline
        minRows={2}
        fullWidth
        placeholder={t("recipes.form.notesPlaceholder")}
        inputProps={{ "aria-label": t("recipes.form.notes") }}
      />

      {isLong && (
        <Alert severity="warning" variant="outlined" sx={{ mt: 2 }}>
          {t("recipes.form.longRecipe")}
        </Alert>
      )}
      {submitError && (
        <Alert severity="error" sx={{ mt: 2 }} role="alert">
          {tErr(submitError)}
        </Alert>
      )}

      <Divider sx={{ mt: 3 }} />
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
          py: 2,
          zIndex: 1,
        }}
      >
        <Button onClick={onClose} disabled={saving}>
          {t("recipes.form.cancel")}
        </Button>
        <Tooltip title={!user ? t("recipes.form.loginTooltip") : ""}>
          <span>
            <Button
              type="submit"
              variant="contained"
              disabled={saving || !user}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving
                ? t("recipes.form.saving")
                : isEdit
                  ? t("recipes.form.saveChanges")
                  : t("recipes.form.save")}
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default RecipeForm;
