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
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "../../constants";
import { useMeals } from "../../context/MealContext";

const createInitialValues = (type) => ({
  name: "",
  description: "",
  type: MEAL_TYPES.includes(type) ? type : "breakfast",
  calories: "",
  prepTime: "",
});

const validate = (values) => {
  const errors = {};
  const name = values.name.trim();
  if (!name) errors.name = "Yemek adı gerekli";
  else if (name.length < 2) errors.name = "En az 2 karakter olmalı";
  else if (name.length > 80) errors.name = "En fazla 80 karakter olabilir";
  if (values.description.length > 300)
    errors.description = "En fazla 300 karakter olabilir";
  if (!MEAL_TYPES.includes(values.type)) errors.type = "Öğün seçin";

  const checkNumber = (key, max, label) => {
    if (values[key] === "") return;
    const n = Number(values[key]);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n))
      errors[key] = `Geçerli bir ${label} girin`;
    else if (n > max) errors[key] = `En fazla ${max} olabilir`;
  };
  checkNumber("calories", 5000, "kalori");
  checkNumber("prepTime", 1440, "süre");
  return errors;
};

/**
 * Kişisel yemek ekleme formu. Bir <Dialog> içinde kullanılmak üzere
 * DialogTitle/DialogContent/DialogActions döndürür.
 * Props: { onClose, onSaved?(meal), defaultType? }
 */
const AddMealForm = ({ onClose, onSaved, defaultType }) => {
  const { addPersonalMeal } = useMeals();
  const [values, setValues] = useState(() => createInitialValues(defaultType));
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const errors = validate(values);
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
      setSubmitError(
        "Yemek kaydedilemedi. Giriş yaptığınızdan emin olup tekrar deneyin.",
      );
      return;
    }
    onSaved?.(saved);
    onClose?.();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogTitle sx={{ pr: 6 }}>
        Yeni yemek ekle
        <IconButton
          aria-label="Kapat"
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
            label="Yemek adı"
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
            label="Açıklama"
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
              Öğün
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={values.type}
              onChange={(_, type) =>
                type && setValues((prev) => ({ ...prev, type }))
              }
              aria-label="Öğün türü"
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
                  {MEAL_TYPE_LABELS[type]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
          <Stack direction="row" spacing={2}>
            <TextField
              name="calories"
              label="Kalori"
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
                  <InputAdornment position="end">kcal</InputAdornment>
                ),
              }}
            />
            <TextField
              name="prepTime"
              label="Hazırlık"
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
                  <InputAdornment position="end">dk</InputAdornment>
                ),
              }}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Vazgeç
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Kaydet
        </Button>
      </DialogActions>
    </form>
  );
};

export default AddMealForm;
