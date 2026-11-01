import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweepOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useMeals } from "../context/MealContext";
import { MAX_MEALS_PER_SLOT } from "../constants";
import MealList from "./meals/MealList";
import AddMealForm from "./meals/AddMealForm";
import MealPickerDialog from "./meals/MealPickerDialog";
import ConfirmDialog from "./meals/ConfirmDialog";
import WeekView from "./calendar/WeekView";
import DayView from "./calendar/DayView";
import { getPlanSummary, getTodayKey, slotMeals } from "./calendar/planUtils";
import RecipeQuickView from "./recipes/RecipeQuickView";
import AdBanner from "./ads/AdBanner";

const SAVE_BUTTON = {
  saving: {
    label: "Kaydediliyor…",
    icon: <CircularProgress size={16} color="inherit" />,
    color: "primary",
  },
  success: { label: "Kaydedildi", icon: <CheckIcon />, color: "secondary" },
  error: { label: "Kaydedilemedi", icon: <ErrorOutlineIcon />, color: "error" },
  idle: { label: "Kaydet", icon: <SaveIcon />, color: "primary" },
};

const useSnackbar = () => {
  const [state, setState] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const notify = useCallback(
    (message, severity = "success") =>
      setState({ open: true, message, severity }),
    [],
  );
  const close = useCallback((_, reason) => {
    if (reason === "clickaway") return;
    setState((s) => ({ ...s, open: false }));
  }, []);
  return { ...state, notify, close };
};

const WeekSummary = ({ weekPlan }) => {
  const { plannedSlots, totalSlots, totalCalories } = useMemo(
    () => getPlanSummary(weekPlan),
    [weekPlan],
  );
  return (
    <Box sx={{ minWidth: 200, maxWidth: 360 }}>
      <Typography variant="body2" color="text.secondary">
        <Box component="strong" sx={{ color: "text.primary" }}>
          {plannedSlots}/{totalSlots}
        </Box>{" "}
        öğün planlandı
        {totalCalories > 0 && (
          <>
            {" · "}
            <Box component="strong" sx={{ color: "text.primary" }}>
              {totalCalories.toLocaleString("tr-TR")}
            </Box>{" "}
            kcal
          </>
        )}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={(plannedSlots / totalSlots) * 100}
        aria-label="Plan doluluk oranı"
        sx={{ mt: 0.75, height: 6, borderRadius: 3 }}
      />
    </Box>
  );
};

const PageHeader = ({
  weekPlan,
  saveStatus,
  onShuffle,
  onClear,
  onSave,
  onAddMeal,
}) => {
  const save = SAVE_BUTTON[saveStatus] || SAVE_BUTTON.idle;
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", md: "flex-end" }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{ mb: 1, fontSize: { xs: 28, md: 34 } }}
        >
          Haftalık Plan
        </Typography>
        <WeekSummary weekPlan={weekPlan} />
      </Box>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddMeal}>
          Yemek Ekle
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<ShuffleIcon />}
          onClick={onShuffle}
        >
          Rastgele
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<DeleteSweepIcon />}
          onClick={onClear}
        >
          Temizle
        </Button>
        <Button
          variant="contained"
          color={save.color}
          startIcon={save.icon}
          onClick={onSave}
          disabled={saveStatus === "saving"}
          aria-live="polite"
        >
          {save.label}
        </Button>
      </Stack>
    </Stack>
  );
};

const MealPlannerPage = () => {
  const {
    weekPlan,
    updateMealPlan,
    generateRandomMealPlan,
    clearMealPlan,
    saveMealPlanToFirebase,
    saveStatus,
    error,
  } = useMeals();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const snackbar = useSnackbar();

  const [selectedDay, setSelectedDay] = useState(getTodayKey);
  const [picker, setPicker] = useState({ open: false, day: null, type: null });
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [quickViewMeal, setQuickViewMeal] = useState(null);

  const openPicker = useCallback(
    (day, type) => setPicker({ open: true, day, type }),
    [],
  );
  const closePicker = useCallback(
    () => setPicker((p) => ({ ...p, open: false })),
    [],
  );

  const pickerSlot = picker.day
    ? slotMeals(weekPlan, picker.day, picker.type)
    : [];
  const handlePick = (meal) => {
    if (pickerSlot.length >= MAX_MEALS_PER_SLOT) {
      snackbar.notify(
        `Bir öğüne en fazla ${MAX_MEALS_PER_SLOT} yemek eklenebilir`,
        "warning",
      );
    } else {
      updateMealPlan(picker.day, picker.type, meal, "add");
    }
    closePicker();
  };

  const handleShuffle = () => {
    generateRandomMealPlan();
    snackbar.notify("Rastgele plan oluşturuldu");
  };

  const handleClear = () => {
    clearMealPlan();
    setConfirmClearOpen(false);
    snackbar.notify("Plan temizlendi", "info");
  };

  const handleSave = async () => {
    const ok = await saveMealPlanToFirebase();
    snackbar.notify(
      ok ? "Plan kaydedildi" : "Plan kaydedilemedi. Lütfen tekrar deneyin.",
      ok ? "success" : "error",
    );
  };

  return (
    <Box>
      <PageHeader
        weekPlan={weekPlan}
        saveStatus={saveStatus}
        onShuffle={handleShuffle}
        onClear={() => setConfirmClearOpen(true)}
        onSave={handleSave}
        onAddMeal={() => setAddMealOpen(true)}
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isMobile ? (
        <DayView
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onAddClick={openPicker}
          onMealClick={setQuickViewMeal}
        />
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              md: "280px minmax(0, 1fr)",
              lg: "320px minmax(0, 1fr)",
            },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper
            variant="outlined"
            component="aside"
            aria-label="Yemek kütüphanesi"
            sx={{
              position: "sticky",
              top: 88,
              height: "calc(100vh - 112px)",
              minHeight: 420,
              overflow: "hidden",
              borderRadius: 4,
            }}
          >
            <MealList
              onMealClick={setQuickViewMeal}
              onNotify={snackbar.notify}
            />
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 4, minWidth: 0 }}>
            <WeekView onAddClick={openPicker} onMealClick={setQuickViewMeal} />
          </Paper>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <AdBanner placement="planner" />
      </Box>

      <MealPickerDialog
        open={picker.open}
        onClose={closePicker}
        mealType={picker.type}
        excludeIds={pickerSlot.map((m) => m.id)}
        onPick={handlePick}
      />

      <Dialog
        open={addMealOpen}
        onClose={() => setAddMealOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        {addMealOpen && (
          <AddMealForm
            onClose={() => setAddMealOpen(false)}
            onSaved={(meal) => snackbar.notify(`"${meal.name}" eklendi`)}
          />
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Planı temizle"
        message="Haftalık plandaki tüm yemekler kaldırılacak. Emin misiniz?"
        confirmLabel="Temizle"
        onConfirm={handleClear}
        onClose={() => setConfirmClearOpen(false)}
      />

      <RecipeQuickView
        open={!!quickViewMeal}
        meal={quickViewMeal}
        onClose={() => setQuickViewMeal(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={snackbar.close}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={snackbar.close}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MealPlannerPage;
