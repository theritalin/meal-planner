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
import {
  DAYS,
  DAY_SHORT_LABELS,
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
} from "../../constants";
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
  downloadLabel = "PDF İndir",
}) => (
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
      {busy === downloadKey ? "Hazırlanıyor…" : downloadLabel}
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
      Önizle
    </Button>
  </Stack>
);

/** /export — haftalık plan ve tarif kitabı PDF dışa aktarma sayfası. */
const ExportPage = () => {
  const { weekPlan, meals, user } = useMeals();
  const { cookbookRecipes, recipes, getRecipesForMeal, loading } =
    useRecipes();

  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [bookTitle, setBookTitle] = useState("Tarif Kitabım");
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
    () => buildShoppingList(weekPlan, getRecipesForMeal).length,
    [weekPlan, getRecipesForMeal]
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
      (a.name || "").localeCompare(b.name || "", "tr", {
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
  }, [includeDefaults, cookbookRecipes, recipes, mealTypeById, sort]);

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
      layouts.set(r.id, computeRecipeLayout(r).estimatedPages)
    );
    return layouts;
  }, [selectedRecipes]);

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
      setError("PDF oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setBusy(null);
    }
  }, []);

  const makePlanBlob = () =>
    generatePlanBlob({ weekPlan, getRecipesForMeal, author });

  const makeBookBlob = () =>
    generateCookbookBlob({
      recipes: selectedRecipes,
      title: bookTitle.trim() || "Tarif Kitabım",
      author,
    });

  const handlePlanDownload = () =>
    run("plan-download", async () =>
      saveBlob(await makePlanBlob(), "haftalik-yemek-plani.pdf")
    );
  const handlePlanPreview = () =>
    run("plan-preview", () => previewPdf(makePlanBlob));

  const handleBookDownload = () =>
    run("book-download", async () => {
      const name = bookTitle.trim();
      const file =
        !name || name === "Tarif Kitabım" ? "tarif-kitabim" : slugify(name);
      await saveBlob(await makeBookBlob(), `${file}.pdf`);
    });
  const handleBookPreview = () =>
    run("book-preview", () => previewPdf(makeBookBlob));

  const planEmpty = planSummary.mealCount === 0;
  const visibleSelected = visible.filter((r) => selectedIds.has(r.id)).length;

  return (
    <Box sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dışa Aktar
        </Typography>
        <Typography color="text.secondary">
          Haftalık planınızı ve tarif kitabınızı yazdırmaya hazır, şık PDF'ler
          olarak indirin.
        </Typography>
      </Box>

      <Stack spacing={3}>
        {/* ---------- Haftalık plan ---------- */}
        <Card>
          <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
            <SectionHeader
              icon={<CalendarMonthOutlinedIcon />}
              title="Haftalık Plan"
              subtitle="Yatay A4 plan tablosu ve malzemeleri birleştirilmiş alışveriş listesi"
            />

            <Stack
              direction="row"
              spacing={{ xs: 2, sm: 4 }}
              sx={{ mb: 2.5 }}
              useFlexGap
              flexWrap="wrap"
            >
              <Stat value={planSummary.mealCount} label="yemek" />
              <Stat value={`${planSummary.activeDays}/7`} label="gün" />
              <Stat value={shoppingCount} label="malzeme" />
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                gap: { xs: 0.5, sm: 1 },
                mb: 3,
              }}
              aria-label="Haftalık plan özeti"
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
                    {DAY_SHORT_LABELS[day]}
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
                          title={`${MEAL_TYPE_LABELS[type]}: ${count} yemek`}
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
                    Plana git
                  </Button>
                }
              >
                Planınız henüz boş. Önce haftanıza birkaç yemek ekleyin.
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
              title="Tarif Kitabı"
              subtitle="Kapak, içindekiler ve her tarif için tek sayfa — otomatik sığdırma ile"
            />

            <Stack spacing={2}>
              <TextField
                label="Kitap adı"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                inputProps={{ maxLength: 60 }}
                fullWidth
              />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                alignItems={{ sm: "center" }}
              >
                <TextField
                  placeholder="Tariflerde ara"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ flex: 1 }}
                  inputProps={{ "aria-label": "Tariflerde ara" }}
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
                  label="Sıralama"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  sx={{ minWidth: 180 }}
                >
                  <MenuItem value="az">A–Z</MenuItem>
                  <MenuItem value="type">Öğün türüne göre</MenuItem>
                </TextField>
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={includeDefaults}
                    onChange={(e) => setIncludeDefaults(e.target.checked)}
                  />
                }
                label="Hazır tarifleri de ekle"
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
                {selectedRecipes.length} / {available.length} tarif seçili
                {selectedRecipes.length
                  ? ` · yaklaşık ${totalRecipePages + 2} sayfa`
                  : ""}
              </Typography>
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  onClick={selectAll}
                  disabled={!visible.length || visibleSelected === visible.length}
                >
                  Tümünü seç
                </Button>
                <Button
                  size="small"
                  onClick={selectNone}
                  disabled={!visibleSelected}
                >
                  Hiçbiri
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
                    Tarif kitabınızda henüz tarif yok. Kendi tarifinizi ekleyin
                    veya hazır tarifleri dahil edin.
                  </Typography>
                  <Button component={RouterLink} to="/recipes" variant="outlined">
                    Tariflere git
                  </Button>
                </Box>
              ) : !visible.length ? (
                <Typography color="text.secondary" sx={{ p: 3 }}>
                  “{search}” ile eşleşen tarif bulunamadı.
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
                              label={MEAL_TYPE_LABELS[recipe.mealType]}
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
                            primary={recipe.name || "İsimsiz tarif"}
                            secondary={
                              pages > 1
                                ? `Uzun tarif · ~${pages} sayfa`
                                : recipe.isPersonal
                                ? "Kendi tarifim"
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
                    {selectedRecipes.length} tarif sayfaya yerleştiriliyor…
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
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExportPage;
