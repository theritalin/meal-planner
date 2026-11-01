import { useDrag, useDrop } from "react-dnd";
import { useMeals } from "../../context/MealContext";
import { MAX_MEALS_PER_SLOT } from "../../constants";

/** Planlayıcıdaki tüm sürükle-bırak işlemlerinde kullanılan tür. */
export const MEAL_DND_TYPE = "MEAL";

const sameSlot = (a, b) => !!a && !!b && a.day === b.day && a.type === b.type;

/**
 * Bir yemeği sürüklenebilir yapar.
 * `from` verilirse ({ day, type }) yemek o slottan taşınır: başka bir slota
 * bırakıldığında kaynak slottan kaldırılır.
 */
export const useMealDrag = (meal, from = null) => {
  const { updateMealPlan } = useMeals();
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: MEAL_DND_TYPE,
      item: { meal, from },
      canDrag: () => !!meal?.id,
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      end: (item, monitor) => {
        if (!from || !monitor.didDrop()) return;
        const target = monitor.getDropResult();
        if (target && !sameSlot(target, from)) {
          updateMealPlan(from.day, from.type, meal, "remove");
        }
      },
    }),
    [meal, from?.day, from?.type, updateMealPlan],
  );
  return { dragRef, isDragging };
};

/** Bir (gün, öğün) hücresini bırakma hedefi yapar. */
export const useMealDrop = (day, type, plannedMeals = []) => {
  const { updateMealPlan } = useMeals();
  const [{ isOver, canDrop, isDragging }, dropRef] = useDrop(
    () => ({
      accept: MEAL_DND_TYPE,
      canDrop: ({ meal, from }) => {
        if (sameSlot(from, { day, type })) return true;
        return (
          plannedMeals.length < MAX_MEALS_PER_SLOT &&
          !plannedMeals.some((m) => m.id === meal?.id)
        );
      },
      drop: ({ meal, from }) => {
        if (!sameSlot(from, { day, type })) {
          updateMealPlan(day, type, meal, "add");
        }
        return { day, type };
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
        isDragging: !!monitor.getItem(),
      }),
    }),
    [day, type, plannedMeals, updateMealPlan],
  );
  return { dropRef, isOver, canDrop, isDragging };
};
