import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { palette } from "../../theme";
import {
  DAYS,
  DAY_LABELS,
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
} from "../../constants";
import { useMeals } from "../../context/MealContext";
import DayCell from "./DayCell";
import { getTodayKey, slotMeals } from "./planUtils";

const LABEL_COL = 84;

const DayHeader = ({ day, isToday }) => (
  <Box
    sx={{
      textAlign: "center",
      py: 1,
      borderRadius: 2.5,
      bgcolor: isToday ? "primary.main" : "transparent",
      color: isToday ? "primary.contrastText" : "text.primary",
    }}
  >
    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
      {DAY_LABELS[day]}
    </Typography>
    <Typography
      variant="caption"
      sx={{ opacity: isToday ? 0.9 : 0.6, fontSize: 11 }}
    >
      {isToday ? "Bugün" : " "}
    </Typography>
  </Box>
);

const MealTypeLabel = ({ type }) => {
  const accent = palette[type];
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        pr: 1,
        borderRadius: 2.5,
        bgcolor: alpha(accent, 0.08),
        borderLeft: `4px solid ${accent}`,
        pl: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: accent }}>
        {MEAL_TYPE_LABELS[type]}
      </Typography>
    </Box>
  );
};

/**
 * Masaüstü haftalık plan tablosu: sütunlar günler, satırlar öğünler.
 * Dar ekranlarda yatay kaydırılabilir.
 */
const WeekView = ({ onAddClick, onMealClick }) => {
  const { weekPlan, updateMealPlan } = useMeals();
  const todayKey = getTodayKey();
  const handleRemove = (day, type, meal) =>
    updateMealPlan(day, type, meal, "remove");

  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Box
        role="region"
        aria-label="Haftalık yemek planı"
        sx={{
          display: "grid",
          gridTemplateColumns: `${LABEL_COL}px repeat(${DAYS.length}, minmax(112px, 1fr))`,
          gap: 1,
          minWidth: LABEL_COL + DAYS.length * 120,
        }}
      >
        <Box />
        {DAYS.map((day) => (
          <DayHeader key={day} day={day} isToday={day === todayKey} />
        ))}

        {MEAL_TYPES.map((type) => (
          <React.Fragment key={type}>
            <MealTypeLabel type={type} />
            {DAYS.map((day) => (
              <DayCell
                key={`${day}-${type}`}
                day={day}
                type={type}
                meals={slotMeals(weekPlan, day, type)}
                isToday={day === todayKey}
                onAdd={onAddClick}
                onRemove={handleRemove}
                onMealClick={onMealClick}
              />
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default WeekView;
