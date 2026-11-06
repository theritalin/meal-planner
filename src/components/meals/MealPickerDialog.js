import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import { palette } from "../../theme";
import { useI18n } from "../../i18n";
import { formatMealMeta, mealMatchesQuery, useAllMeals } from "./mealUtils";

/**
 * Dokunarak yemek seçme penceresi (mobilde alttan açılan sayfa).
 * Props: { open, onClose, mealType, onPick(meal), excludeIds?, title? }
 */
const MealPickerDialog = ({
  open,
  onClose,
  mealType,
  onPick,
  excludeIds = [],
  title,
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const allMeals = useAllMeals();
  const [query, setQuery] = useState("");
  const [showAllTypes, setShowAllTypes] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery("");
      setShowAllTypes(false);
    }
  }, [open]);

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);
  const results = useMemo(
    () =>
      allMeals.filter(
        (meal) =>
          (showAllTypes || !mealType || meal.type === mealType) &&
          mealMatchesQuery(meal, query),
      ),
    [allMeals, showAllTypes, mealType, query],
  );

  const accent = palette[mealType] || palette.primary;
  const typeLabel = mealType ? t(`common.mealTypes.${mealType}`) : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="meal-picker-title"
      sx={{
        "& .MuiDialog-container": {
          alignItems: isMobile ? "flex-end" : "center",
        },
      }}
      PaperProps={{
        sx: isMobile
          ? {
              m: 0,
              width: "100%",
              maxWidth: "100%",
              maxHeight: "85vh",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }
          : { height: "70vh" },
      }}
    >
      {isMobile && (
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: "divider",
            mx: "auto",
            mt: 1,
          }}
        />
      )}
      <DialogTitle id="meal-picker-title" sx={{ pr: 6, pb: 1 }}>
        {title ||
          (typeLabel
            ? t("planner.picker.titleForType", { type: typeLabel })
            : t("planner.picker.title"))}
        <IconButton
          aria-label={t("planner.picker.close")}
          onClick={onClose}
          sx={{ position: "absolute", right: 12, top: isMobile ? 16 : 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box sx={{ px: 3, pb: 1.5 }}>
        <TextField
          fullWidth
          autoFocus={!isMobile}
          placeholder={t("planner.picker.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          inputProps={{ "aria-label": t("planner.picker.searchLabel") }}
        />
        {mealType && (
          <Stack direction="row" spacing={1} sx={{ mt: 1.25 }}>
            <Chip
              size="small"
              label={typeLabel}
              onClick={() => setShowAllTypes(false)}
              variant={showAllTypes ? "outlined" : "filled"}
              sx={
                showAllTypes
                  ? undefined
                  : { bgcolor: alpha(accent, 0.15), color: accent }
              }
            />
            <Chip
              size="small"
              label={t("planner.picker.allTypes")}
              onClick={() => setShowAllTypes(true)}
              variant={showAllTypes ? "filled" : "outlined"}
              color={showAllTypes ? "primary" : "default"}
            />
          </Stack>
        )}
      </Box>
      <DialogContent dividers sx={{ p: 0 }}>
        {results.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 3, textAlign: "center" }}>
            {t("planner.picker.empty")}
          </Typography>
        ) : (
          <List disablePadding>
            {results.map((meal) => {
              const isAdded = excluded.has(meal.id);
              return (
                <ListItemButton
                  key={meal.id}
                  divider
                  disabled={isAdded}
                  onClick={() => onPick(meal)}
                  sx={{ py: 1.25 }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: palette[meal.type] || "divider",
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={meal.name}
                    secondary={formatMealMeta(meal, t) || meal.description}
                    primaryTypographyProps={{ fontWeight: 600 }}
                    secondaryTypographyProps={{ noWrap: true }}
                  />
                  {isAdded && (
                    <CheckIcon
                      fontSize="small"
                      color="secondary"
                      aria-label={t("planner.picker.added")}
                    />
                  )}
                  {meal.isPersonal && !isAdded && (
                    <Chip
                      size="small"
                      label={t("planner.picker.personal")}
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MealPickerDialog;
