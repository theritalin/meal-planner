import React from "react";
import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { palette } from "../../theme";
import { DAYS, MEAL_TYPES } from "../../constants";
import { useI18n } from "../../i18n";
import { useMeals } from "../../context/MealContext";
import DayCell from "./DayCell";
import { getTodayKey, slotMeals } from "./planUtils";

const LABEL_COL = 84;

const DayHeader = ({ day, isToday }) => {
  const { t } = useI18n();
  return (
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
        {t(`common.days.${day}`)}
      </Typography>
      <Typography
        variant="caption"
        sx={{ opacity: isToday ? 0.9 : 0.6, fontSize: 11 }}
      >
        {isToday ? t("common.today") : "\u00a0"}
      </Typography>
    </Box>
  );
};

const MealTypeLabel = ({ type }) => {
  const { t } = useI18n();
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
        {t(`common.mealTypes.${type}`)}
      </Typography>
    </Box>
  );
};

/**
 * Masaüstü haftalık plan tablosu: sütunlar günler, satırlar öğünler.
 * Dar ekranlarda yatay kaydırılabilir.
 */
const WeekView = ({ onAddClick, onMealClick }) => {
  const { t } = useI18n();
  const { weekPlan, updateMealPlan } = useMeals();
  const todayKey = getTodayKey();
  const handleRemove = (day, type, meal) =>
    updateMealPlan(day, type, meal, "remove");

  return (
    <Box sx={{ overflowX: "auto", pb: 0.5 }}>
      <Box
        role="region"
        aria-label={t("planner.calendar.weekRegion")}
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
