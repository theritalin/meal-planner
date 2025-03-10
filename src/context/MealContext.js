import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getMealsFromFirestore,
  addDefaultMealsToFirestore,
  saveMealPlanToFirestore,
  getMealPlanFromFirestore,
  getCurrentUser,
  checkAndAddUser,
  listenToAuthChanges,
  getUserMeals,
  addUserMeal,
  deleteUserMeal,
} from "../services/firebase";

const MealContext = createContext();

// Varsayılan boş haftalık plan
const defaultWeekPlan = {
  monday: { breakfast: [], lunch: [], dinner: [] },
  tuesday: { breakfast: [], lunch: [], dinner: [] },
  wednesday: { breakfast: [], lunch: [], dinner: [] },
  thursday: { breakfast: [], lunch: [], dinner: [] },
  friday: { breakfast: [], lunch: [], dinner: [] },
  saturday: { breakfast: [], lunch: [], dinner: [] },
  sunday: { breakfast: [], lunch: [], dinner: [] },
};

export function MealProvider({ children }) {
  const [meals, setMeals] = useState([]);
  const [userMeals, setUserMeals] = useState([]);
  const [weekPlan, setWeekPlan] = useState(defaultWeekPlan);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving', 'success', 'error', null
  const [mealFilter, setMealFilter] = useState("all"); // 'all', 'default', 'personal'

  // Firebase'den yemekleri yükle
  useEffect(() => {
    const loadMeals = async () => {
      try {
        setLoading(true);
        // Firebase'den yemekleri getir
        const firebaseMeals = await getMealsFromFirestore();

        if (firebaseMeals.length === 0) {
          console.log("Firebase'de yemek bulunamadı");
          setError(
            "Yemekler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          );
          setMeals([]);
        } else {
          console.log("Firebase'den yemekler yüklendi:", firebaseMeals.length);
          setMeals(firebaseMeals);
        }
      } catch (err) {
        console.error("Yemekleri yüklerken hata oluştu:", err);
        setError(
          "Yemekler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
        setMeals([]);
      } finally {
        setLoading(false);
      }
    };

    loadMeals();
  }, []);

  // Kullanıcı değiştiğinde kişisel yemekleri yükle
  useEffect(() => {
    const loadUserMeals = async () => {
      if (user) {
        try {
          const personalMeals = await getUserMeals(user.uid);
          setUserMeals(personalMeals || []);
        } catch (err) {
          console.error("Kişisel yemekleri yüklerken hata oluştu:", err);
          setUserMeals([]);
        }
      } else {
        setUserMeals([]);
      }
    };

    loadUserMeals();
  }, [user]);

  // Kullanıcı değiştiğinde yemek planını yükle
  useEffect(() => {
    const loadUserMealPlan = async () => {
      if (user) {
        try {
          const userMealPlan = await getMealPlanFromFirestore(user.uid);
          if (userMealPlan) {
            setWeekPlan(userMealPlan);
          }
        } catch (err) {
          console.error("Kullanıcı yemek planı yüklenirken hata oluştu:", err);
        }
      }
    };

    loadUserMealPlan();
  }, [user]);

  // Manuel kaydetme fonksiyonu
  const saveMealPlanToFirebase = async () => {
    if (!user) {
      console.error("Kullanıcı giriş yapmamış, yemek planı kaydedilemez");
      setSaveStatus("error");
      return false;
    }

    try {
      setSaveStatus("saving");
      await saveMealPlanToFirestore(user.uid, weekPlan);
      console.log("Yemek planı başarıyla kaydedildi");
      setSaveStatus("success");

      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);

      return true;
    } catch (err) {
      console.error("Yemek planı kaydedilirken hata oluştu:", err);
      setSaveStatus("error");
      return false;
    }
  };

  // Kişisel yemek ekleme fonksiyonu
  const addPersonalMeal = async (mealData) => {
    if (!user) {
      console.error("Kullanıcı giriş yapmamış, kişisel yemek eklenemez");
      return null;
    }

    try {
      const newMeal = await addUserMeal(user.uid, mealData);
      setUserMeals((prev) => [...prev, newMeal]);
      return newMeal;
    } catch (err) {
      console.error("Kişisel yemek eklerken hata oluştu:", err);
      return null;
    }
  };

  // Kişisel yemek silme fonksiyonu
  const deletePersonalMeal = async (mealId) => {
    if (!user) {
      console.error("Kullanıcı giriş yapmamış, kişisel yemek silinemez");
      return false;
    }

    try {
      const result = await deleteUserMeal(user.uid, mealId);
      if (result) {
        setUserMeals((prev) => prev.filter((meal) => meal.id !== mealId));
      }
      return result;
    } catch (err) {
      console.error("Kişisel yemek silerken hata oluştu:", err);
      return false;
    }
  };

  // Oturum durumunu dinle
  useEffect(() => {
    const unsubscribe = listenToAuthChanges((currentUser) => {
      setUser(currentUser);
    });

    // Temizleme fonksiyonu
    return () => unsubscribe();
  }, []);

  // Kullanıcı oturumunu ayarla
  const setCurrentUser = async (newUser) => {
    if (newUser) {
      // Kullanıcıyı kontrol et ve gerekirse ekle
      await checkAndAddUser(newUser);
    }
    setUser(newUser);
  };

  // Tüm yemekleri filtrele (varsayılan + kişisel)
  const getAllMeals = () => {
    if (mealFilter === "default") {
      return meals;
    } else if (mealFilter === "personal") {
      return userMeals;
    } else {
      // 'all' filtresi veya diğer durumlar
      return [...meals, ...userMeals];
    }
  };

  // Updated to handle adding/removing meals from slots with safety checks
  const updateMealPlan = (day, mealType, meal, action = "add") => {
    console.log("updateMealPlan called:", { day, mealType, meal, action }); // Debug için

    if (!day || !mealType || (action !== "clear" && !meal)) {
      console.error("Invalid parameters for updateMealPlan:", {
        day,
        mealType,
        meal,
        action,
      });
      return;
    }

    // Normalize day to lowercase
    const normalizedDay = day.toLowerCase();

    // Check if day exists in weekPlan
    if (!Object.keys(defaultWeekPlan).includes(normalizedDay)) {
      console.error(`Invalid day: ${normalizedDay}`);
      return;
    }

    // Check if mealType is valid
    if (!["breakfast", "lunch", "dinner"].includes(mealType)) {
      console.error(`Invalid meal type: ${mealType}`);
      return;
    }

    setWeekPlan((prev) => {
      // Safety check: ensure the day exists in the previous state
      const safeDay = prev[normalizedDay] || {
        ...defaultWeekPlan[normalizedDay],
      };

      // Safety check: ensure the meal type array exists
      const currentMeals = Array.isArray(safeDay[mealType])
        ? [...safeDay[mealType]]
        : [];

      if (action === "add") {
        // Only add if we have fewer than 3 meals and the meal isn't already in the slot
        if (
          currentMeals.length < 3 &&
          !currentMeals.some((m) => m.id === meal.id)
        ) {
          currentMeals.push(meal);
          console.log(
            `Added meal ${meal.name} to ${normalizedDay} ${mealType}`
          );
        } else {
          console.log(`Meal ${meal.name} already exists or slot is full`);
        }
      } else if (action === "remove") {
        // Remove the meal if it exists
        const index = currentMeals.findIndex((m) => m.id === meal.id);
        if (index !== -1) {
          currentMeals.splice(index, 1);
          console.log(
            `Removed meal ${meal.name} from ${normalizedDay} ${mealType}`
          );
        } else {
          console.log(
            `Meal ${meal.name} not found in ${normalizedDay} ${mealType}`
          );
        }
      } else if (action === "clear") {
        // Return a new state with an empty array for the specified day and meal type
        console.log(`Cleared all meals from ${normalizedDay} ${mealType}`);
        return {
          ...prev,
          [normalizedDay]: {
            ...safeDay,
            [mealType]: [],
          },
        };
      }

      // Return the updated state
      return {
        ...prev,
        [normalizedDay]: {
          ...safeDay,
          [mealType]: currentMeals,
        },
      };
    });
  };

  // Add search/filter functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("all");

  const filteredMeals = getAllMeals().filter((meal) => {
    const matchesSearch =
      meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meal.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      mealTypeFilter === "all" || meal.type === mealTypeFilter;

    return matchesSearch && matchesType;
  });

  // Rastgele yemek planlama fonksiyonu
  const generateRandomMealPlan = () => {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const mealTypes = ["breakfast", "lunch", "dinner"];

    // Önce mevcut planı temizle
    const newPlan = {
      monday: { breakfast: [], lunch: [], dinner: [] },
      tuesday: { breakfast: [], lunch: [], dinner: [] },
      wednesday: { breakfast: [], lunch: [], dinner: [] },
      thursday: { breakfast: [], lunch: [], dinner: [] },
      friday: { breakfast: [], lunch: [], dinner: [] },
      saturday: { breakfast: [], lunch: [], dinner: [] },
      sunday: { breakfast: [], lunch: [], dinner: [] },
    };

    // Tüm yemekleri al (varsayılan + kişisel)
    const allMeals = [...meals, ...userMeals];

    // Yemekleri türlerine göre ayır
    const mealsByType = {
      breakfast: allMeals.filter((meal) => meal.type === "breakfast"),
      lunch: allMeals.filter((meal) => meal.type === "lunch"),
      dinner: allMeals.filter((meal) => meal.type === "dinner"),
    };

    // Her öğün türü için yemekleri dağıt
    mealTypes.forEach((type) => {
      const availableMeals = [...mealsByType[type]]; // Kopyasını al

      if (availableMeals.length === 0) return; // Bu türde yemek yoksa atla

      // Her gün için farklı yemek seç
      days.forEach((day) => {
        // Eğer hala dağıtılacak yemek varsa
        if (availableMeals.length > 0) {
          // Rastgele bir yemek seç
          const randomIndex = Math.floor(Math.random() * availableMeals.length);
          const selectedMeal = availableMeals[randomIndex];

          // Seçilen yemeği plana ekle
          newPlan[day][type] = [selectedMeal];

          // Seçilen yemeği listeden çıkar (aynı yemeği tekrar seçmemek için)
          availableMeals.splice(randomIndex, 1);
        } else {
          // Eğer tüm yemekler dağıtıldıysa, orijinal listeden tekrar seç
          const originalList = mealsByType[type];
          if (originalList.length > 0) {
            const randomIndex = Math.floor(Math.random() * originalList.length);
            newPlan[day][type] = [originalList[randomIndex]];
          }
        }
      });
    });

    setWeekPlan(newPlan);
  };

  // Tüm planı temizleme fonksiyonu
  const clearMealPlan = () => {
    // Tamamen yeni ve boş bir plan oluştur
    const emptyPlan = {
      monday: { breakfast: [], lunch: [], dinner: [] },
      tuesday: { breakfast: [], lunch: [], dinner: [] },
      wednesday: { breakfast: [], lunch: [], dinner: [] },
      thursday: { breakfast: [], lunch: [], dinner: [] },
      friday: { breakfast: [], lunch: [], dinner: [] },
      saturday: { breakfast: [], lunch: [], dinner: [] },
      sunday: { breakfast: [], lunch: [], dinner: [] },
    };
    setWeekPlan(emptyPlan);
  };

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
    error,
    user,
    setCurrentUser,
    saveMealPlanToFirebase,
    saveStatus,
    addPersonalMeal,
    deletePersonalMeal,
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
