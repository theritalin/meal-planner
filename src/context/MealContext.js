import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  getMealsFromFirestore,
  saveMealPlanToFirestore,
  getMealPlanFromFirestore,
  checkAndAddUser,
  listenToAuthChanges,
  getUserMeals,
  addUserMeal,
  deleteUserMeal,
  isUserAdmin,
} from "../services/firebase";
import {
  DAYS,
  MEAL_TYPES,
  MAX_MEALS_PER_SLOT,
  createEmptyWeekPlan,
} from "../constants";
import { normalizeText } from "../utils/recipes";

const MealContext = createContext();

/** Firestore'dan gelen planı eksik gün/öğünlere karşı tamamlar. */
const normalizePlan = (plan) => {
  const empty = createEmptyWeekPlan();
  if (!plan) return empty;
  DAYS.forEach((day) => {
    MEAL_TYPES.forEach((type) => {
      const slot = plan?.[day]?.[type];
      empty[day][type] = Array.isArray(slot) ? slot : [];
    });
  });
  return empty;
};

const shuffle = (list) => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export function MealProvider({ children }) {
  const [meals, setMeals] = useState([]);
  const [userMeals, setUserMeals] = useState([]);
  const [weekPlan, setWeekPlan] = useState(createEmptyWeekPlan);
  const [loading, setLoading] = useState(true); // yemekler yükleniyor
  const [authLoading, setAuthLoading] = useState(true); // oturum çözülüyor
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'success' | 'error' | null
  const [mealFilter, setMealFilter] = useState("all"); // 'all' | 'default' | 'personal'
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");
  const saveTimer = useRef(null);

  // Oturum durumunu dinle
  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser ? await isUserAdmin(currentUser.uid) : false);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Varsayılan yemekleri yükle
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const firebaseMeals = await getMealsFromFirestore();
        setMeals(firebaseMeals);
        if (firebaseMeals.length === 0) {
          setError("Yemek listesi şu anda boş görünüyor.");
        }
      } catch (err) {
        console.error("Yemekleri yüklerken hata oluştu:", err);
        setError(
          "Yemekler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Kullanıcı değişince kişisel yemekleri ve planı yükle
  useEffect(() => {
    if (!user) {
      setUserMeals([]);
      setWeekPlan(createEmptyWeekPlan());
      return;
    }
    let cancelled = false;
    Promise.all([getUserMeals(user.uid), getMealPlanFromFirestore(user.uid)])
      .then(([personalMeals, plan]) => {
        if (cancelled) return;
        setUserMeals(personalMeals || []);
        if (plan) setWeekPlan(normalizePlan(plan));
      })
      .catch((err) =>
        console.error("Kullanıcı verileri yüklenirken hata oluştu:", err)
      );
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const saveMealPlanToFirebase = useCallback(async () => {
    if (!user) {
      setSaveStatus("error");
      return false;
    }
    setSaveStatus("saving");
    const ok = await saveMealPlanToFirestore(user.uid, weekPlan);
    setSaveStatus(ok ? "success" : "error");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveStatus(null), 3000);
    return ok;
  }, [user, weekPlan]);

  const addPersonalMeal = useCallback(
    async (mealData) => {
      if (!user) return null;
      try {
        const newMeal = await addUserMeal(user.uid, mealData);
        setUserMeals((prev) => [...prev, newMeal]);
        return newMeal;
      } catch (err) {
        console.error("Kişisel yemek eklerken hata oluştu:", err);
        return null;
      }
    },
    [user]
  );

  const deletePersonalMeal = useCallback(
    async (mealId) => {
      if (!user) return false;
      const result = await deleteUserMeal(user.uid, mealId);
      if (result) setUserMeals((prev) => prev.filter((m) => m.id !== mealId));
      return result;
    },
    [user]
  );

  // Geriye dönük uyumluluk için korunuyor
  const setCurrentUser = useCallback(async (newUser) => {
    if (newUser) {
      await checkAndAddUser(newUser);
      setIsAdmin(await isUserAdmin(newUser.uid));
    } else {
      setIsAdmin(false);
    }
    setUser(newUser);
  }, []);

  const getAllMeals = useCallback(() => {
    if (mealFilter === "default") return meals;
    if (mealFilter === "personal") return userMeals;
    return [...meals, ...userMeals];
  }, [mealFilter, meals, userMeals]);

  /**
   * Plana yemek ekler / çıkarır / slotu temizler.
   * action: "add" | "remove" | "clear"
   */
  const updateMealPlan = useCallback((day, mealType, meal, action = "add") => {
    const normalizedDay = day?.toLowerCase();
    if (!DAYS.includes(normalizedDay) || !MEAL_TYPES.includes(mealType)) return;
    if (action !== "clear" && !meal) return;

    setWeekPlan((prev) => {
      const dayPlan = prev[normalizedDay] || {};
      const current = Array.isArray(dayPlan[mealType])
        ? dayPlan[mealType]
        : [];
      let next = current;

      if (action === "add") {
        if (
          current.length < MAX_MEALS_PER_SLOT &&
          !current.some((m) => m.id === meal.id)
        ) {
          next = [...current, meal];
        }
      } else if (action === "remove") {
        next = current.filter((m) => m.id !== meal.id);
      } else if (action === "clear") {
        next = [];
      }

      if (next === current) return prev;
      return {
        ...prev,
        [normalizedDay]: { ...dayPlan, [mealType]: next },
      };
    });
  }, []);

  const filteredMeals = useMemo(() => {
    const q = normalizeText(searchTerm);
    return getAllMeals().filter((meal) => {
      const matchesSearch =
        !q ||
        normalizeText(meal.name).includes(q) ||
        normalizeText(meal.description).includes(q);
      const matchesType =
        mealTypeFilter === "all" || meal.type === mealTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [getAllMeals, searchTerm, mealTypeFilter]);

  /** Her öğün türü için mümkün olduğunca tekrarsız rastgele plan oluşturur. */
  const generateRandomMealPlan = useCallback(() => {
    const pool = getAllMeals();
    const newPlan = createEmptyWeekPlan();

    MEAL_TYPES.forEach((type) => {
      const ofType = pool.filter((meal) => meal.type === type);
      if (ofType.length === 0) return;
      let bag = shuffle(ofType);
      DAYS.forEach((day) => {
        if (bag.length === 0) bag = shuffle(ofType);
        newPlan[day][type] = [bag.pop()];
      });
    });

    setWeekPlan(newPlan);
  }, [getAllMeals]);

  const clearMealPlan = useCallback(
    () => setWeekPlan(createEmptyWeekPlan()),
    []
  );

  const value = {
    meals,
    userMeals,
    filteredMeals,
    searchTerm,
    setSearchTerm,
    mealTypeFilter,
    setMealTypeFilter,
    mealFilter,
    setMealFilter,
    weekPlan,
    updateMealPlan,
    generateRandomMealPlan,
    clearMealPlan,
    loading,
    authLoading,
    error,
    user,
    isAdmin,
    setCurrentUser,
    saveMealPlanToFirebase,
    saveStatus,
    addPersonalMeal,
    deletePersonalMeal,
    selectedMeal,
    selectMeal: setSelectedMeal,
  };

  return <MealContext.Provider value={value}>{children}</MealContext.Provider>;
}

export function useMeals() {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMeals must be used within a MealProvider");
  }
  return context;
}
