import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  MenuBook as MenuBookIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "../../../constants";
import { totalTime } from "../../../utils/recipes";

const RecipeCard = ({ recipe, to, onOpen, action }) => {
  const minutes = totalTime(recipe);
  const actionAreaProps = to
    ? { component: RouterLink, to }
    : { onClick: () => onOpen?.(recipe) };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": { boxShadow: 3 },
      }}
    >
      <CardActionArea
        {...actionAreaProps}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={(theme) => ({
            height: 88,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: "primary.main",
          })}
        >
          <MenuBookIcon sx={{ fontSize: 40, opacity: 0.7 }} />
        </Box>
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {recipe.name}
          </Typography>
          {recipe.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                mb: 1,
              }}
            >
              {recipe.description}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {minutes > 0 && (
              <Chip
                size="small"
                variant="outlined"
                icon={<AccessTimeIcon />}
                label={`${minutes} dk`}
              />
            )}
            {recipe.servings ? (
              <Chip
                size="small"
                variant="outlined"
                icon={<RestaurantIcon />}
                label={`${recipe.servings} kişilik`}
              />
            ) : null}
            {recipe.difficulty && DIFFICULTY_LABELS[recipe.difficulty] && (
              <Chip
                size="small"
                color={DIFFICULTY_COLORS[recipe.difficulty]}
                variant="outlined"
                label={DIFFICULTY_LABELS[recipe.difficulty]}
              />
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
      {action && <CardActions sx={{ pt: 0 }}>{action(recipe)}</CardActions>}
    </Card>
  );
};

/**
 * Tarif kartları ızgarası.
 * - `getHref(recipe)` verilirse kart o adrese gider (ör. /recipes/:id),
 *   aksi halde `onOpen(recipe)` çağrılır (başka kullanıcının tarifi için dialog).
 * - `action(recipe)` kartın altına buton(lar) render eder.
 */
const ProfileRecipeGrid = ({
  recipes,
  getHref,
  onOpen,
  action,
  emptyText,
  emptyAction,
}) => {
  if (!recipes || recipes.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: 2,
          border: 1,
          borderStyle: "dashed",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <MenuBookIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
        <Typography color="text.secondary">{emptyText}</Typography>
        {emptyAction && <Box sx={{ mt: 2 }}>{emptyAction}</Box>}
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {recipes.map((recipe) => (
        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
          <RecipeCard
            recipe={recipe}
            to={getHref ? getHref(recipe) : undefined}
            onOpen={onOpen}
            action={action}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProfileRecipeGrid;
