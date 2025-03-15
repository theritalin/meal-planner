import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";

// Firebase yapılandırması - .env dosyasından alınıyor
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Yapılandırma kontrolü
if (!firebaseConfig.apiKey) {
  console.error(
    "Firebase yapılandırma bilgileri eksik. .env dosyasını kontrol edin."
  );
}

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Oturum durumu değişikliklerini dinle
export const listenToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Kullanıcı giriş yapmış
      console.log("Kullanıcı oturumu aktif:", user.email);
      checkAndAddUser(user).then(() => {
        callback(user);
      });
    } else {
      // Kullanıcı çıkış yapmış
      console.log("Kullanıcı oturumu kapalı");
      callback(null);
    }
  });
};

// Yemekleri Firestore'a ekleyen fonksiyon
export const addDefaultMealsToFirestore = async (meals) => {
  try {
    const mealsCollectionRef = collection(db, "default_meals");

    // Her yemek için bir belge oluştur
    for (const meal of meals) {
      await setDoc(doc(mealsCollectionRef, meal.id), meal);
    }

    console.log("Varsayılan yemekler Firestore'a eklendi");
    return true;
  } catch (error) {
    console.error("Yemekleri eklerken hata oluştu:", error);
    return false;
  }
};

// Firestore'dan yemekleri getiren fonksiyon
export const getMealsFromFirestore = async (
  collectionName = "default_meals"
) => {
  try {
    const mealsCollectionRef = collection(db, collectionName);
    const mealsSnapshot = await getDocs(mealsCollectionRef);
    const mealsList = mealsSnapshot.docs.map((doc) => doc.data());
    return mealsList;
  } catch (error) {
    console.error("Yemekleri getirirken hata oluştu:", error);
    return [];
  }
};

// Kullanıcı yemek planını Firestore'a kaydeden fonksiyon
export const saveMealPlanToFirestore = async (userId, mealPlan) => {
  try {
    if (!userId) {
      throw new Error("Kullanıcı kimliği gerekli");
    }

    // Kullanıcı belgesinin altına mealPlan alanı olarak kaydet
    await setDoc(
      doc(db, "users", userId),
      {
        mealPlan: mealPlan,
        updatedAt: new Date(),
      },
      { merge: true }
    ); // merge: true ile mevcut belgeyi koruyup sadece belirtilen alanları güncelle

    console.log("Yemek planı başarıyla kaydedildi");
    return true;
  } catch (error) {
    console.error("Yemek planını kaydederken hata oluştu:", error);
    return false;
  }
};

// Kullanıcı yemek planını Firestore'dan getiren fonksiyon
export const getMealPlanFromFirestore = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Kullanıcı kimliği gerekli");
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().mealPlan) {
      return userSnap.data().mealPlan;
    } else {
      console.log("Kullanıcı için yemek planı bulunamadı");
      return null;
    }
  } catch (error) {
    console.error("Yemek planını getirirken hata oluştu:", error);
    return null;
  }
};

// Google ile giriş yapma fonksiyonu
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google ile giriş yaparken hata oluştu:", error);
    throw error;
  }
};

// Mevcut kullanıcıyı getir
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Kullanıcı kontrolü ve ekleme fonksiyonu
export const checkAndAddUser = async (user) => {
  if (!user) return;

  try {
    // Kullanıcı belgesini kontrol et
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // Kullanıcı yoksa ekle
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: new Date(),
        isAdmin: user.email === process.env.REACT_APP_ADMIN_EMAIL, // Admin kontrolü
      });
      console.log("Yeni kullanıcı eklendi:", user.email);
    } else {
      console.log("Kullanıcı zaten var:", user.email);
    }

    return true;
  } catch (error) {
    console.error("Kullanıcı kontrolü sırasında hata:", error);
    return false;
  }
};

// Kullanıcının admin olup olmadığını kontrol eden fonksiyon
export const isUserAdmin = async (userId) => {
  try {
    if (!userId) return false;

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().isAdmin) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Admin kontrolü sırasında hata:", error);
    return false;
  }
};

