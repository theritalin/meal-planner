import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getFaq } from "../../content/faq";
import { palette } from "../../theme";
import { useI18n } from "../../i18n";
import { GUIDES, RECIPES } from "./contentData";
import {
  GuideCard,
  RecipeGrid,
  SectionHeader,
  SERIF,
} from "./PublicCards";
import usePublicPage from "./usePublicPage";

const FEATURES = [
  { key: "planner", icon: CalendarMonthIcon, color: palette.primary },
  { key: "recipes", icon: MenuBookIcon, color: palette.secondary },
  { key: "pdf", icon: PictureAsPdfIcon, color: palette.dinner },
];

/** Öne çıkan tarifler: farklı kategorilerden birer tarif, sonra kalanlar. */
const featuredRecipes = (n) => {
  const seen = new Set();
  const first = [];
  const rest = [];
  RECIPES.forEach((r) => {
    if (!seen.has(r.category)) {
      seen.add(r.category);
      first.push(r);
    } else rest.push(r);
  });
  return [...first, ...rest].slice(0, n);
};

const latestGuides = (n) =>
  [...GUIDES]
    .map((g, i) => ({ g, i }))
    .sort(
      (a, b) =>
        String(b.g.updated || "").localeCompare(String(a.g.updated || "")) ||
        a.i - b.i,
    )
    .slice(0, n)
    .map(({ g }) => g);

/** Oturum açmamış ziyaretçiler için ana sayfa. */
const PublicHome = () => {
  const { t, lang } = useI18n();
  usePublicPage(t("public.home.metaTitle"), t("public.home.metaDescription"));
  const faq = getFaq(lang).slice(0, 4);
  const recipes = featuredRecipes(6);
  const guides = latestGuides(3);

  return (
    <Box>
      {/* Hero */}
      <Box
        component="section"
        sx={{
          background: `radial-gradient(circle at 15% 20%, ${alpha(
            palette.primaryLight,
            0.25,
          )}, transparent 45%), radial-gradient(circle at 85% 80%, ${alpha(
            palette.secondary,
            0.15,
          )}, transparent 45%)`,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="overline"
            sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1 }}
          >
            {t("public.home.eyebrow")}
          </Typography>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: "2.1rem", sm: "2.8rem", md: "3.4rem" },
              lineHeight: 1.15,
              my: 2,
            }}
          >
            {t("public.home.title")}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: "1.05rem", md: "1.2rem" }, mb: 4 }}
          >
            {t("public.home.subtitle")}
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/login"
            >
              {t("public.home.cta")}
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={RouterLink}
              to="/tarifler"
            >
              {t("public.home.browse")}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {/* Özellikler */}
        <Box component="section" aria-labelledby="features-title" sx={{ mb: 7 }}>
          <Typography
            id="features-title"
            variant="h4"
            component="h2"
            textAlign="center"
            sx={{ mb: 3, fontSize: { xs: "1.6rem", md: "2rem" } }}
          >
            {t("public.home.featuresTitle")}
          </Typography>
          <Grid container spacing={2}>
            {FEATURES.map(({ key, icon: Icon, color }) => (
              <Grid item xs={12} md={4} key={key}>
                <Card sx={{ p: 3, height: "100%" }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(color, 0.12),
                      color,
                      mb: 2,
                    }}
                  >
                    <Icon />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    {t(`public.home.features.${key}.title`)}
                  </Typography>
                  <Typography color="text.secondary">
                    {t(`public.home.features.${key}.text`)}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Öne çıkan tarifler */}
        {recipes.length > 0 && (
          <Box component="section" aria-labelledby="featured-title" sx={{ mb: 7 }}>
            <SectionHeader
              id="featured-title"
              title={t("public.home.featuredTitle")}
              subtitle={t("public.home.featuredSubtitle")}
              linkTo="/tarifler"
              linkLabel={t("public.home.allRecipes")}
            />
            <RecipeGrid recipes={recipes} />
          </Box>
        )}

        {/* Rehberler */}
        {guides.length > 0 && (
          <Box component="section" aria-labelledby="guides-title" sx={{ mb: 7 }}>
            <SectionHeader
              id="guides-title"
              title={t("public.home.guidesTitle")}
              subtitle={t("public.home.guidesSubtitle")}
              linkTo="/rehberler"
              linkLabel={t("public.home.allGuides")}
            />
            <Grid container spacing={2}>
              {guides.map((g) => (
                <Grid item xs={12} md={4} key={g.slug}>
                  <GuideCard guide={g} />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* SSS */}
        <Box
          component="section"
          aria-labelledby="faq-title"
          sx={{ mb: 7, maxWidth: 760, mx: "auto" }}
        >
          <Typography
            id="faq-title"
            variant="h4"
            component="h2"
            textAlign="center"
            sx={{ mb: 2.5, fontSize: { xs: "1.6rem", md: "2rem" } }}
          >
            {t("public.home.faqTitle")}
          </Typography>
          {faq.map((item) => (
            <Accordion
              key={item.q}
              disableGutters
              elevation={0}
              sx={{
                border: 1,
                borderColor: "divider",
                "&:not(:last-of-type)": { borderBottom: 0 },
                "&::before": { display: "none" },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography component="h3" sx={{ fontWeight: 600 }}>
                  {item.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{item.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Button component={RouterLink} to="/login">
              {t("public.home.faqMore")} →
            </Button>
          </Box>
        </Box>

        {/* Son çağrı */}
        <Paper
          component="section"
          variant="outlined"
          sx={{
            p: { xs: 3, md: 5 },
            textAlign: "center",
            bgcolor: alpha(palette.primary, 0.05),
          }}
        >
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontFamily: SERIF, mb: 1.5, fontSize: { xs: "1.5rem", md: "2rem" } }}
          >
            {t("public.home.ctaTitle")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 560, mx: "auto" }}>
            {t("public.home.ctaText")}
          </Typography>
          <Button variant="contained" size="large" component={RouterLink} to="/login">
            {t("public.home.cta")}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PublicHome;
