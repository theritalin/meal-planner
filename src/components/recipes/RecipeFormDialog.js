import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useI18n } from "../../i18n";
import RecipeForm from "./RecipeForm";

/**
 * RecipeForm'u mobilde tam ekran, masaüstünde normal diyalogda açar.
 * Props: { open, onClose, initialRecipe?, onSaved? }
 */
const RecipeFormDialog = ({ open, onClose, initialRecipe, onSaved }) => {
  const theme = useTheme();
  const { t } = useI18n();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = Boolean(initialRecipe?.id);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="md"
      aria-labelledby="recipe-form-title"
      PaperProps={fullScreen ? { sx: { borderRadius: 0 } } : undefined}
    >
      <DialogTitle
        id="recipe-form-title"
        sx={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontWeight: 700,
          pr: 6,
        }}
      >
        {isEdit ? t("recipes.form.editTitle") : t("recipes.form.newTitle")}
        <IconButton
          onClick={onClose}
          aria-label={t("recipes.form.close")}
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ pb: 0 }}>
        {open && (
          <RecipeForm
            key={initialRecipe?.id || "new"}
            onClose={onClose}
            initialRecipe={initialRecipe}
            onSaved={onSaved}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeFormDialog;
