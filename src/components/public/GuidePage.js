import React from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { palette } from "../../theme";
import { useI18n } from "../../i18n";
import { GUIDES, getGuide, guideRecipes } from "./contentData";
import {
  GuideCard,
  NotFoundState,
  PublicContainer,
  RecipeGrid,
  SERIF,
} from "./PublicCards";
import usePublicPage from "./usePublicPage";

const bodyText = { fontSize: { xs: "1.02rem", md: "1.08rem" }, lineHeight: 1.8 };

/** Rehber içeriği bloklarını çizer (h2 / p / ul / ol / tip). */
export const GuideBlock = ({ block }) => {
  const { t } = useI18n();
  switch (block?.type) {
    case "h2":
      return (
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontFamily: SERIF, mt: 4, mb: 1.5 }}
        >
          {block.text}
        </Typography>
      );
    case "p":
      return <Typography sx={{ ...bodyText, mb: 2 }}>{block.text}</Typography>;
    case "ul":
    case "ol":
      return (
        <Box component={block.type} sx={{ pl: 3, mt: 0, mb: 2 }}>
          {(block.items || []).map((item, i) => (
            <Typography component="li" key={i} sx={{ ...bodyText, mb: 0.75 }}>
              {item}
            </Typography>
          ))}
        </Box>
      );
    case "tip":
      return (
        <Paper
          component="aside"
          elevation={0}
          sx={{
            p: 2,
            my: 3,
            display: "flex",
            gap: 1.5,
            bgcolor: alpha(palette.breakfast, 0.1),
            border: 1,
            borderColor: alpha(palette.breakfast, 0.35),
          }}
        >
          <LightbulbOutlinedIcon sx={{ color: palette.breakfast, mt: 0.25 }} />
          <Typography sx={{ lineHeight: 1.7 }}>
            <Box component="strong" sx={{ mr: 0.5 }}>
              {t("public.guide.tip")}:
            </Box>
            {block.text}
          </Typography>
        </Paper>
      );
    default:
      return null;
  }
};

/** /rehberler/:slug — rehber makalesi. */
const GuidePage = () => {
  const { slug } = useParams();
  const { t, formatDate } = useI18n();
  const guide = getGuide(slug);
  usePublicPage(
    guide ? guide.title : t("public.guide.notFoundTitle"),
    guide ? guide.description : undefined,
  );

  if (!guide) {
    return (
      <PublicContainer>
        <NotFoundState
          title={t("public.guide.notFoundTitle")}
          text={t("public.guide.notFoundText")}
          linkTo="/rehberler"
          linkLabel={t("public.guide.backToList")}
        />
      </PublicContainer>
    );
  }

  const recipes = guideRecipes(guide);
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 3);
  const updated = guide.updated
    ? formatDate(new Date(`${guide.updated}T12:00:00`), {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <PublicContainer>
      <Box component="article" sx={{ maxWidth: 780, mx: "auto" }}>
        <Breadcrumbs aria-label={t("public.recipe.breadcrumb")} sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit">
            {t("public.nav.home")}
          </Link>
          <Link component={RouterLink} to="/rehberler" underline="hover" color="inherit">
            {t("public.nav.guides")}
          </Link>
          <Typography color="text.primary" aria-current="page" noWrap sx={{ maxWidth: 260 }}>
            {guide.title}
          </Typography>
        </Breadcrumbs>
        <Box component="header" sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" }, lineHeight: 1.2, mb: 2 }}
          >
            {guide.title}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.1rem", mb: 2 }}>
            {guide.description}
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            color="text.secondary"
            flexWrap="wrap"
            useFlexGap
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2">
                {t("public.guide.readingTime", { count: guide.readingMinutes || 1 })}
              </Typography>
            </Stack>
            {updated && (
              <Typography variant="body2" component="time" dateTime={guide.updated}>
                {t("public.guide.updated", { date: updated })}
              </Typography>
            )}
          </Stack>
        </Box>
        <Divider sx={{ mb: 3 }} />
        {(guide.blocks || []).map((block, i) => (
          <GuideBlock block={block} key={i} />
        ))}
      </Box>

      {recipes.length > 0 && (
        <Box component="section" sx={{ mt: 7 }} aria-labelledby="guide-recipes">
          <Typography
            id="guide-recipes"
            variant="h4"
            component="h2"
            sx={{ mb: 2.5, fontSize: { xs: "1.6rem", md: "2rem" } }}
          >
            {t("public.guide.relatedRecipes")}
          </Typography>
          <RecipeGrid recipes={recipes} />
        </Box>
      )}

      {others.length > 0 && (
        <Box component="section" sx={{ mt: 7 }} aria-labelledby="other-guides">
          <Typography
            id="other-guides"
            variant="h4"
            component="h2"
            sx={{ mb: 2.5, fontSize: { xs: "1.6rem", md: "2rem" } }}
          >
            {t("public.guide.otherGuides")}
          </Typography>
          <Grid container spacing={2}>
            {others.map((g) => (
              <Grid item xs={12} md={4} key={g.slug}>
                <GuideCard guide={g} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </PublicContainer>
  );
};

export default GuidePage;
