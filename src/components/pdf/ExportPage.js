import React, { useCallback, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import AdBanner from "../ads/AdBanner";
import { DAYS, MEAL_TYPES } from "../../constants";
import { useI18n } from "../../i18n";
import { translate } from "../../i18n/core";
import { dedupeById, recipeMatches } from "../../utils/recipes";
import { palette } from "../../theme";
import { buildShoppingList, summarizePlan } from "./shoppingList";
import { computeRecipeLayout } from "./fitRecipe";
import {
  generateCookbookBlob,
  generatePlanBlob,
  previewPdf,
  saveBlob,
  slugify,
} from "./exportUtils";

const MEAL_ORDER = { breakfast: 0, lunch: 1, dinner: 2 };

const SectionHeader = ({ icon, title, subtitle }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: 3,
        display: "grid",
        placeItems: "center",
        color: "primary.main",
        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h6" component="h2" sx={{ lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  </Stack>
);

const Stat = ({ value, label }) => (
  <Box sx={{ minWidth: 72 }}>
    <Typography
      sx={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontWeight: 700,
        fontSize: 26,
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

const ActionButtons = ({
  busy,
  disabled,
  onDownload,
  onPreview,
  downloadKey,
  previewKey,
  downloadLabel,
}) => {
  const { t } = useI18n();
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <Button
        variant="contained"
        size="large"
        onClick={onDownload}
        disabled={disabled || Boolean(busy)}
        startIcon={
          busy === downloadKey ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <DownloadRoundedIcon />
          )
        }
      >
        {busy === downloadKey
          ? t("pdf.export.preparing")
          : downloadLabel || t("pdf.export.download")}
      </Button>
      <Button
        variant="outlined"
        size="large"
        onClick={onPreview}
        disabled={disabled || Boolean(busy)}
        startIcon={
          busy === previewKey ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <VisibilityOutlinedIcon />
          )
        }
      >
        {t("pdf.export.preview")}
      </Button>
    </Stack>
  );
};

// Varsayılan kitap adı (her iki dilde); kullanıcı değiştirmediyse dosya adı
// ve başlık geçerli dile göre verilir.
const DEFAULT_TITLES = ["tr", "en"].map((code) =>
  translate(code, "pdf.doc.defaultBookTitle")
);

