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

export { db, auth };
