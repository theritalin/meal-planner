import React, { useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { palette } from "../../theme";
import { MEAL_TYPES } from "../../constants";
import { useMeals } from "../../context/MealContext";
import { useI18n } from "../../i18n";

const createInitialValues = (type) => ({
  name: "",
  description: "",
  type: MEAL_TYPES.includes(type) ? type : "breakfast",
  calories: "",
  prepTime: "",
});

const validate = (values, t) => {
  const errors = {};
  const e = (key, params) => t(`planner.addMeal.errors.${key}`, params);
  const name = values.name.trim();
  if (!name) errors.name = e("nameRequired");
  else if (name.length < 2) errors.name = e("nameTooShort");
  else if (name.length > 80) errors.name = e("nameTooLong");
  if (values.description.length > 300)
    errors.description = e("descriptionTooLong");
  if (!MEAL_TYPES.includes(values.type)) errors.type = e("typeRequired");

  const checkNumber = (key, max, invalidKey) => {
    if (values[key] === "") return;
    const n = Number(values[key]);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n))
      errors[key] = e(invalidKey);
    else if (n > max) errors[key] = e("max", { max });
  };
  checkNumber("calories", 5000, "invalidCalories");
  checkNumber("prepTime", 1440, "invalidPrepTime");
  return errors;
};

/**
 * Kişisel yemek ekleme formu. Bir <Dialog> içinde kullanılmak üzere
 * DialogTitle/DialogContent/DialogActions döndürür.
 * Props: { onClose, onSaved?(meal), defaultType? }
 */
const AddMealForm = ({ onClose, onSaved, defaultType }) => {
  const { t } = useI18n();
  const { addPersonalMeal } = useMeals();
  const [values, setValues] = useState(() => createInitialValues(defaultType));
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const errors = validate(values, t);
  const showError = (key) => (touched[key] ? errors[key] : undefined);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleBlur = (e) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      description: true,
      calories: true,
      prepTime: true,
      type: true,
    });
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    const saved = await addPersonalMeal({
      name: values.name.trim(),
      description: values.description.trim(),
      type: values.type,
      calories: values.calories === "" ? 0 : Number(values.calories),
      prepTime: values.prepTime === "" ? 0 : Number(values.prepTime),
    });
    setSubmitting(false);

    if (!saved) {
      setSubmitError(t("planner.addMeal.submitError"));
      return;
    }
    onSaved?.(saved);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogTitle sx={{ pr: 6 }}>
        {t("planner.addMeal.title")}
        <IconButton
          aria-label={t("planner.addMeal.close")}
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.25} sx={{ pt: 1 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <TextField
            name="name"
            label={t("planner.addMeal.name")}
            required
            autoFocus
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!showError("name")}
            helperText={showError("name")}
          />
          <TextField
            name="description"
            label={t("planner.addMeal.description")}
            multiline
            minRows={2}
            value={values.description}
            onChange={handleChange}
            onBlur={handleBlur}
            error={!!showError("description")}
            helperText={
              showError("description") || `${values.description.length}/300`
            }
          />
          <Stack spacing={0.75}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 600 }}
            >
              {t("planner.addMeal.type")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={values.type}
              onChange={(_, type) =>
                type && setValues((prev) => ({ ...prev, type }))
              }
              aria-label={t("planner.addMeal.typeLabel")}
            >
              {MEAL_TYPES.map((type) => (
                <ToggleButton
                  key={type}
                  value={type}
                  sx={{
                    "&.Mui-selected, &.Mui-selected:hover": {
                      bgcolor: alpha(palette[type], 0.15),
                      color: palette[type],
                      borderColor: palette[type],
                    },
                  }}
                >
                  {t(`common.mealTypes.${type}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              name="calories"
              label={t("planner.addMeal.calories")}
              type="number"
              fullWidth
              value={values.calories}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("calories")}
              helperText={showError("calories")}
              inputProps={{ min: 0, max: 5000, inputMode: "numeric" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {t("planner.addMeal.kcalUnit")}
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="prepTime"
              label={t("planner.addMeal.prepTime")}
              type="number"
              fullWidth
              value={values.prepTime}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!showError("prepTime")}
              helperText={showError("prepTime")}
              inputProps={{ min: 0, max: 1440, inputMode: "numeric" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {t("planner.addMeal.minUnit")}
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          {t("planner.addMeal.cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {t("planner.addMeal.save")}
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddMealForm;