/** /export — haftalık plan ve tarif kitabı PDF dışa aktarma sayfası. */
const ExportPage = () => {
  const { t, lang, locale } = useI18n();
  const { weekPlan, meals, user } = useMeals();
  const { cookbookRecipes, recipes, getRecipesForMeal, loading } =
    useRecipes();

  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  // null = kullanıcı değiştirmedi → geçerli dildeki varsayılan ad gösterilir
  const [customTitle, setCustomTitle] = useState(null);
  const bookTitle = customTitle ?? t("pdf.doc.defaultBookTitle");
  const [includeDefaults, setIncludeDefaults] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("az");
  // null = henüz dokunulmadı → tümü seçili kabul edilir
  const [selection, setSelection] = useState(null);

  const author =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "");

  // ---- Haftalık plan ----
  const planSummary = useMemo(() => summarizePlan(weekPlan), [weekPlan]);
  const shoppingCount = useMemo(
    () => buildShoppingList(weekPlan, getRecipesForMeal, lang).length,
    [weekPlan, getRecipesForMeal, lang]
  );

  // ---- Tarif kitabı ----
  const mealTypeById = useMemo(() => {
    const map = new Map();
    (meals || []).forEach((m) => map.set(m.id, m.type));
    return map;
  }, [meals]);

  const available = useMemo(() => {
    const list = includeDefaults
      ? dedupeById([...(cookbookRecipes || []), ...(recipes || [])])
      : cookbookRecipes || [];
    const withType = list.map((r) => ({
      ...r,
      mealType: r.mealType || mealTypeById.get(r.mealId) || undefined,
    }));
    const byName = (a, b) =>
      (a.name || "").localeCompare(b.name || "", locale, {
        sensitivity: "base",
      });
    return withType.sort((a, b) => {
      if (sort === "type") {
        const ta = MEAL_ORDER[a.mealType] ?? 9;
        const tb = MEAL_ORDER[b.mealType] ?? 9;
        if (ta !== tb) return ta - tb;
      }
      return byName(a, b);
    });
  }, [includeDefaults, cookbookRecipes, recipes, mealTypeById, sort, locale]);

  const selectedIds = useMemo(
    () => selection ?? new Set(available.map((r) => r.id)),
    [selection, available]
  );

  const visible = useMemo(
    () => available.filter((r) => recipeMatches(r, search)),
    [available, search]
  );

  const selectedRecipes = useMemo(
    () => available.filter((r) => selectedIds.has(r.id)),
    [available, selectedIds]
  );

  const pageEstimate = useMemo(() => {
    const layouts = new Map();
    selectedRecipes.forEach((r) =>
      layouts.set(r.id, computeRecipeLayout(r, lang).estimatedPages)
    );
    return layouts;
  }, [selectedRecipes, lang]);

  const totalRecipePages = [...pageEstimate.values()].reduce(
    (a, b) => a + b,
    0
  );

  const toggle = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelection(next);
  };

  const selectAll = () => {
    const next = new Set(selectedIds);
    visible.forEach((r) => next.add(r.id));
    setSelection(next);
  };

  const selectNone = () => {
    const next = new Set(selectedIds);
    visible.forEach((r) => next.delete(r.id));
    setSelection(next);
  };

  // ---- Eylemler ----
  const run = useCallback(async (key, task) => {
    setBusy(key);
    setError("");
    try {
      await task();
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      setError("pdf.export.error");
    } finally {
      setBusy(null);
    }
  }, []);

  const makePlanBlob = () =>
    generatePlanBlob({ weekPlan, getRecipesForMeal, author, lang });

  const makeBookBlob = () =>
    generateCookbookBlob({
      recipes: selectedRecipes,
      title: bookTitle.trim() || t("pdf.doc.defaultBookTitle"),
      author,
      lang,
    });

  const previewName = `${t("pdf.files.preview")}.pdf`;

  const handlePlanDownload = () =>
    run("plan-download", async () =>
      saveBlob(await makePlanBlob(), `${t("pdf.files.plan")}.pdf`)
    );
  const handlePlanPreview = () =>
    run("plan-preview", () => previewPdf(makePlanBlob, previewName));

  const handleBookDownload = () =>
    run("book-download", async () => {
      const name = bookTitle.trim();
      const file =
        !name || DEFAULT_TITLES.includes(name)
          ? t("pdf.files.cookbook")
          : slugify(name, t("pdf.files.cookbook"));
      await saveBlob(await makeBookBlob(), `${file}.pdf`);
    });
  const handleBookPreview = () =>
    run("book-preview", () => previewPdf(makeBookBlob, previewName));

  const planEmpty = planSummary.mealCount === 0;
  const visibleSelected = visible.filter((r) => selectedIds.has(r.id)).length;

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t("pdf.export.title")}
        </Typography>
        <Typography color="text.secondary">{t("pdf.export.subtitle")}</Typography>
      </Box>

      <Stack spacing={3}>
        {/* ---------- Haftalık plan ---------- */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <SectionHeader
              icon={<CalendarMonthOutlinedIcon />}
              title={t("pdf.export.plan.title")}
              subtitle={t("pdf.export.plan.subtitle")}
            />

            <Stack
              direction="row"
              spacing={{ xs: 2, sm: 4 }}
              sx={{ mb: 2.5 }}
              useFlexGap
              flexWrap="wrap"
            >
              <Stat
                value={planSummary.mealCount}
                label={t("pdf.export.plan.statMeals", {
                  count: planSummary.mealCount,
                })}
              />
              <Stat
                value={`${planSummary.activeDays}/7`}
                label={t("pdf.export.plan.statDays", { count: 7 })}
              />
              <Stat
                value={shoppingCount}
                label={t("pdf.export.plan.statIngredients", {
                  count: shoppingCount,
                })}
              />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: { xs: 0.5, sm: 1 },
                mb: 3,
              }}
              aria-label={t("pdf.export.plan.summaryAria")}
            >
              {DAYS.map((day) => (
                <Box
                  key={day}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    p: { xs: 0.5, sm: 1 },
                    textAlign: "center",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, display: "block" }}
                  >
                    {t(`common.daysShort.${day}`)}
                  </Typography>
                  <Stack
                    spacing={0.5}
                    alignItems="center"
                    sx={{ mt: 0.75 }}
                  >
                    {MEAL_TYPES.map((type) => {
                      const count = weekPlan?.[day]?.[type]?.length || 0;
                      return (
                        <Tooltip
                          key={type}
                          title={t("pdf.export.plan.slotTooltip", {
                            meal: t(`common.mealTypes.${type}`),
                            count,
                          })}
                        >
                          <Box
                            sx={{
                              width: "100%",
                              maxWidth: 36,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: count
                                ? palette[type]
                                : (t) => alpha(t.palette.text.primary, 0.08),
                            }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Box>

            {planEmpty ? (
              <Alert
                severity="info"
                sx={{ mb: 2 }}
                action={
                  <Button component={RouterLink} to="/" color="inherit">
                    {t("pdf.export.plan.goToPlan")}
                  </Button>
                }
              >
                {t("pdf.export.plan.empty")}
              </Alert>
            ) : null}

            <ActionButtons
              busy={busy}
              disabled={planEmpty}
              onDownload={handlePlanDownload}
              onPreview={handlePlanPreview}
              downloadKey="plan-download"
              previewKey="plan-preview"
            />
            {busy?.startsWith("plan") ? (
              <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
            ) : null}
          </CardContent>
        </Card>

        <AdBanner placement="export" />

        {/* ---------- Tarif kitabı ---------- */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <SectionHeader
              icon={<MenuBookOutlinedIcon />}
              title={t("pdf.export.book.title")}
              subtitle={t("pdf.export.book.subtitle")}
            />

            <Stack spacing={2}>
              <TextField
                label={t("pdf.export.book.titleLabel")}
                value={bookTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                inputProps={{ maxLength: 60 }}
                fullWidth
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
              >
                <TextField
                  placeholder={t("pdf.export.book.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ flex: 1 }}
                  inputProps={{ "aria-label": t("pdf.export.book.search") }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  select
                  label={t("pdf.export.book.sortLabel")}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="az">{t("pdf.export.book.sortAz")}</MenuItem>
                  <MenuItem value="type">
                    {t("pdf.export.book.sortType")}
                  </MenuItem>
                </TextField>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={includeDefaults}
                    onChange={(e) => setIncludeDefaults(e.target.checked)}
                  />
                }
                label={t("pdf.export.book.includeDefaults")}
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
              spacing={1}
            >
              <Typography variant="body2" color="text.secondary">
                {t("pdf.export.book.selected", {
                  selected: selectedRecipes.length,
                  total: available.length,
                })}
                {selectedRecipes.length
                  ? t("pdf.export.book.pageEstimate", {
                      count: totalRecipePages + 2,
                    })
                  : ""}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  onClick={selectAll}
                  disabled={!visible.length || visibleSelected === visible.length}
                >
                  {t("pdf.export.book.selectAll")}
                </Button>
                <Button
                  size="small"
                  onClick={selectNone}
                  disabled={!visibleSelected}
                >
                  {t("pdf.export.book.selectNone")}
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                maxHeight: 380,
                overflowY: "auto",
              }}
            >
              {loading && !available.length ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              ) : !available.length ? (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary" sx={{ mb: 1.5 }}>
                    {t("pdf.export.book.empty")}
                  </Typography>
                  <Button component={RouterLink} to="/recipes" variant="outlined">
                    {t("pdf.export.book.goToRecipes")}
                  </Button>
                </Box>
              ) : !visible.length ? (
                <Typography color="text.secondary" sx={{ p: 3 }}>
                  {t("pdf.export.book.noMatch", { query: search })}
                </Typography>
              ) : (
                <List dense disablePadding>
                  {visible.map((recipe, i) => {
                    const checked = selectedIds.has(recipe.id);
                    const pages = checked
                      ? pageEstimate.get(recipe.id)
                      : null;
                    const labelId = `export-recipe-${recipe.id}`;
                    return (
                      <ListItem
                        key={recipe.id}
                        disablePadding
                        divider={i < visible.length - 1}
                        secondaryAction={
                          recipe.mealType ? (
                            <Chip
                              size="small"
                              variant="outlined"
                              label={t(`common.mealTypes.${recipe.mealType}`)}
                              sx={{
                                borderColor: alpha(
                                  palette[recipe.mealType] || palette.border,
                                  0.5
                                ),
                              }}
                            />
                          ) : null
                        }
                      >
                        <ListItemButton
                          onClick={() => toggle(recipe.id)}
                          sx={{ pr: 12 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Checkbox
                              edge="start"
                              checked={checked}
                              tabIndex={-1}
                              disableRipple
                              inputProps={{ "aria-labelledby": labelId }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            id={labelId}
                            primary={
                              recipe.name || t("pdf.doc.untitledRecipe")
                            }
                            secondary={
                              pages > 1
                                ? t("pdf.export.book.longRecipe", {
                                    count: pages,
                                  })
                                : recipe.isPersonal
                                ? t("pdf.export.book.personal")
                                : null
                            }
                            primaryTypographyProps={{ noWrap: true }}
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>

            <Box sx={{ mt: 3 }}>
              <ActionButtons
                busy={busy}
                disabled={!selectedRecipes.length}
                onDownload={handleBookDownload}
                onPreview={handleBookPreview}
                downloadKey="book-download"
                previewKey="book-preview"
              />
              {busy?.startsWith("book") ? (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress sx={{ borderRadius: 1 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1 }}
                  >
                    {t("pdf.export.book.placing", {
                      count: selectedRecipes.length,
                    })}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </CardContent>
        </Card>
      </Stack>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 9, md: 0 } }}
      >
        <Alert severity="error" onClose={() => setError("")} variant="filled">
          {error ? t(error) : null}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportPage;
