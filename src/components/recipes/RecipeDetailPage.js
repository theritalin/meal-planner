import React, { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  GlobalStyles,
  IconButton,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import { DIFFICULTY_COLORS } from "../../constants";
import { useI18n } from "../../i18n";
import { formatIngredient, totalTime } from "../../utils/recipes";
import AdBanner from "../ads/AdBanner";
import RecipeFormDialog from "./RecipeFormDialog";
import { getScaleFactor, scaleIngredients } from "./scaleIngredients";
import { isOwnRecipe, mealTypeColor, useMealIndex } from "./recipeHelpers";

const PRINT_AREA_ID = "recipe-print-area";
const serif = '"Playfair Display", Georgia, serif';

const printStyles = (
  <GlobalStyles
    styles={{
      "@media print": {
        "@page": { margin: "16mm" },
        body: { background: "#fff !important" },
        "body *": { visibility: "hidden" },
        [`#${PRINT_AREA_ID}, #${PRINT_AREA_ID} *`]: { visibility: "visible" },
        [`#${PRINT_AREA_ID}`]: {
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          border: "none !important",
          boxShadow: "none !important",
          padding: "0 !important",
        },
        ".no-print": { display: "none !important" },
        ".print-step-done": { textDecoration: "none !important", opacity: "1 !important" },
      },
    }}
  />
);

const MetaChip = ({ icon, label, color, variant = "outlined" }) => (
  <Chip
    icon={icon}
    label={label}
    color={color}
    variant={variant}
    sx={{ bgcolor: variant === "outlined" ? "background.paper" : undefined }}
  />
);

const DetailSkeleton = () => {
  const { t } = useI18n();
  return (
    <Box aria-busy="true" aria-label={t("recipes.detail.loadingAria")}>
      <Skeleton variant="text" width={120} />
      <Skeleton variant="text" sx={{ fontSize: 48 }} width="70%" />
      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
        {[80, 96, 72].map((w) => (
          <Skeleton key={w} variant="rounded" width={w} height={32} />
        ))}
      </Stack>
      <Skeleton variant="rounded" height={320} />
    </Box>
  );
};

const NotFound = () => {
  const { t } = useI18n();
  return (
    <Paper
      variant="outlined"
      sx={{ textAlign: "center", py: 8, px: 3, borderStyle: "dashed", bgcolor: "transparent" }}
    >
      <MenuBookOutlinedIcon sx={{ fontSize: 56, color: "primary.main", opacity: 0.6, mb: 1 }} />
      <Typography variant="h5" component="h1" gutterBottom>
        {t("recipes.detail.notFoundTitle")}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {t("recipes.detail.notFoundText")}
      </Typography>
      <Button component={RouterLink} to="/recipes" variant="contained">
        {t("recipes.detail.backToBook")}
      </Button>
    </Paper>
  );
};

const RecipeDetailView = ({ recipe }) => {
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const {
    userRecipes,
    isRecipeSaved,
    saveRecipe,
    unsaveRecipe,
    deletePersonalRecipe,
  } = useRecipes();
  const { user } = useMeals();
  const mealIndex = useMealIndex();

  const baseServings = Number(recipe.servings) > 0 ? Number(recipe.servings) : 1;
  const [servings, setServings] = useState(baseServings);
  const [checked, setChecked] = useState(() => new Set());
  const [doneSteps, setDoneSteps] = useState(() => new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(null); // 'pdf' | 'delete' | 'save'
  const [toast, setToast] = useState(null);

  const meal = mealIndex.get(recipe.mealId);
  const mealType = meal?.type;
  const accent = mealTypeColor(mealType);
  const own = isOwnRecipe(recipe, userRecipes);
  const saved = isRecipeSaved(recipe.id);
  const minutes = totalTime(recipe);

  const factor = getScaleFactor(baseServings, servings);
  const ingredients = useMemo(
    () => scaleIngredients(recipe.ingredients || [], factor, lang),
    [recipe.ingredients, factor, lang]
  );
  const instructions = (recipe.instructions || []).filter(Boolean);

  const toggleIn = (setter) => (index) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  const toggleIngredient = toggleIn(setChecked);
  const toggleStep = toggleIn(setDoneSteps);

  const handleToggleSave = async () => {
    if (!user) {
      setToast({ message: t("recipes.toast.loginToSave"), login: true });
      return;
    }
    setBusy("save");
    const ok = saved
      ? await unsaveRecipe(user.uid, recipe.id)
      : await saveRecipe(user.uid, recipe);
    setBusy(null);
    setToast({
      message: ok
        ? saved
          ? t("recipes.toast.removed")
          : t("recipes.toast.saved")
        : t("recipes.toast.failed"),
    });
  };

  const handlePdf = async () => {
    setBusy("pdf");
    try {
      const { downloadRecipePdf } = await import("../pdf/exportUtils");
      await downloadRecipePdf(recipe);
    } catch (err) {
      console.error("PDF oluşturulamadı:", err);
      setToast({ message: t("recipes.toast.pdfFailed") });
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async () => {
    setBusy("delete");
    try {
      const ok = await deletePersonalRecipe(user.uid, recipe.id);
      if (!ok) throw new Error("Silme başarısız");
      navigate("/recipes", { replace: true });
    } catch (err) {
      console.error("Tarif silinemedi:", err);
      setToast({ message: t("recipes.toast.deleteFailed") });
      setBusy(null);
      setConfirmDelete(false);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/recipes");
  };

  return (
    <Box sx={{ pb: 4 }}>
      {printStyles}

      {/* Eylem çubuğu */}
      <Stack
        className="no-print"
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ mb: 2, flexWrap: "wrap", rowGap: 1 }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={goBack} sx={{ mr: "auto" }}>
          {t("recipes.detail.back")}
        </Button>
        {!recipe.isPersonal && (
          <Tooltip title={saved ? t("recipes.bookmark.unsave") : t("recipes.bookmark.save")}>
            <span>
              <IconButton
                onClick={handleToggleSave}
                disabled={busy === "save"}
                aria-label={
                  saved ? t("recipes.bookmark.unsaveAria") : t("recipes.bookmark.saveAria")
                }
                aria-pressed={saved}
                color={saved ? "primary" : "default"}
              >
                {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </span>
          </Tooltip>
        )}
        {own && (
          <>
            <Tooltip title={t("recipes.detail.edit")}>
              <IconButton
                onClick={() => setEditOpen(true)}
                aria-label={t("recipes.detail.editAria")}
              >
                <EditOutlinedIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("recipes.detail.delete")}>
              <IconButton
                onClick={() => setConfirmDelete(true)}
                aria-label={t("recipes.detail.deleteAria")}
                color="error"
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
        <Tooltip title={t("recipes.detail.print")}>
          <IconButton onClick={() => window.print()} aria-label={t("recipes.detail.printAria")}>
            <PrintOutlinedIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          startIcon={
            busy === "pdf" ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PictureAsPdfOutlinedIcon />
            )
          }
          onClick={handlePdf}
          disabled={busy === "pdf"}
        >
          {t("recipes.detail.pdf")}
        </Button>
      </Stack>

      {/* Tarif sayfası */}
      <Paper
        id={PRINT_AREA_ID}
        component="article"
        variant="outlined"
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          p: { xs: 2.5, sm: 4, md: 6 },
          borderTop: `6px solid ${accent}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          {mealType && (
            <Typography variant="overline" sx={{ color: accent, fontWeight: 700 }}>
              {t(`common.mealTypes.${mealType}`)}
              {meal?.name && meal.name !== recipe.name ? ` · ${meal.name}` : ""}
            </Typography>
          )}
          {recipe.isPersonal && (
            <Typography variant="overline" color="text.secondary">
              {mealType ? "· " : ""}
              {t("recipes.detail.myRecipe")}
            </Typography>
          )}
        </Stack>

        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontFamily: serif,
            fontSize: { xs: 34, sm: 44, md: 52 },
            lineHeight: 1.1,
            mb: 2,
            wordBreak: "break-word",
          }}
        >
          {recipe.name}
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 3 }}>
          {Number(recipe.prepTime) > 0 && (
            <MetaChip icon={<TimerOutlinedIcon />} label={t("recipes.detail.prep", { count: recipe.prepTime })} />
          )}
          {Number(recipe.cookTime) > 0 && (
            <MetaChip
              icon={<LocalFireDepartmentOutlinedIcon />}
              label={t("recipes.detail.cook", { count: recipe.cookTime })}
            />
          )}
          {minutes > 0 && (
            <MetaChip icon={<AccessTimeIcon />} label={t("recipes.detail.total", { count: minutes })} />
          )}
          {DIFFICULTY_COLORS[recipe.difficulty] && (
            <MetaChip
              label={t(`common.difficulty.${recipe.difficulty}`)}
              color={DIFFICULTY_COLORS[recipe.difficulty]}
            />
          )}
        </Stack>

        {recipe.description && (
          <Typography
            sx={{
              fontSize: { xs: 17, sm: 19 },
              lineHeight: 1.7,
              color: "text.secondary",
              fontStyle: "italic",
              mb: 4,
              maxWidth: 760,
            }}
          >
            {recipe.description}
          </Typography>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(260px, 1fr) 2fr" },
            gap: { xs: 4, md: 6 },
            "@media print": { gridTemplateColumns: "1fr 2fr" },
          }}
        >
          {/* Malzemeler */}
          <Box component="section" aria-labelledby="ingredients-heading">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography
                id="ingredients-heading"
                variant="h5"
                component="h2"
                sx={{ fontFamily: serif }}
              >
                {t("recipes.detail.ingredients")}
              </Typography>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1.5,
                py: 0.75,
                mb: 2,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {t("recipes.detail.servings")}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  className="no-print"
                  size="small"
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  disabled={servings <= 1}
                  aria-label={t("recipes.detail.decreaseServings")}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>
                <Typography
                  aria-live="polite"
                  sx={{ minWidth: 72, textAlign: "center", fontWeight: 700 }}
                >
                  {t("common.servings", { count: servings })}
                </Typography>
                <IconButton
                  className="no-print"
                  size="small"
                  onClick={() => setServings((s) => Math.min(100, s + 1))}
                  aria-label={t("recipes.detail.increaseServings")}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
                {servings !== baseServings && (
                  <Tooltip title={t("recipes.detail.resetServings")}>
                    <IconButton
                      className="no-print"
                      size="small"
                      onClick={() => setServings(baseServings)}
                      aria-label={t("recipes.detail.resetServings")}
                    >
                      <RestartAltIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Paper>

            {ingredients.length === 0 ? (
              <Typography color="text.secondary">
                {t("recipes.detail.noIngredients")}
              </Typography>
            ) : (
              <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {ingredients.map((ing, index) => {
                  const isChecked = checked.has(index);
                  const label = formatIngredient(ing);
                  return (
                    <Box
                      component="li"
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        py: 0.5,
                        borderBottom: 1,
                        borderColor: "divider",
                        "&:last-of-type": { borderBottom: 0 },
                      }}
                    >
                      <Checkbox
                        className="no-print"
                        checked={isChecked}
                        onChange={() => toggleIngredient(index)}
                        inputProps={{ "aria-label": label }}
                        size="small"
                        sx={{ mt: -0.25, ml: -1 }}
                      />
                      <Typography
                        component="label"
                        onClick={() => toggleIngredient(index)}
                        className={isChecked ? "print-step-done" : undefined}
                        sx={{
                          cursor: "pointer",
                          fontSize: 17,
                          lineHeight: 1.6,
                          pt: 0.5,
                          textDecoration: isChecked ? "line-through" : "none",
                          color: isChecked ? "text.secondary" : "text.primary",
                        }}
                      >
                        {typeof ing === "string" ? (
                          ing
                        ) : (
                          <>
                            {(ing.amount || ing.unit) && (
                              <Box component="span" sx={{ fontWeight: 700 }}>
                                {[ing.amount, ing.unit].filter(Boolean).join(" ")}{" "}
                              </Box>
                            )}
                            {ing.name}
                          </>
                        )}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Hazırlanışı */}
          <Box component="section" aria-labelledby="steps-heading">
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1.5 }}
            >
              <Typography id="steps-heading" variant="h5" component="h2" sx={{ fontFamily: serif }}>
                {t("recipes.detail.steps")}
              </Typography>
              {doneSteps.size > 0 && (
                <Button
                  className="no-print"
                  size="small"
                  onClick={() => setDoneSteps(new Set())}
                  startIcon={<RestartAltIcon />}
                >
                  {t("recipes.detail.resetSteps")}
                </Button>
              )}
            </Stack>
            {instructions.length === 0 ? (
              <Typography color="text.secondary">{t("recipes.detail.noSteps")}</Typography>
            ) : (
              <Box component="ol" sx={{ listStyle: "none", p: 0, m: 0 }}>
                {instructions.map((step, index) => {
                  const done = doneSteps.has(index);
                  return (
                    <Box
                      component="li"
                      key={index}
                      role="button"
                      tabIndex={0}
                      aria-pressed={done}
                      aria-label={t(
                        done ? "recipes.detail.stepDoneAria" : "recipes.detail.stepAria",
                        { n: index + 1 }
                      )}
                      onClick={() => toggleStep(index)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleStep(index);
                        }
                      }}
                      className={done ? "print-step-done" : undefined}
                      sx={{
                        display: "flex",
                        gap: 2,
                        p: 1.5,
                        mx: -1.5,
                        mb: 1,
                        borderRadius: 2,
                        cursor: "pointer",
                        opacity: done ? 0.55 : 1,
                        transition: "background-color .15s, opacity .15s",
                        "&:hover": { bgcolor: (t) => alpha(t.palette.primary.main, 0.05) },
                        "&:focus-visible": {
                          outline: (t) => `2px solid ${t.palette.primary.main}`,
                        },
                        breakInside: "avoid",
                      }}
                    >
                      <Box
                        aria-hidden
                        sx={{
                          width: 34,
                          height: 34,
                          flexShrink: 0,
                          borderRadius: "50%",
                          display: "grid",
                          placeItems: "center",
                          fontWeight: 700,
                          fontFamily: serif,
                          fontSize: 17,
                          bgcolor: done ? "secondary.main" : alpha(accent, 0.12),
                          color: done ? "secondary.contrastText" : accent,
                        }}
                      >
                        {done ? <CheckIcon fontSize="small" /> : index + 1}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: { xs: 17, sm: 18 },
                          lineHeight: 1.75,
                          textDecoration: done ? "line-through" : "none",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {step}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>

        {recipe.notes && (
          <>
            <Divider sx={{ my: 4 }} />
            <Box
              component="aside"
              sx={{
                p: 2.5,
                borderRadius: 3,
                borderLeft: 4,
                borderColor: "secondary.main",
                bgcolor: (t) => alpha(t.palette.secondary.main, 0.06),
              }}
            >
              <Typography variant="h6" component="h2" sx={{ fontFamily: serif, mb: 0.5 }}>
                {t("recipes.detail.notes")}
              </Typography>
              <Typography sx={{ fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {recipe.notes}
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      <Box className="no-print" sx={{ mt: 3 }}>
        <AdBanner placement="recipeDetail" />
      </Box>

      {own && (
        <RecipeFormDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initialRecipe={recipe}
          onSaved={() => setToast({ message: t("recipes.toast.recipeUpdated") })}
        />
      )}

      <Dialog open={confirmDelete} onClose={() => busy !== "delete" && setConfirmDelete(false)}>
        <DialogTitle>{t("recipes.detail.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("recipes.detail.confirmDelete.text", { name: recipe.name })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} disabled={busy === "delete"}>
            {t("recipes.detail.confirmDelete.cancel")}
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={busy === "delete"}
            startIcon={busy === "delete" ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {t("recipes.detail.confirmDelete.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={(_, reason) => reason !== "clickaway" && setToast(null)}
        message={toast?.message}
        sx={{ bottom: { xs: 90, sm: 24 } }}
        action={
          toast?.login ? (
            <Button color="inherit" size="small" onClick={() => navigate("/login")}>
              {t("recipes.toast.login")}
            </Button>
          ) : null
        }
      />
    </Box>
  );
};

/** /recipes/:recipeId — tarif detayı (yemek kitabı sayfası) */
const RecipeDetailPage = () => {
  const { recipeId } = useParams();
  const { getRecipeById, loading, error } = useRecipes();
  const { authLoading } = useMeals();
  const recipe = getRecipeById(recipeId);

  if (!recipe) {
    if (loading || authLoading) return <DetailSkeleton />;
    return (
      <>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <NotFound />
      </>
    );
  }
  return <RecipeDetailView key={recipe.id} recipe={recipe} />;
};

export default RecipeDetailPage;
