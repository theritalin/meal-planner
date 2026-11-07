import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocalFireDepartmentOutlinedIcon from "@mui/icons-material/LocalFireDepartmentOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { DIFFICULTY_COLORS } from "../../constants";
import { palette } from "../../theme";
import { useI18n } from "../../i18n";
import { categoryKey, recipeMinutes } from "./contentData";

export const SERIF = '"Playfair Display", Georgia, serif';

const clamp = (lines) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
});

/** Herkese açık sayfaların ortak kapsayıcısı. */
export const PublicContainer = ({ children, maxWidth = "lg", sx }) => (
  <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 }, ...sx }}>
    {children}
  </Container>
);

/** Zaman / zorluk / kalori çipleri. */
export const RecipeMetaChips = ({ recipe, size = "small" }) => {
  const { t } = useI18n();
  const minutes = recipeMinutes(recipe);
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {minutes > 0 && (
        <Chip
          size={size}
          variant="outlined"
          icon={<AccessTimeIcon />}
          label={t("common.minutes", { count: minutes })}
        />
      )}
      {recipe.difficulty && DIFFICULTY_COLORS[recipe.difficulty] && (
        <Chip
          size={size}
          variant="outlined"
          color={DIFFICULTY_COLORS[recipe.difficulty]}
          label={t(`common.difficulty.${recipe.difficulty}`)}
        />
      )}
      {Number(recipe.calories) > 0 && (
        <Chip
          size={size}
          variant="outlined"
          icon={<LocalFireDepartmentOutlinedIcon />}
          label={t("common.kcal", { count: recipe.calories })}
        />
      )}
    </Stack>
  );
};

/** Genel tarif kartı (gerçek <a> bağlantısı: tarayıcılar ve botlar izleyebilir). */
export const PublicRecipeCard = ({ recipe, headingComponent = "h3" }) => {
  const { t } = useI18n();
  const accent = palette[recipe.mealType] || palette.primary;
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        "&:hover": {
          boxShadow: `0 10px 24px ${alpha(accent, 0.18)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Box sx={{ height: 6, bgcolor: accent, flexShrink: 0 }} />
      <CardActionArea
        component={RouterLink}
        to={`/tarifler/${recipe.slug}`}
        aria-label={t("public.recipe.openAria", { name: recipe.name })}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          p: 2,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: accent, fontWeight: 700, lineHeight: 1.6 }}
        >
          {t(categoryKey(recipe.category))}
        </Typography>
        <Typography
          variant="h6"
          component={headingComponent}
          sx={{ fontFamily: SERIF, lineHeight: 1.25, mb: 0.75 }}
        >
          {recipe.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...clamp(2), mb: 2 }}
        >
          {recipe.description}
        </Typography>
        <Box sx={{ mt: "auto" }}>
          <RecipeMetaChips recipe={recipe} />
        </Box>
      </CardActionArea>
    </Card>
  );
};

/** Tarif kartı ızgarası. */
export const RecipeGrid = ({ recipes, headingComponent }) => (
  <Grid container spacing={2}>
    {recipes.map((r) => (
      <Grid item xs={12} sm={6} md={4} key={r.slug}>
        <PublicRecipeCard recipe={r} headingComponent={headingComponent} />
      </Grid>
    ))}
  </Grid>
);

/** Rehber kartı. */
export const GuideCard = ({ guide, headingComponent = "h3" }) => {
  const { t, formatDate } = useI18n();
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea
        component={RouterLink}
        to={`/rehberler/${guide.slug}`}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          p: 2.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ color: "secondary.main", mb: 1 }}
        >
          <ArticleOutlinedIcon fontSize="small" />
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {t("public.guide.readingTime", { count: guide.readingMinutes || 1 })}
          </Typography>
        </Stack>
        <Typography
          variant="h6"
          component={headingComponent}
          sx={{ fontFamily: SERIF, lineHeight: 1.3, mb: 1 }}
        >
          {guide.title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ...clamp(3), mb: 2 }}
        >
          {guide.description}
        </Typography>
        {guide.updated && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: "auto" }}
          >
            {t("public.guide.updated", {
              date: formatDate(new Date(`${guide.updated}T12:00:00`), {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            })}
          </Typography>
        )}
      </CardActionArea>
    </Card>
  );
};

/** Bölüm başlığı + isteğe bağlı "tümü" bağlantısı. */
export const SectionHeader = ({ title, subtitle, linkTo, linkLabel, id }) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    alignItems={{ xs: "flex-start", sm: "flex-end" }}
    justifyContent="space-between"
    spacing={1}
    sx={{ mb: 2.5 }}
  >
    <Box>
      <Typography
        id={id}
        variant="h4"
        component="h2"
        sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {linkTo && (
      <Button component={RouterLink} to={linkTo} sx={{ flexShrink: 0 }}>
        {linkLabel} →
      </Button>
    )}
  </Stack>
);

/** Bulunamadı durumu. */
export const NotFoundState = ({ title, text, linkTo, linkLabel }) => (
  <Box sx={{ textAlign: "center", py: { xs: 6, md: 10 } }}>
    <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
      {title}
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 520, mx: "auto" }}>
      {text}
    </Typography>
    <Button variant="contained" component={RouterLink} to={linkTo}>
      {linkLabel}
    </Button>
  </Box>
);
