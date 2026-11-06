import React, { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Fab,
  Grid,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import { MEAL_TYPES } from "../../constants";
import { useI18n } from "../../i18n";
import AdBanner from "../ads/AdBanner";
import RecipeCard from "./RecipeCard";
import RecipeFormDialog from "./RecipeFormDialog";
import { DIFFICULTIES, useMealIndex } from "./recipeHelpers";

const FILTERS = ["all", "personal", "saved", "default"];

const StatPill = ({ value, label }) => (
  <Box sx={{ minWidth: 72 }}>
    <Typography
      sx={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: { xs: 26, sm: 32 },
        lineHeight: 1.1,
      }}
    >
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

const CardSkeleton = () => (
  <Card sx={{ height: "100%", p: 2 }}>
    <Skeleton variant="text" width="30%" />
    <Skeleton variant="text" sx={{ fontSize: 24 }} width="80%" />
    <Skeleton variant="text" width="95%" />
    <Skeleton variant="text" width="60%" />
    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
      <Skeleton variant="rounded" width={64} height={24} />
      <Skeleton variant="rounded" width={72} height={24} />
      <Skeleton variant="rounded" width={52} height={24} />
    </Stack>
  </Card>
);

const EmptyState = ({ icon: Icon, title, text, action }) => (
  <Paper
    variant="outlined"
    sx={{
      textAlign: "center",
      py: { xs: 6, sm: 8 },
      px: 3,
      borderStyle: "dashed",
      bgcolor: "transparent",
    }}
  >
    <Box
      sx={{
        width: 88,
        height: 88,
        mx: "auto",
        mb: 2,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
        color: "primary.main",
      }}
    >
      <Icon sx={{ fontSize: 44 }} />
    </Box>
    <Typography variant="h6" component="p" gutterBottom>
      {title}
    </Typography>
    <Typography
      color="text.secondary"
      sx={{ maxWidth: 420, mx: "auto", mb: action ? 3 : 0 }}
    >
      {text}
    </Typography>
    {action}
  </Paper>
);

/** /recipes — Tarif Kitabım */
const RecipeBookPage = () => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const {
    allRecipes,
    userRecipes,
    savedRecipes,
    filteredRecipes,
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    recipeFilter,
    setRecipeFilter,
    isRecipeSaved,
    saveRecipe,
    unsaveRecipe,
    loading,
    error,
  } = useRecipes();
  const { user } = useMeals();
  const mealIndex = useMealIndex();

  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const mealTypeOf = useCallback(
    (recipe) => mealIndex.get(recipe.mealId)?.type || null,
    [mealIndex]
  );

  const visibleRecipes = useMemo(() => {
    const list =
      mealTypeFilter === "all"
        ? filteredRecipes
        : filteredRecipes.filter((r) => mealTypeOf(r) === mealTypeFilter);
    return [...list].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", lang)
    );
  }, [filteredRecipes, mealTypeFilter, mealTypeOf, lang]);

  const hasActiveFilters =
    Boolean(searchTerm) || difficultyFilter !== "all" || mealTypeFilter !== "all";

  const resetFilters = () => {
    setSearchTerm("");
    setDifficultyFilter("all");
    setMealTypeFilter("all");
  };

  const openForm = () => {
    if (!user) {
      setToast({
        message: t("recipes.toast.loginToAdd"),
        action: "login",
      });
      return;
    }
    setFormOpen(true);
  };

  const handleToggleSave = async (recipe) => {
    if (!user) {
      setToast({ message: t("recipes.toast.loginToSave"), action: "login" });
      return;
    }
    if (isRecipeSaved(recipe.id)) {
      const ok = await unsaveRecipe(user.uid, recipe.id);
      setToast({
        message: ok ? t("recipes.toast.removed") : t("recipes.toast.failed"),
      });
    } else {
      const ok = await saveRecipe(user.uid, recipe);
      setToast({
        message: ok ? t("recipes.toast.saved") : t("recipes.toast.failed"),
      });
    }
  };

  const renderEmpty = () => {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={SearchOffIcon}
          title={t("recipes.book.empty.noMatchTitle")}
          text={t("recipes.book.empty.noMatchText")}
          action={
            <Button variant="outlined" onClick={resetFilters}>
              {t("recipes.book.empty.clearFilters")}
            </Button>
          }
        />
      );
    }
    if (recipeFilter === "personal") {
      return (
        <EmptyState
          icon={MenuBookOutlinedIcon}
          title={t("recipes.book.empty.personalTitle")}
          text={t("recipes.book.empty.personalText")}
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={openForm}>
              {t("recipes.book.empty.personalAction")}
            </Button>
          }
        />
      );
    }
    if (recipeFilter === "saved") {
      return (
        <EmptyState
          icon={BookmarkBorderIcon}
          title={t("recipes.book.empty.savedTitle")}
          text={t("recipes.book.empty.savedText")}
          action={
            <Button variant="outlined" onClick={() => setRecipeFilter("default")}>
              {t("recipes.book.empty.savedAction")}
            </Button>
          }
        />
      );
    }
    return (
      <EmptyState
        icon={MenuBookOutlinedIcon}
        title={t("recipes.book.empty.noneTitle")}
        text={t("recipes.book.empty.noneText")}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openForm}>
            {t("recipes.book.newRecipe")}
          </Button>
        }
      />
    );
  };

  return (
    <Box sx={{ pb: { xs: 10, sm: 4 } }}>
      {/* Başlık şeridi */}
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2.5, sm: 4 },
          mb: 3,
          borderRadius: 4,
          border: 1,
          borderColor: "divider",
          background: (t) =>
            `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.1)} 0%, ${alpha(
              t.palette.secondary.main,
              0.08
            )} 100%)`,
        }}
      >
        <MenuBookOutlinedIcon
          aria-hidden
          sx={{
            position: "absolute",
            right: { xs: -20, sm: 24 },
            bottom: { xs: -24, sm: -16 },
            fontSize: { xs: 120, sm: 170 },
            color: "primary.main",
            opacity: 0.08,
          }}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "flex-end" }}
          sx={{ position: "relative" }}
        >
          <Box>
            <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 32, sm: 42 } }}>
              {t("recipes.book.title")}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5, maxWidth: 520 }}>
              {t("recipes.book.subtitle")}
            </Typography>
            <Stack direction="row" spacing={{ xs: 2.5, sm: 4 }}>
              <StatPill value={userRecipes.length} label={t("recipes.book.stats.mine")} />
              <StatPill value={savedRecipes.length} label={t("recipes.book.stats.saved")} />
              <StatPill value={allRecipes.length} label={t("recipes.book.stats.total")} />
            </Stack>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={openForm}
              sx={{ display: { xs: "none", sm: "inline-flex" } }}
            >
              {t("recipes.book.newRecipe")}
            </Button>
            <Button
              component={RouterLink}
              to="/export"
              variant="outlined"
              size="large"
              startIcon={<PictureAsPdfOutlinedIcon />}
              sx={{ bgcolor: "background.paper" }}
            >
              {t("recipes.book.exportPdf")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Arama ve filtreler */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t("recipes.book.searchPlaceholder")}
          inputProps={{ "aria-label": t("recipes.book.searchAria") }}
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchTerm ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearchTerm("")}
                  aria-label={t("recipes.book.clearSearch")}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{
            overflowX: "auto",
            pb: 0.5,
            mx: { xs: -2, sm: 0 },
            px: { xs: 2, sm: 0 },
            flexWrap: { xs: "nowrap", sm: "wrap" },
            scrollbarWidth: "none",
          }}
          role="group"
          aria-label={t("recipes.book.sourceAria")}
        >
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={t(`recipes.book.filters.${f}`)}
              clickable
              color={recipeFilter === f ? "primary" : "default"}
              variant={recipeFilter === f ? "filled" : "outlined"}
              onClick={() => setRecipeFilter(f)}
              aria-pressed={recipeFilter === f}
              sx={{ flexShrink: 0, bgcolor: recipeFilter === f ? undefined : "background.paper" }}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <TextField
            select
            label={t("recipes.book.difficulty")}
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            sx={{ minWidth: 140, flex: { xs: 1, sm: "0 0 auto" }, bgcolor: "background.paper" }}
          >
            <MenuItem value="all">{t("recipes.book.all")}</MenuItem>
            {DIFFICULTIES.map((v) => (
              <MenuItem key={v} value={v}>
                {t(`common.difficulty.${v}`)}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={t("recipes.book.mealType")}
            value={mealTypeFilter}
            onChange={(e) => setMealTypeFilter(e.target.value)}
            sx={{ minWidth: 140, flex: { xs: 1, sm: "0 0 auto" }, bgcolor: "background.paper" }}
          >
            <MenuItem value="all">{t("recipes.book.all")}</MenuItem>
            {MEAL_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {t(`common.mealTypes.${type}`)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Izgara başlığı */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6" component="h2">
          {FILTERS.includes(recipeFilter)
            ? t(`recipes.book.filters.${recipeFilter}`)
            : t("recipes.book.gridTitle")}
        </Typography>
        {!loading && (
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            {t("recipes.book.count", { count: visibleRecipes.length })}
          </Typography>
        )}
      </Stack>

      <AdBanner placement="recipes" />

      <Box sx={{ mt: 2 }}>
        {loading ? (
          <Grid container spacing={2} aria-busy="true" aria-label={t("recipes.book.loadingAria")}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <CardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : visibleRecipes.length === 0 ? (
          renderEmpty()
        ) : (
          <Grid container spacing={2}>
            {visibleRecipes.map((recipe) => (
              <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                <RecipeCard
                  recipe={recipe}
                  mealType={mealTypeOf(recipe)}
                  isSaved={isRecipeSaved(recipe.id)}
                  onToggleSave={handleToggleSave}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Mobil FAB — kabuğun alt gezinme çubuğunun üstünde */}
      <Fab
        color="primary"
        variant="extended"
        onClick={openForm}
        aria-label={t("recipes.book.newRecipeAria")}
        sx={{
          display: { xs: "inline-flex", sm: "none" },
          position: "fixed",
          right: 16,
          bottom: 88,
          zIndex: (t) => t.zIndex.speedDial,
        }}
      >
        <AddIcon sx={{ mr: 0.5 }} />
        {t("recipes.book.newRecipe")}
      </Fab>

      <RecipeFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={(recipe) => {
          setToast({ message: t("recipes.toast.recipeSaved"), recipeId: recipe?.id });
        }}
      />

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== "clickaway" && setToast(null)}
        message={toast?.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
        action={
          toast?.action === "login" ? (
            <Button color="inherit" size="small" onClick={() => navigate("/login")}>
              {t("recipes.toast.login")}
            </Button>
          ) : toast?.recipeId ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate(`/recipes/${toast.recipeId}`)}
            >
              {t("recipes.toast.view")}
            </Button>
          ) : null
        }
      />
    </Box>
  );
};

export default RecipeBookPage;
