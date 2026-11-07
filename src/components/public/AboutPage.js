import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Link, Paper, Stack, Typography } from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { useI18n } from "../../i18n";
import { CONTACT_EMAIL } from "./siteInfo";
import { PublicContainer, SERIF } from "./PublicCards";
import usePublicPage from "./usePublicPage";

const H2 = ({ children }) => (
  <Typography variant="h5" component="h2" sx={{ fontFamily: SERIF, mt: 4, mb: 1.5 }}>
    {children}
  </Typography>
);

const body = { fontSize: { xs: "1.02rem", md: "1.08rem" }, lineHeight: 1.8 };

/** /hakkimizda — hakkımızda, içerik politikası ve iletişim. */
const AboutPage = () => {
  const { t } = useI18n();
  usePublicPage(t("public.about.metaTitle"), t("public.about.metaDescription"));
  const items = t("public.about.appItems");

  return (
    <PublicContainer maxWidth="md">
      <Box component="article">
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, mb: 2 }}
        >
          {t("public.about.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "1.15rem", lineHeight: 1.7 }}>
          {t("public.about.lead")}
        </Typography>

        <H2>{t("public.about.whoTitle")}</H2>
        <Typography sx={body}>{t("public.about.whoText")}</Typography>

        <H2>{t("public.about.appTitle")}</H2>
        <Box component="ul" sx={{ pl: 3, my: 0 }}>
          {(Array.isArray(items) ? items : []).map((item) => (
            <Typography component="li" key={item} sx={{ ...body, mb: 0.75 }}>
              {item}
            </Typography>
          ))}
        </Box>

        <H2>{t("public.about.policyTitle")}</H2>
        <Typography sx={body}>{t("public.about.policyText")}</Typography>

        <H2>{t("public.about.adsTitle")}</H2>
        <Typography sx={body}>
          {t("public.about.adsText")}{" "}
          <Link component={RouterLink} to="/privacy">
            {t("public.nav.privacy")}
          </Link>
        </Typography>

        <Paper component="section" variant="outlined" sx={{ p: { xs: 2, md: 3 }, mt: 4 }}>
          <Typography variant="h5" component="h2" sx={{ fontFamily: SERIF, mb: 1 }}>
            {t("public.about.contactTitle")}
          </Typography>
          <Typography sx={{ mb: 1.5 }}>{t("public.about.contactText")}</Typography>
          <Button
            variant="outlined"
            startIcon={<MailOutlineIcon />}
            href={`mailto:${CONTACT_EMAIL}`}
          >
            {CONTACT_EMAIL}
          </Button>
        </Paper>

        <H2>{t("public.about.linksTitle")}</H2>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button component={RouterLink} to="/tarifler" variant="contained">
            {t("public.nav.recipes")}
          </Button>
          <Button component={RouterLink} to="/rehberler" variant="outlined">
            {t("public.nav.guides")}
          </Button>
          <Button component={RouterLink} to="/login" variant="outlined">
            {t("public.nav.start")}
          </Button>
        </Stack>
      </Box>
    </PublicContainer>
  );
};

export default AboutPage;
