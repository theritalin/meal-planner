import React, { useMemo } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { palette } from "../../theme";
import { useMealDrag } from "./dnd";
import { useI18n } from "../../i18n";

/**
 * Plandaki tek bir yemek (kompakt kart). Başka bir slota sürüklenerek
 * taşınabilir, tıklanınca tarif önizlemesi açılır.
 */
const MealSlot = ({ meal, day, type, onRemove, onClick, draggable = true }) => {
  const { t } = useI18n();
  const from = useMemo(() => ({ day, type }), [day, type]);
  const { dragRef, isDragging } = useMealDrag(meal, from);
  const accent = palette[type] || palette.primary;

  if (!meal?.id) return null;

  return (
    <Box
      ref={draggable ? dragRef : undefined}
      role="button"
      tabIndex={0}
      onClick={() => onClick?.(meal)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(meal);
        }
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        pl: 1,
        pr: 0.25,
        py: 0.25,
        minHeight: 32,
        borderRadius: 2,
        bgcolor: "background.paper",
        border: 1,
        borderColor: alpha(accent, 0.35),
        borderLeft: `3px solid ${accent}`,
        cursor: draggable ? "grab" : "pointer",
        opacity: isDragging ? 0.4 : 1,
        transition: "box-shadow .15s ease, opacity .15s ease",
        "&:hover": { boxShadow: `0 2px 8px ${alpha(accent, 0.25)}` },
        "&:focus-visible": {
          outline: `2px solid ${accent}`,
          outlineOffset: 1,
        },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          component="div"
          sx={{ fontWeight: 600, lineHeight: 1.25 }}
          noWrap
          title={meal.name}
        >
          {meal.name}
        </Typography>
        {meal.calories ? (
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            sx={{ fontSize: 10.5, lineHeight: 1.2 }}
          >
            {t("common.kcal", { count: meal.calories })}
          </Typography>
        ) : null}
      </Box>
      <Tooltip title={t("planner.calendar.remove")}>
        <IconButton
          size="small"
          aria-label={t("planner.calendar.removeMeal", { name: meal.name })}
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(meal);
          }}
          sx={{ p: 0.25, color: "text.secondary" }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default MealSlot;
