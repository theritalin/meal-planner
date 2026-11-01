import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  AccessTime as AccessTimeIcon,
  BookmarkAdded as BookmarkAddedIcon,
  BookmarkAdd as BookmarkAddIcon,
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "../../../constants";
import { formatIngredient } from "../../../utils/recipes";

/**
 * Başka bir kullanıcının tarifini satır içi gösterir; "Kaydet" ile
 * tarif kullanıcının kaydedilenlerine eklenir.
 */
const RecipePreviewDialog = ({ recipe, onClose, isSaved, saving, onSave }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const open = Boolean(recipe);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      aria-labelledby="recipe-preview-title"
    >
      {recipe && (
        <>
          <DialogTitle
            id="recipe-preview-title"
            sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>{recipe.name}</Box>
            <IconButton aria-label="Kapat" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {recipe.description && (
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {recipe.description}
              </Typography>
            )}
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ mb: 3 }}
            >
              {recipe.prepTime ? (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<AccessTimeIcon />}
                  label={`Hazırlık: ${recipe.prepTime} dk`}
                />
              ) : null}
              {recipe.cookTime ? (
                <Chip
                  size="small"
                  variant="outlined"
                  icon={<AccessTimeIcon />}
                  label={`Pişirme: ${recipe.cookTime} dk`}
                />
              ) : null}
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
                  variant="outlined"
                  color={DIFFICULTY_COLORS[recipe.difficulty]}
                  label={DIFFICULTY_LABELS[recipe.difficulty]}
                />
              )}
            </Stack>

            <Typography variant="h6" component="h2" gutterBottom>
              Malzemeler
            </Typography>
            {recipe.ingredients?.length ? (
              <Box component="ul" sx={{ pl: 2.5, mt: 0, mb: 3 }}>
                {recipe.ingredients.map((ing, i) => (
                  <Typography component="li" key={i} sx={{ mb: 0.5 }}>
                    {formatIngredient(ing)}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Malzeme eklenmemiş.
              </Typography>
            )}

            <Typography variant="h6" component="h2" gutterBottom>
              Hazırlanışı
            </Typography>
            {recipe.instructions?.length ? (
              <Box component="ol" sx={{ pl: 2.5, mt: 0 }}>
                {recipe.instructions.map((step, i) => (
                  <Typography component="li" key={i} sx={{ mb: 1 }}>
                    {step}
                  </Typography>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Hazırlanış adımı eklenmemiş.
              </Typography>
            )}

            {recipe.notes && (
              <>
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{ mt: 2 }}
                >
                  Notlar
                </Typography>
                <Typography sx={{ whiteSpace: "pre-line" }}>
                  {recipe.notes}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={onClose}>Kapat</Button>
            <Button
              variant="contained"
              onClick={() => onSave(recipe)}
              disabled={isSaved || saving}
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : isSaved ? (
                  <BookmarkAddedIcon />
                ) : (
                  <BookmarkAddIcon />
                )
              }
            >
              {isSaved ? "Kaydedildi" : "Kaydet"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default RecipePreviewDialog;
