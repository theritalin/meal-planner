import React, { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { DIFFICULTY_COLORS } from "../../constants";
import { useI18n } from "../../i18n";
import { formatIngredient, totalTime } from "../../utils/recipes";
import { mealTypeColor } from "./recipeHelpers";

const MAX_INGREDIENTS = 8;

/**
 * Bir yemeğin tarif(ler)ini hızlıca gösteren diyalog.
 * Props: { open: boolean, onClose: () => void, meal: Meal | null }
 * Tarifler getRecipesForMeal(meal.id) + meal.recipes üzerinden bulunur.
 */
const RecipeQuickView = ({ open, onClose, meal }) => {
  const theme = useTheme();
  const { t } = useI18n();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const { getRecipesForMeal } = useRecipes();

  const recipes = useMemo(() => {
    if (!meal) return [];
    const fromContext = getRecipesForMeal(meal.id);
    const embedded = (meal.recipes || []).map((r) => ({ mealId: meal.id, ...r }));
    const seen = new Set();
    return [...fromContext, ...embedded].filter((r) => {
      if (!r?.id || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }, [meal, getRecipesForMeal]);

  const accent = mealTypeColor(meal?.type);

  return (
    <Dialog
      open={Boolean(open && meal)}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby="recipe-quick-view-title"
      PaperProps={{
        sx: { borderTop: `6px solid ${accent}`, ...(fullScreen ? { borderRadius: 0 } : {}) },
      }}
    >
      <DialogTitle id="recipe-quick-view-title" sx={{ pr: 6 }}>
        {meal?.type && (
          <Typography
            variant="overline"
            component="div"
            sx={{ color: accent, fontWeight: 700, lineHeight: 1.6 }}
          >
            {t(`common.mealTypes.${meal.type}`)}
          </Typography>
        )}
        <Box
          component="span"
          sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700, fontSize: 24 }}
        >
          {meal?.name}
        </Box>
        <IconButton
          onClick={onClose}
          aria-label={t("recipes.quickView.close")}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {meal?.description && (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {meal.description}
          </Typography>
        )}
        {recipes.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography sx={{ fontWeight: 600 }} gutterBottom>
              {t("recipes.quickView.noRecipesTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("recipes.quickView.noRecipesText")}
            </Typography>
            <Button component={RouterLink} to="/recipes" variant="outlined" onClick={onClose}>
              {t("recipes.quickView.goToBook")}
            </Button>
          </Box>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={2.5}>
            {recipes.map((recipe) => {
              const minutes = totalTime(recipe);
              const ings = recipe.ingredients || [];
              return (
                <Box key={recipe.id}>
                  {recipes.length > 1 && (
                    <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                      {recipe.name}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mb: 1.5 }}>
                    {minutes > 0 && (
                      <Chip size="small" variant="outlined" icon={<AccessTimeIcon />} label={t("common.minutes", { count: minutes })} />
                    )}
                    {Number(recipe.servings) > 0 && (
                      <Chip
                        size="small"
                        variant="outlined"
                        icon={<PeopleAltOutlinedIcon />}
                        label={t("common.servings", { count: recipe.servings })}
                      />
                    )}
                    {DIFFICULTY_COLORS[recipe.difficulty] && (
                      <Chip
                        size="small"
                        variant="outlined"
                        color={DIFFICULTY_COLORS[recipe.difficulty]}
                        label={t(`common.difficulty.${recipe.difficulty}`)}
                      />
                    )}
                  </Stack>
                  {ings.length > 0 && (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {t("recipes.quickView.ingredients")}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2.5, my: 0, "& li": { mb: 0.25 } }}>
                        {ings.slice(0, MAX_INGREDIENTS).map((ing, i) => (
                          <li key={i}>
                            <Typography variant="body2">{formatIngredient(ing)}</Typography>
                          </li>
                        ))}
                      </Box>
                      {ings.length > MAX_INGREDIENTS && (
                        <Typography variant="caption" color="text.secondary">
                          {t("recipes.quickView.moreIngredients", {
                            count: ings.length - MAX_INGREDIENTS,
                          })}
                        </Typography>
                      )}
                    </>
                  )}
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      component={RouterLink}
                      to={`/recipes/${recipe.id}`}
                      onClick={onClose}
                      endIcon={<ArrowForwardIcon />}
                      variant={recipes.length === 1 ? "contained" : "text"}
                    >
                      {t("recipes.quickView.viewFull")}
                    </Button>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      {!fullScreen && (
        <DialogActions>
          <Button onClick={onClose}>{t("recipes.quickView.close")}</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default RecipeQuickView;
