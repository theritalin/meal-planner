import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  getUserRecipes,
  addUserRecipe,
  updateUserRecipe,
  deleteUserRecipe,
  addDefaultRecipesToFirestore,
  addRecipeToDefaultMeal,
  getMealsFromFirestore,
  saveRecipeForUser,
  unsaveRecipeForUser,
  listenToAuthChanges,
  getUserProfile,
} from "../../services/firebase";
import default_recipes from "../../data/recipes";
import { dedupeById, recipeMatches } from "../../utils/recipes";

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]); // Varsayılan tarifler
  const [userRecipes, setUserRecipes] = useState([]); // Kullanıcı tarifleri
  const [savedRecipes, setSavedRecipes] = useState([]); // Kaydedilen tarifler
  const [defaultMeals, setDefaultMeals] = useState([]); // Varsayılan yemekler
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recipeFilter, setRecipeFilter] = useState("all"); // 'all' | 'default' | 'personal' | 'saved'
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [reloadKey, setReloadKey] = useState(0);

  // Oturum durumunu dinle
  useEffect(() => listenToAuthChanges(setUser), []);

  // Varsayılan yemekleri ve içlerindeki tarifleri yükle
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const meals = await getMealsFromFirestore();
        if (cancelled) return;
        setDefaultMeals(meals);
        setRecipes(
          meals.flatMap((meal) =>
            Array.isArray(meal.recipes)
              ? meal.recipes.map((r) => ({ mealId: meal.id, ...r }))
              : []
          )
        );
      } catch (err) {
        console.error("Verileri yüklerken hata oluştu:", err);
        if (!cancelled) {
          setError(
            "Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Kullanıcıya ait kişisel ve kaydedilmiş tarifleri tek okumada yükle
  useEffect(() => {
    if (!user) {
      setUserRecipes([]);
      setSavedRecipes([]);
      return;
    }
    let cancelled = false;
    getUserProfile(user.uid).then((profile) => {
      if (cancelled) return;
      setUserRecipes(profile?.personalRecipes || []);
      setSavedRecipes(profile?.savedRecipes || []);
    });
    return () => {
      cancelled = true;
    };
  }, [user, reloadKey]);

  const loadUserRecipes = useCallback(async (userId) => {
    const personal = userId ? await getUserRecipes(userId) : [];
    setUserRecipes(personal || []);
  }, []);

  const loadSavedRecipes = useCallback(async (userId) => {
    const profile = userId ? await getUserProfile(userId) : null;
    setSavedRecipes(profile?.savedRecipes || []);
  }, []);

  const refreshData = useCallback(() => setReloadKey((k) => k + 1), []);

  // ---- Kişisel tarif CRUD ----
  const addPersonalRecipe = useCallback(async (userId, recipeData) => {
    if (!userId) return null;
    try {
      const newRecipe = await addUserRecipe(userId, recipeData);
      setUserRecipes((prev) => [...prev, newRecipe]);
      return newRecipe;
    } catch (err) {
      console.error("Kişisel tarif eklerken hata oluştu:", err);
      return null;
    }
  }, []);

  const updatePersonalRecipe = useCallback(
    async (userId, recipeId, updates) => {
      if (!userId) return null;
      try {
        const updated = await updateUserRecipe(userId, recipeId, updates);
        setUserRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? updated : r))
        );
        return updated;
      } catch (err) {
        console.error("Kişisel tarif güncellenirken hata oluştu:", err);
        return null;
      }
    },
    []
  );

  const deletePersonalRecipe = useCallback(async (userId, recipeId) => {
    if (!userId) return false;
    const result = await deleteUserRecipe(userId, recipeId);
    if (result) {
      setUserRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }
    return result;
  }, []);

  // ---- Kaydedilen tarifler ----
  const saveRecipe = useCallback(async (userId, recipe) => {
    if (!userId) return null;
    try {
      const updated = await saveRecipeForUser(userId, recipe);
      setSavedRecipes(updated);
      return updated;
    } catch (err) {
      console.error("Tarif kaydedilirken hata oluştu:", err);
      return null;
    }
  }, []);

  const unsaveRecipe = useCallback(async (userId, recipeId) => {
    if (!userId) return false;
    try {
      const updated = await unsaveRecipeForUser(userId, recipeId);
      setSavedRecipes(updated);
      return true;
    } catch (err) {
      console.error("Tarif kaldırılırken hata oluştu:", err);
      return false;
    }
  }, []);

  const isRecipeSaved = useCallback(
    (recipeId) => savedRecipes.some((r) => r.id === recipeId),
    [savedRecipes]
  );

  // ---- Yönetici işlemleri ----
  const addRecipeToFirestoreDb = useCallback(async (recipeData) => {
    try {
      if (!recipeData.mealId) {
        throw new Error("Tarif eklemek için yemek ID'si gerekli");
      }
      const newRecipe = await addRecipeToDefaultMeal(
        recipeData.mealId,
        recipeData
      );
      setDefaultMeals((prev) =>
        prev.map((meal) =>
          meal.id === recipeData.mealId
            ? { ...meal, recipes: [...(meal.recipes || []), newRecipe] }
            : meal
        )
      );
      setRecipes((prev) => [...prev, newRecipe]);
      return newRecipe;
    } catch (err) {
      console.error("Varsayılan tarif eklerken hata oluştu:", err);
      return null;
    }
  }, []);

  const addDefaultRecipes = useCallback(async () => {
    const ok = await addDefaultRecipesToFirestore(default_recipes);
    if (ok) refreshData();
    return ok;
  }, [refreshData]);

  // ---- Seçiciler ----

  /** Kişisel + kaydedilen + varsayılan tarifler (tekrarsız). */
  const allRecipes = useMemo(
    () => dedupeById([...userRecipes, ...savedRecipes, ...recipes]),
    [userRecipes, savedRecipes, recipes]
  );

  /** Tarif kitabım: kullanıcının kendi ve kaydettiği tarifler. */
  const cookbookRecipes = useMemo(
    () => dedupeById([...userRecipes, ...savedRecipes]),
    [userRecipes, savedRecipes]
  );

  const getRecipeById = useCallback(
    (id) => allRecipes.find((r) => r.id === id) || null,
    [allRecipes]
  );

  const getAllRecipes = useCallback(() => {
    switch (recipeFilter) {
      case "default":
        return recipes;
      case "personal":
        return userRecipes;
      case "saved":
        return savedRecipes;
      default:
        return allRecipes;
    }
  }, [recipeFilter, recipes, userRecipes, savedRecipes, allRecipes]);

  /** Belirli bir yemeğe ait tarifler. */
  const getRecipesForMeal = useCallback(
    (mealId) => {
      if (!mealId) return [];
      return allRecipes.filter((r) => r.mealId === mealId);
    },
    [allRecipes]
  );

  const filteredRecipes = useMemo(
    () =>
      getAllRecipes().filter(
        (recipe) =>
          recipeMatches(recipe, searchTerm) &&
          (difficultyFilter === "all" ||
            recipe.difficulty === difficultyFilter) &&
          (!selectedMealId || recipe.mealId === selectedMealId)
      ),
    [getAllRecipes, searchTerm, difficultyFilter, selectedMealId]
  );

  const value = {
    user,
    recipes,
    userRecipes,
    savedRecipes,
    defaultMeals,
    allRecipes,
    cookbookRecipes,
    filteredRecipes,
    searchTerm,
    setSearchTerm,
    difficultyFilter,
    setDifficultyFilter,
    recipeFilter,
    setRecipeFilter,
    selectedMealId,
    setSelectedMealId,
    loading,
    error,
    addPersonalRecipe,
    updatePersonalRecipe,
    deletePersonalRecipe,
    loadUserRecipes,
    loadSavedRecipes,
    saveRecipe,
    unsaveRecipe,
    isRecipeSaved,
    getRecipeById,
    getRecipesForMeal,
    getAllRecipes,
    addDefaultRecipes,
    addRecipeToFirestoreDb,
    refreshData,
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
