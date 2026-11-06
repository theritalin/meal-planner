import React, { useEffect, useRef } from "react";
import {
  Badge,
  Button,
  Card,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { palette } from "../../theme";
import { DAYS, MAX_MEALS_PER_SLOT, MEAL_TYPES } from "../../constants";
import { useI18n } from "../../i18n";
import { useMeals } from "../../context/MealContext";
import { getDayMealCount, getTodayKey, slotMeals } from "./planUtils";
import { formatMealMeta } from "../meals/mealUtils";

/** Yatay kaydırılabilir gün seçici. Seçili gün görünür alana kaydırılır. */
const DaySelector = ({ selectedDay, onSelect, weekPlan }) => {
  const { t } = useI18n();
  const todayKey = getTodayKey();
  const refs = useRef({});

  useEffect(() => {
    refs.current[selectedDay]?.scrollIntoView?.({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [selectedDay]);

  return (
    <Stack
      direction="row"
      spacing={1}
      role="tablist"
      aria-label={t("planner.calendar.daySelector")}
      sx={{
        overflowX: "auto",
        py: 0.5,
        mx: -2,
        px: 2,
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {DAYS.map((day) => {
        const count = getDayMealCount(weekPlan, day);
        const selected = day === selectedDay;
        return (
          <Badge
            key={day}
            color="secondary"
            variant="dot"
            invisible={count === 0}
            overlap="rectangular"
          >
            <Chip
              ref={(el) => {
                refs.current[day] = el;
              }}
              role="tab"
              aria-selected={selected}
              label={
                day === todayKey
                  ? t("planner.calendar.dayWithToday", {
                      day: t(`common.days.${day}`),
                    })
                  : t(`common.days.${day}`)
              }
              color={selected ? "primary" : "default"}
              variant={selected ? "filled" : "outlined"}
              onClick={() => onSelect(day)}
              sx={{
                flexShrink: 0,
                bgcolor: selected ? undefined : "background.paper",
              }}
            />
          </Badge>
        );
      })}
    </Stack>
  );
};

const MealTypeSection = ({
  day,
  type,
  meals,
  onAdd,
  onRemove,
  onMealClick,
}) => {
  const { t } = useI18n();
  const accent = palette[type];
  const typeLabel = t(`common.mealTypes.${type}`);
  const isFull = meals.length >= MAX_MEALS_PER_SLOT;

  return (
    <Card sx={{ borderLeft: `4px solid ${accent}`, overflow: "hidden" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.25, bgcolor: alpha(accent, 0.06) }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: accent }}>
          {typeLabel}
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          disabled={isFull}
          onClick={() => onAdd(day, type)}
          sx={{ color: accent }}
          aria-label={t("planner.calendar.addToType", { type: typeLabel })}
        >
          {isFull ? t("planner.calendar.full") : t("planner.calendar.add")}
        </Button>
      </Stack>
      {meals.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ px: 2, py: 2 }}
        >
          {t("planner.calendar.emptySlot")}
        </Typography>
      ) : (
        <List disablePadding>
          {meals.map((meal) => (
            <ListItem
              key={meal.id}
              disablePadding
              divider
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label={t("planner.calendar.removeMeal", {
                    name: meal.name,
                  })}
                  onClick={() => onRemove(day, type, meal)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemButton onClick={() => onMealClick?.(meal)}>
                <ListItemText
                  primary={meal.name}
                  secondary={formatMealMeta(meal, t) || null}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  );
};

/**
 * Mobil gün gün görünüm: gün seçici + seçili günün üç öğün bölümü.
 * Dokunmatik cihazlarda sürükle-bırak yerine dokunarak ekleme kullanılır.
 */
const DayView = ({ selectedDay, onSelectDay, onAddClick, onMealClick }) => {
  const { weekPlan, updateMealPlan } = useMeals();
  const handleRemove = (day, type, meal) =>
    updateMealPlan(day, type, meal, "remove");

  return (
    <Stack spacing={2}>
      <DaySelector
        selectedDay={selectedDay}
        onSelect={onSelectDay}
        weekPlan={weekPlan}
      />
      {MEAL_TYPES.map((type) => (
        <MealTypeSection
          key={type}
          day={selectedDay}
          type={type}
          meals={slotMeals(weekPlan, selectedDay, type)}
          onAdd={onAddClick}
          onRemove={handleRemove}
          onMealClick={onMealClick}
        />
      ))}
    </Stack>
  );
};

export default DayView;
