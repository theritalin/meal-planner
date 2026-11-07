import React, { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { palette } from "../../theme";
import { useI18n } from "../../i18n";
import {
  categoryKey,
  getRecipe,
  recipeMinutes,
  relatedRecipes,
  toUserRecipe,
} from "./contentData";
import {
  NotFoundState,
  PublicContainer,
  RecipeGrid,
  SERIF,
} from "./PublicCards";
import usePublicPage from "./usePublicPage";

const MetaItem = ({ label, value }) => (
  <Box sx={{ minWidth: 92 }}>
    <Typography variant="caption" color="text.secondary" component="div">
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
  </Box>
);

const SectionTitle = ({ children }) => (
  <Typography variant="h5" component="h2" sx={{ fontFamily: SERIF, mb: 2 }}>
    {children}
  </Typography>
);

/** "Tarif kitabıma kaydet": girişliyse kaydeder, değilse /login'e yönlendirir. */
const SaveButton = ({ recipe }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { user } = useMeals();
  const { saveRecipe, isRecipeSaved } = useRecipes();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const userRecipe = toUserRecipe(recipe);
  const saved = Boolean(user && isRecipeSaved && isRecipeSaved(userRecipe.id));

  const onClick = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (saved) {
      navigate("/recipes");
      return;
    }
    setSaving(true);
    const result = await saveRecipe(user.uid, userRecipe);
    setSaving(false);
    setToast(result ? "success" : "error");
  };

  return (
    <Box>
      <Button
        variant={saved ? "outlined" : "contained"}
        size="large"
        startIcon={saved ? <BookmarkAddedIcon /> : <BookmarkAddOutlinedIcon />}
        onClick={onClick}
        disabled={saving}
      >
        {saving
          ? t("public.recipe.saving")
          : saved
            ? t("public.recipe.openBook")
            : t("public.recipe.save")}
      </Button>
      {!user && (
        <Typography
          variant="caption"
          color="text.secondary"
          component="div"
          sx={{ mt: 0.75 }}
        >
          {t("public.recipe.loginHint")}
        </Typography>
      )}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast === "error" ? "error" : "success"}
          onClose={() => setToast(null)}
          action={
            toast === "success" ? (
              <Button color="inherit" size="small" component={RouterLink} to="/recipes">
                {t("public.recipe.openBook")}
              </Button>
            ) : undefined
          }
        >
          {toast === "error" ? t("public.recipe.saveError") : t("public.recipe.saved")}
        </Alert>
      </Snackbar>
    </Box>
  );
};

