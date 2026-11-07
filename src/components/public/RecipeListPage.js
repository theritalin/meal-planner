import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useI18n } from "../../i18n";
import { normalizeText } from "../../utils/recipes";
import { CATEGORIES, RECIPES } from "./contentData";
import { PublicContainer, RecipeGrid } from "./PublicCards";
import usePublicPage from "./usePublicPage";

const matches = (recipe, q) => {
  if (!q) return true;
  const hay = [
    recipe.name,
    recipe.description,
    ...(recipe.tags || []),
    ...(recipe.ingredients || []).map((i) => i?.name),
  ]
    .map(normalizeText)
    .join(" ");
  return hay.includes(q);
};

/** /tarifler — genel tarif listesi. */
const RecipeListPage = () => {
  const { t } = useI18n();
  usePublicPage(
    t("public.recipeList.metaTitle"),
    t("public.recipeList.metaDescription"),
  );
  const [params, setParams] = useSearchParams();
  const category = params.get("kategori") || "";
  const [query, setQuery] = useState("");

  // Yalnızca içerikte gerçekten bulunan kategoriler gösterilir.
  const categories = useMemo(() => {
    const present = new Set(RECIPES.map((r) => r.category));
    return Object.keys(CATEGORIES).filter((c) => present.has(c));
  }, []);

  const setCategory = (next) => {
    const p = new URLSearchParams(params);
    if (next) p.set("kategori", next);
    else p.delete("kategori");
    setParams(p, { replace: true });
  };

  const q = normalizeText(query);
  const list = RECIPES.filter(
    (r) => (!category || r.category === category) && matches(r, q),
  );

  return (
    <PublicContainer>
      <Box component="header" sx={{ mb: 3, maxWidth: 780 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ fontSize: { xs: "2rem", md: "2.6rem" }, mb: 1.5 }}
        >
          {t("public.recipeList.title")}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: "1.05rem" }}>
          {t("public.recipeList.intro")}
        </Typography>
      </Box>

      <TextField
        fullWidth
        type="search"
        label={t("public.recipeList.searchLabel")}
        placeholder={t("public.recipeList.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        sx={{ mb: 2, maxWidth: 480, bgcolor: "background.paper" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon />
            </InputAdornment>
          ),
        }}
      />

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        role="group"
        aria-label={t("public.recipeList.filterLabel")}
        sx={{ mb: 2 }}
      >
        <Chip
          label={t("public.recipeList.all")}
          color={!category ? "primary" : "default"}
          variant={!category ? "filled" : "outlined"}
          onClick={() => setCategory("")}
        />
        {categories.map((c) => (
          <Chip
            key={c}
            label={t(CATEGORIES[c])}
            color={category === c ? "primary" : "default"}
            variant={category === c ? "filled" : "outlined"}
            onClick={() => setCategory(category === c ? "" : c)}
          />
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t("public.recipeList.count", { count: list.length })}
      </Typography>

      {list.length ? (
        <RecipeGrid recipes={list} headingComponent="h2" />
      ) : (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t("public.recipeList.empty")}
          </Typography>
          <Button
            onClick={() => {
              setQuery("");
              setCategory("");
            }}
          >
            {t("public.recipeList.clear")}
          </Button>
        </Box>
      )}
    </PublicContainer>
  );
};

export default RecipeListPage;
