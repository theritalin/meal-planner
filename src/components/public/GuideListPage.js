import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { useI18n } from "../../i18n";
import { GUIDES } from "./contentData";
import { GuideCard, PublicContainer } from "./PublicCards";
import usePublicPage from "./usePublicPage";

/** /rehberler — rehber listesi. */
const GuideListPage = () => {
  const { t } = useI18n();
  usePublicPage(
    t("public.guideList.metaTitle"),
    t("public.guideList.metaDescription"),
  );
  return (
    <PublicContainer>
      <Box component="header" sx={{ mb: 4, maxWidth: 780 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, mb: 1.5 }}
        >
          {t("public.guideList.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "1.05rem" }}>
          {t("public.guideList.intro")}
        </Typography>
      </Box>
      {GUIDES.length ? (
        <Grid container spacing={2}>
          {GUIDES.map((g) => (
            <Grid item xs={12} sm={6} md={4} key={g.slug}>
              <GuideCard guide={g} headingComponent="h2" />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography color="text.secondary">{t("public.guideList.empty")}</Typography>
      )}
    </PublicContainer>
  );
};

export default GuideListPage;
