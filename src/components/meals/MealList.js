import React, { useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { palette } from "../../theme";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "../../constants";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMealDrag } from "../calendar/dnd";
import ConfirmDialog from "./ConfirmDialog";

const SOURCE_OPTIONS = [
  { value: "all", label: "Tümü" },
  { value: "default", label: "Varsayılan" },
  { value: "personal", label: "Kişisel" },
];

const MetaItem = ({ icon: Icon, children }) => (
  <Stack
    direction="row"
    alignItems="center"
    spacing={0.25}
    sx={{ color: "text.secondary" }}
  >
    <Icon sx={{ fontSize: 14 }} />
    <Typography variant="caption">{children}</Typography>
  </Stack>
);

/** Kütüphanedeki sürüklenebilir yemek kartı. */
const MealCard = ({ meal, recipeCount, onClick, onDelete }) => {
  const { dragRef, isDragging } = useMealDrag(meal);
  const accent = palette[meal.type] || palette.primary;

  return (
    <Box
      ref={dragRef}
      onClick={() => onClick?.(meal)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        p: 1,
        pl: 0.5,
        borderRadius: 2.5,
        border: 1,
        borderColor: "divider",
        borderLeft: `4px solid ${accent}`,
        bgcolor: "background.paper",
        cursor: "grab",
        opacity: isDragging ? 0.4 : 1,
        transition: "box-shadow .15s ease, transform .15s ease",
        "&:hover": {
          boxShadow: `0 4px 14px ${alpha(accent, 0.18)}`,
          transform: "translateY(-1px)",
        },
        "&:hover .meal-delete": { opacity: 1 },
      }}
    >
      <DragIndicatorIcon sx={{ fontSize: 18, color: "text.disabled" }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600 }}
            noWrap
            title={meal.name}
          >
            {meal.name}
          </Typography>
          {recipeCount > 0 && (
            <Tooltip title={`${recipeCount} tarif`}>
              <MenuBookIcon
                aria-label="Tarifi var"
                sx={{ fontSize: 15, color: "secondary.main", flexShrink: 0 }}
              />
            </Tooltip>
          )}
        </Stack>
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{ mt: 0.25 }}
        >
          <Typography variant="caption" sx={{ color: accent, fontWeight: 600 }}>
            {MEAL_TYPE_LABELS[meal.type]}
          </Typography>
          {meal.calories ? (
            <MetaItem icon={LocalFireDepartmentIcon}>
              {meal.calories} kcal
            </MetaItem>
          ) : null}
          {meal.prepTime ? (
            <MetaItem icon={ScheduleIcon}>{meal.prepTime} dk</MetaItem>
          ) : null}
          {meal.isPersonal && (
            <Chip
              label="Kişisel"
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: 10 }}
            />
          )}
        </Stack>
      </Box>
      {meal.isPersonal && onDelete && (
        <Tooltip title="Sil">
          <IconButton
            className="meal-delete"
            size="small"
            aria-label={`${meal.name} yemeğini sil`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(meal);
            }}
            sx={{ opacity: { xs: 1, md: 0.5 }, transition: "opacity .15s" }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

const MealListFilters = () => {
  const {
    searchTerm,
    setSearchTerm,
    mealTypeFilter,
    setMealTypeFilter,
    mealFilter,
    setMealFilter,
  } = useMeals();

  return (
    <Stack spacing={1.25}>
      <TextField
        fullWidth
        placeholder="Yemek ara…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        inputProps={{ "aria-label": "Yemek ara" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Aramayı temizle"
                onClick={() => setSearchTerm("")}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ flexWrap: "wrap", rowGap: 0.75 }}
      >
        {["all", ...MEAL_TYPES].map((type) => {
          const selected = mealTypeFilter === type;
          const accent = palette[type];
          return (
            <Chip
              key={type}
              size="small"
              label={type === "all" ? "Hepsi" : MEAL_TYPE_LABELS[type]}
              onClick={() => setMealTypeFilter(type)}
              variant={selected ? "filled" : "outlined"}
              sx={
                selected
                  ? accent
                    ? {
                        bgcolor: alpha(accent, 0.16),
                        color: accent,
                        borderColor: accent,
                      }
                    : { bgcolor: "text.primary", color: "background.paper" }
                  : undefined
              }
            />
          );
        })}
      </Stack>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={mealFilter}
        onChange={(_, v) => v && setMealFilter(v)}
        aria-label="Yemek kaynağı"
      >
        {SOURCE_OPTIONS.map((o) => (
          <ToggleButton
            key={o.value}
            value={o.value}
            sx={{ py: 0.4, fontSize: 12 }}
          >
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};

/**
 * Aranabilir/filtrelenebilir, sürüklenebilir yemek kütüphanesi.
 * Props: { onMealClick?(meal), onNotify?(message, severity) }
 * Kapsayıcının yüksekliğini doldurur; liste kendi içinde kayar.
 */
const MealList = ({ onMealClick, onNotify }) => {
  const { filteredMeals, loading, deletePersonalMeal } = useMeals();
  const { getRecipesForMeal } = useRecipes();
  const [pendingDelete, setPendingDelete] = useState(null);

  const sortedMeals = useMemo(
    () =>
      [...filteredMeals].sort((a, b) =>
        (a.name || "").localeCompare(b.name || "", "tr"),
      ),
    [filteredMeals],
  );

  const handleConfirmDelete = async () => {
    const meal = pendingDelete;
    setPendingDelete(null);
    if (!meal) return;
    const ok = await deletePersonalMeal(meal.id);
    onNotify?.(
      ok
        ? `"${meal.name}" silindi`
        : "Yemek silinemedi. Lütfen tekrar deneyin.",
      ok ? "success" : "error",
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
          sx={{ mb: 1.5 }}
        >
          <Typography variant="h6" component="h2">
            Yemekler
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {loading ? "" : `${sortedMeals.length} yemek`}
          </Typography>
        </Stack>
        <MealListFilters />
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          px: 2,
          pb: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              height={56}
              sx={{ flexShrink: 0 }}
            />
          ))
        ) : sortedMeals.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            Eşleşen yemek bulunamadı.
          </Typography>
        ) : (
          sortedMeals.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              recipeCount={
                meal.recipes?.length || getRecipesForMeal(meal.id).length
              }
              onClick={onMealClick}
              onDelete={setPendingDelete}
            />
          ))
        )}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          px: 2,
          py: 1,
          borderTop: 1,
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        Yemekleri sürükleyip haftalık plana bırakın
      </Typography>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Yemeği sil"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" kişisel yemeklerinizden silinsin mi?`
            : ""
        }
        confirmLabel="Sil"
        onConfirm={handleConfirmDelete}
        onClose={() => setPendingDelete(null)}
      />
    </Box>
  );
};

export default MealList;
