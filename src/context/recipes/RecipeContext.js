import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  getRecipesFromFirestore,
  getUserRecipes,
  addUserRecipe,
  deleteUserRecipe,
  addDefaultRecipesToFirestore,
  addRecipeToDefaultMeal,
  deleteRecipeFromDefaultMeal,
  getMealsFromFirestore,
  saveRecipeForUser,
  unsaveRecipeForUser,
  db,
} from "../../services/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useMeals } from "../MealContext";
import default_recipes from "../../data/recipes";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  // Bunun yerine doğrudan auth'dan user bilgisini alacağız
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]); // Varsayılan tarifler
  const [userRecipes, setUserRecipes] = useState([]); // Kullanıcı tarifleri
  const [savedRecipes, setSavedRecipes] = useState([]); // Kaydedilen tarifler
  const [defaultMeals, setDefaultMeals] = useState([]); // Varsayılan yemekler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeFilter, setRecipeFilter] = useState("all"); // 'all', 'default', 'personal'
  const [selectedMealId, setSelectedMealId] = useState(null); // Seçilen yemeğin ID'si
  const [lastFetchTime, setLastFetchTime] = useState(0); // Son sorgu zamanı

  // Firebase'den auth durumunu dinle
  useEffect(() => {
    import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
      const auth = getAuth();
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });

      return () => unsubscribe();
    });
  }, []);

  // Firebase'den tarifleri ve yemekleri yükle - sadece bir kez
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Şu anki zaman
        const now = Date.now();

        // Son sorgudan bu yana en az 5 dakika geçtiyse yeniden yükle
        if (now - lastFetchTime > 5 * 60 * 1000) {
          console.log("Veriler yükleniyor - 5 dakikadan fazla zaman geçti");

          // Varsayılan yemekleri getir
          const meals = await getMealsFromFirestore();
          setDefaultMeals(meals);

          // Tarifleri yemeklerden çıkar
          const extractedRecipes = [];
          meals.forEach((meal) => {
            if (meal.recipes && Array.isArray(meal.recipes)) {
              extractedRecipes.push(...meal.recipes);
            }
          });

          setRecipes(extractedRecipes);
          setLastFetchTime(now);
        } else {
          console.log("Veriler önbellekten kullanılıyor");
        }
      } catch (err) {
        console.error("Verileri yüklerken hata oluştu:", err);
        setError(
          "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lastFetchTime]);

  // Kullanıcı değiştiğinde kişisel tarifleri yükle
  const loadUserRecipes = useCallback(async (userId) => {
    if (userId) {
      try {
        const personalRecipes = await getUserRecipes(userId);
        setUserRecipes(personalRecipes || []);
      } catch (err) {
        console.error("Kişisel tarifleri yüklerken hata oluştu:", err);
        setUserRecipes([]);
      }
    } else {
      setUserRecipes([]);
    }
  }, []);

  // Kişisel tarif ekleme fonksiyonu
  const addPersonalRecipe = async (userId, recipeData) => {
    if (!userId) {
      console.error("Kullanıcı giriş yapmamış, kişisel tarif eklenemez");
      return null;
    }

    try {
      const newRecipe = await addUserRecipe(userId, recipeData);
      setUserRecipes((prev) => [...prev, newRecipe]);
      return newRecipe;
    } catch (err) {
      console.error("Kişisel tarif eklerken hata oluştu:", err);
      return null;
    }
  };

  // Kişisel tarif silme fonksiyonu
  const deletePersonalRecipe = async (userId, recipeId) => {
    if (!userId) {
      console.error("Kullanıcı giriş yapmamış, kişisel tarif silinemez");
      return false;
    }

    try {
      const result = await deleteUserRecipe(userId, recipeId);
      if (result) {
        setUserRecipes((prev) =>
          prev.filter((recipe) => recipe.id !== recipeId)
        );
      }
      return result;
    } catch (err) {
      console.error("Kişisel tarif silerken hata oluştu:", err);
      return false;
    }
  };

  // Varsayılan yemeğe tarif ekleme fonksiyonu (admin için)
  const addRecipeToFirestoreDb = async (recipeData) => {
    try {
      if (!recipeData.mealId) {
        throw new Error("Tarif eklemek için yemek ID'si gerekli");
      }

      const newRecipe = await addRecipeToDefaultMeal(
        recipeData.mealId,
        recipeData
      );

      // Yerel state'i güncelle
      setDefaultMeals((prevMeals) => {
        return prevMeals.map((meal) => {
          if (meal.id === recipeData.mealId) {
            const recipes = meal.recipes || [];
            return {
              ...meal,
              recipes: [...recipes, newRecipe],
            };
          }
          return meal;
        });
      });

      // Tarifleri güncelle
      setRecipes((prev) => [...prev, newRecipe]);

      return newRecipe;
    } catch (err) {
      console.error("Varsayılan tarif eklerken hata oluştu:", err);
      return null;
    }
  };

  // Verileri yeniden yükle
  const refreshData = useCallback(async () => {
    setLastFetchTime(0); // Sıfırlayarak yeniden yüklemeyi tetikle
  }, []);

  // Varsayılan tarifleri eklemek için yönetici fonksiyonu
  const addDefaultRecipes = async () => {
    try {
      await addDefaultRecipesToFirestore(default_recipes);
      console.log("Varsayılan tarifler başarıyla eklendi");
      // Verileri yeniden yükle
      refreshData();
      return true;
    } catch (err) {
      console.error("Varsayılan tarifleri eklerken hata oluştu:", err);
      return false;
    }
  };

  // Tüm tarifleri filtrele (varsayılan + kişisel) - memoize edilmiş
  const getAllRecipes = useCallback(() => {
    if (recipeFilter === "default") {
      return recipes;
    } else if (recipeFilter === "personal") {
      return userRecipes;
    } else {
      // 'all' filtresi veya diğer durumlar
      return [...recipes, ...userRecipes];
    }
  }, [recipes, userRecipes, recipeFilter]);

  // Belirli bir yemeğe ait tarifleri getir - memoize edilmiş
  const getRecipesForMeal = useCallback(
    (mealId) => {
      if (!mealId) return [];

      // Önce varsayılan yemeklerden kontrol et
      const meal = defaultMeals.find((m) => m.id === mealId);
      if (meal && meal.recipes && Array.isArray(meal.recipes)) {
        return meal.recipes;
      }

      // Eğer bulunamazsa tüm tariflerde ara
      return getAllRecipes().filter((recipe) => recipe.mealId === mealId);
    },
    [getAllRecipes, defaultMeals]
  );

  // Arama/filtreleme fonksiyonları
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Filtrelenmiş tarifleri memoize et
  const filteredRecipes = useMemo(() => {
    console.log("filteredRecipes hesaplanıyor");
    return getAllRecipes().filter((recipe) => {
      const matchesSearch =
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients?.some(
          (ing) =>
            typeof ing === "object" &&
            ing.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesDifficulty =
        difficultyFilter === "all" || recipe.difficulty === difficultyFilter;

      const matchesMeal = !selectedMealId || recipe.mealId === selectedMealId;

      return matchesSearch && matchesDifficulty && matchesMeal;
    });
  }, [getAllRecipes, searchTerm, difficultyFilter, selectedMealId]);

  // Kullanıcı tariflerini yükle
  useEffect(() => {
    if (user) {
      loadUserRecipes(user.uid);
    }
  }, [user, loadUserRecipes, lastFetchTime]);

  // Kaydedilen tarifleri yükle
  const loadSavedRecipes = useCallback(async (userId) => {
    if (!userId) {
      setSavedRecipes([]);
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists() && userSnap.data().savedRecipes) {
        setSavedRecipes(userSnap.data().savedRecipes);
      } else {
        setSavedRecipes([]);
      }
    } catch (err) {
      console.error("Kaydedilen tarifleri yüklerken hata oluştu:", err);
      setError("Kaydedilen tarifleri yüklerken bir hata oluştu");
      setSavedRecipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kullanıcı giriş yaptığında kaydedilen tarifleri yükle
  useEffect(() => {
    if (user) {
      loadSavedRecipes(user.uid);
    } else {
      setSavedRecipes([]);
    }
  }, [user, loadSavedRecipes, lastFetchTime]);

  // Tarif kaydetme fonksiyonu
  const saveRecipe = async (userId, recipe) => {
    if (!userId) {
      console.error("Kullanıcı giriş yapmamış, tarif kaydedilemez");
      return null;
    }

    try {
      const updatedSavedRecipes = await saveRecipeForUser(userId, recipe);
      setSavedRecipes(updatedSavedRecipes);
      return updatedSavedRecipes;
    } catch (err) {
      console.error("Tarif kaydedilirken hata oluştu:", err);
      return null;
    }
  };

  // Kaydedilen tarifi kaldırma fonksiyonu
  const unsaveRecipe = async (userId, recipeId) => {
    if (!userId) {
      console.error("Kullanıcı giriş yapmamış, tarif kaldırılamaz");
      return false;
    }

    try {
      const updatedSavedRecipes = await unsaveRecipeForUser(userId, recipeId);
      setSavedRecipes(updatedSavedRecipes);
      return true;
    } catch (err) {
      console.error("Tarif kaldırılırken hata oluştu:", err);
      return false;
    }
  };

  const value = {
    recipes,
    userRecipes,
    defaultMeals,
    filteredRecipes,
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    recipeFilter,
    setRecipeFilter,
    loading,
    error,
    addPersonalRecipe,
    deletePersonalRecipe,
    loadUserRecipes,
    getRecipesForMeal,
    selectedMealId,
    setSelectedMealId,
    addDefaultRecipes,
    getAllRecipes,
    addRecipeToFirestoreDb,
    refreshData,
    savedRecipes,
    saveRecipe,
    unsaveRecipe,
    loadSavedRecipes,
    getUserRecipes,
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export function useRecipes() {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipes must be used within a RecipeProvider");
  }
  return context;
}
