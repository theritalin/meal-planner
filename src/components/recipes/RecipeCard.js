import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
  MEAL_TYPE_LABELS,
} from "../../constants";
import { totalTime } from "../../utils/recipes";
import { mealTypeColor } from "./recipeHelpers";

const summaryText = (recipe) => {
  if (recipe.description) return recipe.description;
  const names = (recipe.ingredients || [])
    .map((i) => (typeof i === "string" ? i : i?.name))
    .filter(Boolean);
  if (!names.length) return "Henüz açıklama eklenmemiş.";
  const head = names.slice(0, 4).join(", ");
  return names.length > 4 ? `${head} ve ${names.length - 4} malzeme daha` : head;
};

/**
 * Tarif kartı.
 * Props:
 *  - recipe: Recipe
 *  - mealType?: 'breakfast' | 'lunch' | 'dinner' (üst vurgu rengi)
 *  - isSaved?: boolean
 *  - onToggleSave?: (recipe) => void — verilirse ve tarif kişisel değilse yer imi gösterilir
 */
const RecipeCard = ({ recipe, mealType, isSaved = false, onToggleSave }) => {
  const navigate = useNavigate();
  const accent = mealTypeColor(mealType);
  const minutes = totalTime(recipe);
  const showBookmark = Boolean(onToggleSave) && !recipe.isPersonal;

  return (
    <Card
      sx={{
        position: "relative",
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
        onClick={() => navigate(`/recipes/${recipe.id}`)}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          justifyContent: "flex-start",
          p: 2,
          pr: showBookmark ? 6 : 2,
        }}
        aria-label={`${recipe.name} tarifini aç`}
      >
        <Stack direction="row" spacing={0.75} sx={{ mb: 1 }} flexWrap="wrap">
          {mealType && (
            <Typography
              variant="overline"
              sx={{ color: accent, fontWeight: 700, lineHeight: 1.6 }}
            >
              {MEAL_TYPE_LABELS[mealType]}
            </Typography>
          )}
          {recipe.isPersonal && (
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.25,
                lineHeight: 1.6,
              }}
            >
              <PersonOutlineIcon sx={{ fontSize: 14 }} /> Benim
            </Typography>
          )}
        </Stack>
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontFamily: '"Playfair Display", Georgia, serif',
            lineHeight: 1.25,
            mb: 0.75,
          }}
        >
          {recipe.name}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
          }}
        >
          {summaryText(recipe)}
        </Typography>
        <Stack
          direction="row"
          spacing={0.75}
          useFlexGap
          flexWrap="wrap"
          sx={{ mt: "auto" }}
        >
          {minutes > 0 && (
            <Chip
              size="small"
              variant="outlined"
              icon={<AccessTimeIcon />}
              label={`${minutes} dk`}
            />
          )}
          {Number(recipe.servings) > 0 && (
            <Chip
              size="small"
              variant="outlined"
              icon={<PeopleAltOutlinedIcon />}
              label={`${recipe.servings} kişilik`}
            />
          )}
          {recipe.difficulty && DIFFICULTY_LABELS[recipe.difficulty] && (
            <Chip
              size="small"
              color={DIFFICULTY_COLORS[recipe.difficulty]}
              variant="outlined"
              label={DIFFICULTY_LABELS[recipe.difficulty]}
            />
          )}
        </Stack>
      </CardActionArea>
      {showBookmark && (
        <Tooltip title={isSaved ? "Kitabımdan çıkar" : "Kitabıma kaydet"}>
          <IconButton
            onClick={() => onToggleSave(recipe)}
            aria-label={isSaved ? "Tarifi kaydedilenlerden çıkar" : "Tarifi kaydet"}
            aria-pressed={isSaved}
            sx={{
              position: "absolute",
              top: 14,
              right: 8,
              color: isSaved ? "primary.main" : "text.secondary",
            }}
          >
            {isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
          </IconButton>
        </Tooltip>
      )}
    </Card>
  );
};

export default RecipeCard;