// Kullanıcının kişisel yemeklerini getiren fonksiyon
export const getUserMeals = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Kullanıcı kimliği gerekli");
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().personalMeals) {
      return userSnap.data().personalMeals;
    } else {
      console.log("Kullanıcı için kişisel yemek bulunamadı");
      return [];
    }
  } catch (error) {
    console.error("Kişisel yemekleri getirirken hata oluştu:", error);
    return [];
  }
};

// Kullanıcının kişisel yemeğini ekleyen fonksiyon
export const addUserMeal = async (userId, meal) => {
  try {
    if (!userId) {
      throw new Error("Kullanıcı kimliği gerekli");
    }

    if (!meal || !meal.name || !meal.type) {
      throw new Error("Geçerli bir yemek nesnesi gerekli");
    }

    // Yemek ID'si oluştur
    const mealId = `user_meal_${Date.now()}_${Math.floor(
      Math.random() * 1000
    )}`;
    const newMeal = {
      ...meal,
      id: mealId,
      isPersonal: true,
      createdAt: new Date(),
    };

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    let personalMeals = [];
    if (userSnap.exists() && userSnap.data().personalMeals) {
      personalMeals = [...userSnap.data().personalMeals];
    }

    personalMeals.push(newMeal);

    await setDoc(
      userRef,
      {
        personalMeals,
      },
      { merge: true }
    );

    console.log("Kişisel yemek başarıyla eklendi");
    return newMeal;
  } catch (error) {
    console.error("Kişisel yemek eklerken hata oluştu:", error);
    throw error;
  }
};

// Kullanıcının kişisel yemeğini silen fonksiyon
export const deleteUserMeal = async (userId, mealId) => {
  try {
    if (!userId || !mealId) {
      throw new Error("Kullanıcı kimliği ve yemek kimliği gerekli");
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().personalMeals) {
      throw new Error("Kullanıcı veya kişisel yemekler bulunamadı");
    }

    const personalMeals = userSnap
      .data()
      .personalMeals.filter((meal) => meal.id !== mealId);

    await setDoc(
      userRef,
      {
        personalMeals,
      },
      { merge: true }
    );

    console.log("Kişisel yemek başarıyla silindi");
    return true;
  } catch (error) {
    console.error("Kişisel yemek silerken hata oluştu:", error);
    return false;
  }
};

// Tarifleri Firestore'dan getiren fonksiyon
export const getRecipesFromFirestore = async () => {
  try {
    const recipesCollectionRef = collection(db, "recipes");
    const recipesSnapshot = await getDocs(recipesCollectionRef);
    const recipesList = recipesSnapshot.docs.map((doc) => doc.data());
    return recipesList;
  } catch (error) {
    console.error("Tarifleri getirirken hata oluştu:", error);
    return [];
  }
};