/** /tarifler/:slug — genel tarif detayı. */
const PublicRecipePage = () => {
  const { slug } = useParams();
  const { t } = useI18n();
  const recipe = getRecipe(slug);
  usePublicPage(
    recipe ? recipe.name : t("public.recipe.notFoundTitle"),
    recipe ? recipe.description : undefined,
  );

  if (!recipe) {
    return (
      <PublicContainer>
        <NotFoundState
          title={t("public.recipe.notFoundTitle")}
          text={t("public.recipe.notFoundText")}
          linkTo="/tarifler"
          linkLabel={t("public.recipe.backToList")}
        />
      </PublicContainer>
    );
  }

  const accent = palette[recipe.mealType] || palette.primary;
  const related = relatedRecipes(recipe, 3);
  const categoryLabel = t(categoryKey(recipe.category));

  return (
    <PublicContainer>
      <Box component="article">
        <Breadcrumbs aria-label={t("public.recipe.breadcrumb")} sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            {t("public.nav.home")}
          </Link>
          <Link component={RouterLink} to="/tarifler" underline="hover" color="inherit">
            {t("public.nav.recipes")}
          </Link>
          <Link
            component={RouterLink}
            to={`/tarifler?kategori=${recipe.category}`}
            underline="hover"
            color="inherit"
          >
            {categoryLabel}
          </Link>
          <Typography color="text.primary" aria-current="page">
            {recipe.name}
          </Typography>
        </Breadcrumbs>

        <Box component="header" sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            sx={{ color: accent, fontWeight: 700 }}
            component="p"
          >
            {categoryLabel}
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontSize: { xs: "2rem", md: "2.8rem" }, mb: 2 }}
          >
            {recipe.name}
          </Typography>
          <Typography
            sx={{ fontSize: { xs: "1.02rem", md: "1.12rem" }, mb: 3, maxWidth: 820 }}
            color="text.secondary"
          >
            {recipe.intro || recipe.description}
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 2, md: 4 },
              borderLeft: `4px solid ${accent}`,
            }}
          >
            {Number(recipe.prepTime) > 0 && (
              <MetaItem
                label={t("public.recipe.prep")}
                value={t("common.minutes", { count: recipe.prepTime })}
              />
            )}
            {Number(recipe.cookTime) > 0 && (
              <MetaItem
                label={t("public.recipe.cook")}
                value={t("common.minutes", { count: recipe.cookTime })}
              />
            )}
            <MetaItem
              label={t("public.recipe.total")}
              value={t("common.minutes", { count: recipeMinutes(recipe) })}
            />
            {Number(recipe.servings) > 0 && (
              <MetaItem
                label={t("public.recipe.servings")}
                value={t("common.servings", { count: recipe.servings })}
              />
            )}
            {recipe.difficulty && (
              <MetaItem
                label={t("public.recipe.difficulty")}
                value={t(`common.difficulty.${recipe.difficulty}`)}
              />
            )}
            {Number(recipe.calories) > 0 && (
              <MetaItem
                label={t("public.recipe.calories")}
                value={t("common.kcal", { count: recipe.calories })}
              />
            )}
          </Paper>
          <SaveButton recipe={recipe} />
        </Box>

        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }} component="section">
              <SectionTitle>{t("public.recipe.ingredients")}</SectionTitle>
              <Box component="ul" sx={{ m: 0, pl: 0, listStyle: "none" }}>
                {(recipe.ingredients || []).map((ing, i) => (
                  <Box
                    component="li"
                    key={`${ing.name}-${i}`}
                    sx={{
                      py: 1,
                      display: "flex",
                      gap: 1,
                      borderBottom: 1,
                      borderColor: "divider",
                      "&:last-of-type": { borderBottom: 0 },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, minWidth: 0, whiteSpace: "nowrap" }}
                    >
                      {[ing.amount, ing.unit].filter(Boolean).join(" ")}
                    </Box>
                    <Box component="span">{ing.name}</Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box component="section" sx={{ mb: 4 }}>
              <SectionTitle>{t("public.recipe.instructions")}</SectionTitle>
              <Box component="ol" sx={{ m: 0, p: 0, listStyle: "none" }}>
                {(recipe.instructions || []).map((step, i) => (
                  <Box
                    component="li"
                    key={i}
                    sx={{ display: "flex", gap: 2, mb: 2.5, alignItems: "flex-start" }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        flexShrink: 0,
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(palette.primary, 0.1),
                        color: "primary.main",
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </Box>
                    <Typography sx={{ pt: 0.5, lineHeight: 1.7 }}>{step}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {recipe.tips?.length > 0 && (
              <Paper
                component="aside"
                elevation={0}
                sx={{
                  p: { xs: 2, md: 3 },
                  bgcolor: alpha(palette.breakfast, 0.1),
                  border: 1,
                  borderColor: alpha(palette.breakfast, 0.35),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <LightbulbOutlinedIcon sx={{ color: palette.breakfast }} />
                  <Typography variant="h6" component="h2">
                    {t("public.recipe.tips")}
                  </Typography>
                </Stack>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {recipe.tips.map((tip, i) => (
                    <Typography component="li" key={i} sx={{ mb: 1, lineHeight: 1.7 }}>
                      {tip}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>

      {related.length > 0 && (
        <Box component="section" sx={{ mt: 7 }} aria-labelledby="related-title">
          <Typography
            id="related-title"
            variant="h4"
            component="h2"
            sx={{ mb: 2.5, fontSize: { xs: "1.6rem", md: "2rem" } }}
          >
            {t("public.recipe.related")}
          </Typography>
          <RecipeGrid recipes={related} />
        </Box>
      )}
    </PublicContainer>
  );
};

export default PublicRecipePage;
