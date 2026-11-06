import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import { palette } from "../../theme";
import { MAX_MEALS_PER_SLOT } from "../../constants";
import { useI18n } from "../../i18n";
import MealSlot from "./MealSlot";
import { useMealDrop } from "./dnd";

const getDropStyles = (accent, { isOver, canDrop, isDragging }, isToday) => {
  if (isOver && canDrop) {
    return {
      bgcolor: alpha(accent, 0.16),
      borderColor: accent,
      borderStyle: "solid",
    };
  }
  if (isOver && !canDrop) {
    return { bgcolor: alpha("#DC2626", 0.06), borderColor: "error.light" };
  }
  if (isDragging && canDrop) {
    return {
      bgcolor: alpha(accent, 0.06),
      borderColor: alpha(accent, 0.6),
      borderStyle: "dashed",
    };
  }
  return {
    bgcolor: isToday ? alpha(palette.primary, 0.035) : alpha(accent, 0.03),
    borderColor: "divider",
  };
};

/** Haftalık tablodaki tek bir (gün × öğün) hücresi; bırakma hedefidir. */
const DayCell = ({
  day,
  type,
  meals = [],
  isToday,
  onAdd,
  onRemove,
  onMealClick,
}) => {
  const { t } = useI18n();
  const dropState = useMealDrop(day, type, meals);
  const labelParams = {
    day: t(`common.days.${day}`),
    type: t(`common.mealTypes.${type}`),
  };
  const accent = palette[type] || palette.primary;
  const isFull = meals.length >= MAX_MEALS_PER_SLOT;

  return (
    <Box
      ref={dropState.dropRef}
      aria-label={t("planner.calendar.slotLabel", labelParams)}
      sx={{
        minHeight: 104,
        p: 0.75,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        borderRadius: 2.5,
        border: "1px solid",
        transition: "background-color .15s ease, border-color .15s ease",
        ...getDropStyles(accent, dropState, isToday),
      }}
    >
      {meals.map((meal) => (
        <MealSlot
          key={meal.id}
          meal={meal}
          day={day}
          type={type}
          onRemove={(m) => onRemove(day, type, m)}
          onClick={onMealClick}
        />
      ))}
      {!isFull && (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 28,
          }}
        >
          <Tooltip title={t("planner.calendar.addMealTooltip")}>
            <IconButton
              size="small"
              aria-label={t("planner.calendar.addToSlot", labelParams)}
              onClick={() => onAdd(day, type)}
              sx={{
                color: alpha(accent, 0.8),
                border: `1px dashed ${alpha(accent, 0.4)}`,
                width: 28,
                height: 28,
                "&:hover": { bgcolor: alpha(accent, 0.1) },
              }}
            >
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default DayCell;