// Tarifi default_meals içindeki bir yemeğe ekleyen fonksiyon
export const addRecipeToDefaultMeal = async (mealId, recipe) => {
  try {
    if (!mealId || !recipe) {
      throw new Error("Yemek ID ve tarif gerekli");
    }

    // Tarif ID'si oluştur (eğer yoksa)
    const recipeId =
      recipe.id || `recipe_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newRecipe = {
      ...recipe,
      id: recipeId,
      createdAt: new Date(),
    };

    // Yemeği Firestore'dan getir
    const mealRef = doc(db, "default_meals", mealId);
    const mealSnap = await getDoc(mealRef);

    if (!mealSnap.exists()) {
      throw new Error("Belirtilen yemek bulunamadı");
    }

    const mealData = mealSnap.data();

    // Yemeğin recipes dizisini kontrol et ve oluştur (yoksa)
    const recipes = mealData.recipes || [];

    // Yeni tarifi ekle
    recipes.push(newRecipe);

    // Yemeği güncelle
    await setDoc(mealRef, { ...mealData, recipes }, { merge: true });

    console.log("Tarif başarıyla yemeğe eklendi");
    return newRecipe;
  } catch (error) {
    console.error("Tarif eklerken hata oluştu:", error);
    throw error;
  }
};

// Tarifi default_meals içinden silen fonksiyon
export const deleteRecipeFromDefaultMeal = async (mealId, recipeId) => {
  try {
    if (!mealId || !recipeId) {
      throw new Error("Yemek ID ve tarif ID gerekli");
    }

    // Yemeği Firestore'dan getir
    const mealRef = doc(db, "default_meals", mealId);
    const mealSnap = await getDoc(mealRef);

    if (!mealSnap.exists()) {
      throw new Error("Belirtilen yemek bulunamadı");
    }

    const mealData = mealSnap.data();

    // Yemeğin recipes dizisini kontrol et
    if (!mealData.recipes || !Array.isArray(mealData.recipes)) {
      return false; // Tarif yok, silme işlemi başarısız
    }

    // Tarifi filtrele
    const updatedRecipes = mealData.recipes.filter(
      (recipe) => recipe.id !== recipeId
    );

    // Eğer tarif bulunamadıysa
    if (updatedRecipes.length === mealData.recipes.length) {
      return false; // Tarif bulunamadı, silme işlemi başarısız
    }

    // Yemeği güncelle
    await setDoc(
      mealRef,
      { ...mealData, recipes: updatedRecipes },
      { merge: true }
    );

    console.log("Tarif başarıyla yemekten silindi");
    return true;
  } catch (error) {
    console.error("Tarif silerken hata oluştu:", error);
    return false;
  }
};

// Kullanıcının kişisel tariflerini getiren fonksiyon
export const getUserRecipes = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Kullanıcı kimliği gerekli");
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists() && userSnap.data().personalRecipes) {
      return userSnap.data().personalRecipes;
    } else {
      console.log("Kullanıcı için kişisel tarif bulunamadı");
      return [];
    }
  } catch (error) {
    console.error("Kişisel tarifleri getirirken hata oluştu:", error);
    return [];
  }
};

// Kullanıcının kişisel tarifini ekleyen fonksiyon
export const addUserRecipe = async (userId, recipe) => {
  try {
    if (!userId) {
      throw new Error("Kullanıcı kimliği gerekli");
    }

    if (!recipe || !recipe.name) {
      throw new Error("Geçerli bir tarif nesnesi gerekli");
    }

    // Tarif ID'si oluştur - daha güvenilir bir yöntem
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const recipeId = `user_recipe_${timestamp}_${randomStr}_${userId.substring(
      0,
      5
    )}`;

    const newRecipe = {
      ...recipe,
      id: recipeId,
      isPersonal: true,
      createdAt: new Date(),
    };

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    let personalRecipes = [];
    if (userSnap.exists() && userSnap.data().personalRecipes) {
      personalRecipes = [...userSnap.data().personalRecipes];
    }

    personalRecipes.push(newRecipe);

    await setDoc(
      userRef,
      {
        personalRecipes,
      },
      { merge: true }
    );

    console.log("Kişisel tarif başarıyla eklendi");
    return newRecipe;
  } catch (error) {
    console.error("Kişisel tarif eklerken hata oluştu:", error);
    throw error;
  }
};

// Kullanıcının kişisel tarifini silen fonksiyon
export const deleteUserRecipe = async (userId, recipeId) => {
  try {
    if (!userId || !recipeId) {
      throw new Error("Kullanıcı kimliği ve tarif kimliği gerekli");
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || !userSnap.data().personalRecipes) {
      throw new Error("Kullanıcı veya kişisel tarifler bulunamadı");
    }

    const personalRecipes = userSnap
      .data()
      .personalRecipes.filter((recipe) => recipe.id !== recipeId);

    await setDoc(
      userRef,
      {
        personalRecipes,
      },
      { merge: true }
    );

    console.log("Kişisel tarif başarıyla silindi");
    return true;
  } catch (error) {
    console.error("Kişisel tarif silerken hata oluştu:", error);
    return false;
  }
};

// Varsayılan tarifleri Firestore'a ekleyen fonksiyon
export const addDefaultRecipesToFirestore = async (recipes) => {
  try {
    // Her tarif için bir belge oluştur
    for (const recipe of recipes) {
      await setDoc(doc(db, "recipes", recipe.id), recipe);
    }

    console.log("Varsayılan tarifler Firestore'a eklendi");
    return true;
  } catch (error) {
    console.error("Tarifleri eklerken hata oluştu:", error);
    return false;
  }
};

export { db, auth };
