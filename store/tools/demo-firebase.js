// DEMO: Mağaza ekran görüntüleri için sahte Firebase katmanı (repoya girmez).
const R = (id, mealId, name, o) => ({ id, mealId, name, isPersonal: true, ...o });

const recipes = {
  menemen: R("r-menemen", "m-menemen", "Menemen", {
    description: "Bol domatesli, biberli klasik kahvaltı menemeni.",
    prepTime: 10, cookTime: 15, servings: 2, difficulty: "easy",
    ingredients: [
      { amount: "3", unit: "adet", name: "yumurta" },
      { amount: "2", unit: "adet", name: "domates" },
      { amount: "2", unit: "adet", name: "sivri biber" },
      { amount: "1", unit: "yemek kaşığı", name: "tereyağı" },
      { amount: "1", unit: "tutam", name: "tuz" },
      { amount: "1", unit: "çay kaşığı", name: "pul biber" },
    ],
    instructions: [
      "Biberleri doğrayıp tereyağında 3-4 dakika soteleyin.",
      "Rendelenmiş domatesi ekleyip suyunu çekene kadar pişirin.",
      "Yumurtaları kırın, hafifçe karıştırarak kıvam alana kadar pişirin.",
      "Tuz ve pul biberle tatlandırıp sıcak servis edin.",
    ],
  }),
  mercimek: R("r-mercimek", "m-mercimek", "Mercimek Çorbası", {
    description: "Limon ve pul biberle servis edilen kadife kıvamında klasik çorba.",
    prepTime: 10, cookTime: 30, servings: 4, difficulty: "easy",
    ingredients: [
      { amount: "1", unit: "su bardağı", name: "kırmızı mercimek" },
      { amount: "1", unit: "adet", name: "kuru soğan" },
      { amount: "1", unit: "adet", name: "havuç" },
      { amount: "1", unit: "adet", name: "patates" },
      { amount: "2", unit: "yemek kaşığı", name: "tereyağı" },
      { amount: "1", unit: "yemek kaşığı", name: "un" },
      { amount: "6", unit: "su bardağı", name: "sıcak su" },
      { amount: "", unit: "", name: "tuz, karabiber, kimyon" },
    ],
    instructions: [
      "Mercimeği suyu berraklaşana kadar yıkayın.",
      "Tereyağında doğranmış soğanı pembeleşene kadar kavurun.",
      "Unu ekleyip kokusu çıkana kadar bir dakika daha kavurun.",
      "Havuç, patates ve mercimeği ekleyin; sıcak suyu ilave edip kaynatın.",
      "Kısık ateşte sebzeler yumuşayana kadar yaklaşık 25 dakika pişirin.",
      "Blenderdan geçirip baharatlarla tatlandırın, limonla servis edin.",
    ],
    notes: "Kıvamı koyu gelirse biraz sıcak su ekleyebilirsiniz.",
  }),
  karniyarik: R("r-karniyarik", "m-karniyarik", "Karnıyarık", {
    description: "Kıymalı harçla doldurulmuş, fırında pişen közlenmiş patlıcanlar.",
    prepTime: 20, cookTime: 40, servings: 4, difficulty: "medium",
    ingredients: [
      { amount: "6", unit: "adet", name: "kemer patlıcan" },
      { amount: "250", unit: "gr", name: "dana kıyma" },
      { amount: "1", unit: "adet", name: "kuru soğan" },
      { amount: "2", unit: "adet", name: "domates" },
      { amount: "2", unit: "adet", name: "sivri biber" },
      { amount: "1", unit: "yemek kaşığı", name: "domates salçası" },
      { amount: "3", unit: "diş", name: "sarımsak" },
    ],
    instructions: [
      "Patlıcanları alacalı soyup tuzlu suda 15 dakika bekletin, kurulayıp kızartın.",
      "Soğan ve sarımsağı kavurun, kıymayı ekleyip suyunu çekene kadar pişirin.",
      "Doğranmış domates, biber ve salçayı ekleyip 5 dakika daha pişirin.",
      "Patlıcanları ortadan yarıp harcı doldurun, üzerine domates ve biber dizin.",
      "Salçalı sıcak su gezdirip 180°C fırında 25-30 dakika pişirin.",
    ],
  }),
  tavuk: R("r-tavuk", "m-tavuk", "Fırında Sebzeli Tavuk", {
    description: "Tek tepside, patates ve sebzelerle fırında tavuk baget.",
    prepTime: 15, cookTime: 45, servings: 4, difficulty: "easy",
    ingredients: [
      { amount: "8", unit: "adet", name: "tavuk baget" },
      { amount: "4", unit: "adet", name: "patates" },
      { amount: "2", unit: "adet", name: "havuç" },
      { amount: "1", unit: "adet", name: "kırmızı biber" },
      { amount: "3", unit: "yemek kaşığı", name: "zeytinyağı" },
      { amount: "1", unit: "yemek kaşığı", name: "biber salçası" },
    ],
    instructions: [
      "Zeytinyağı, salça ve baharatlarla sos hazırlayın.",
      "Tavuk ve doğranmış sebzeleri sosla harmanlayın.",
      "Fırın tepsisine yayıp 200°C fırında 45 dakika pişirin.",
    ],
  }),
  fasulye: R("r-fasulye", "m-fasulye", "Zeytinyağlı Taze Fasulye", {
    description: "Soğuk servis edilen hafif bir zeytinyağlı.",
    prepTime: 15, cookTime: 40, servings: 4, difficulty: "easy",
    ingredients: [
      { amount: "500", unit: "gr", name: "taze fasulye" },
      { amount: "2", unit: "adet", name: "domates" },
      { amount: "1", unit: "adet", name: "kuru soğan" },
      { amount: "1/2", unit: "su bardağı", name: "zeytinyağı" },
    ],
    instructions: [
      "Fasulyeleri ayıklayıp ikiye bölün.",
      "Soğanı zeytinyağında kavurun, fasulye ve domatesi ekleyin.",
      "Kısık ateşte kendi suyuyla 40 dakika pişirin, soğuk servis edin.",
    ],
  }),
  yulaf: R("r-yulaf", "m-yulaf", "Muzlu Yulaf Lapası", {
    description: "Tarçın ve cevizle 10 dakikada sağlıklı kahvaltı.",
    prepTime: 2, cookTime: 8, servings: 1, difficulty: "easy",
    ingredients: [
      { amount: "1/2", unit: "su bardağı", name: "yulaf" },
      { amount: "1", unit: "su bardağı", name: "süt" },
      { amount: "1", unit: "adet", name: "muz" },
      { amount: "1", unit: "tatlı kaşığı", name: "bal" },
    ],
    instructions: ["Yulaf ve sütü kaynatın.", "Muz, bal ve tarçınla servis edin."],
  }),
};

const meal = (id, name, type, calories, prepTime, description, recipe) => ({
  id, name, type, calories, prepTime, description, recipes: recipe ? [recipe] : [],
});

const meals = [
  meal("m-menemen", "Menemen", "breakfast", 320, 25, "Domatesli biberli", recipes.menemen),
  meal("m-yulaf", "Muzlu Yulaf Lapası", "breakfast", 280, 10, "Hızlı ve sağlıklı", recipes.yulaf),
  meal("m-simit", "Simit & Peynir Tabağı", "breakfast", 450, 5, "Klasik kahvaltı"),
  meal("m-pisi", "Pişi", "breakfast", 380, 30, "Hafta sonu kahvaltısı"),
  meal("m-mercimek", "Mercimek Çorbası", "lunch", 250, 40, "Klasik çorba", recipes.mercimek),
  meal("m-fasulye", "Zeytinyağlı Taze Fasulye", "lunch", 210, 55, "Zeytinyağlı", recipes.fasulye),
  meal("m-mantı", "Mantı", "lunch", 520, 60, "Yoğurtlu, tereyağlı"),
  meal("m-tarhana", "Tarhana Çorbası", "lunch", 230, 20, "Geleneksel çorba"),
  meal("m-karniyarik", "Karnıyarık", "dinner", 480, 60, "Kıymalı patlıcan", recipes.karniyarik),
  meal("m-tavuk", "Fırında Sebzeli Tavuk", "dinner", 540, 60, "Tek tepside", recipes.tavuk),
  meal("m-nohut", "Etli Nohut", "dinner", 450, 70, "Pilavla servis"),
  meal("m-kofte", "Izgara Köfte", "dinner", 520, 35, "Közlenmiş biberle"),
  meal("m-imam", "İmam Bayıldı", "dinner", 360, 50, "Zeytinyağlı patlıcan"),
];
const byId = Object.fromEntries(meals.map((m) => [m.id, m]));
const pick = (...ids) => ids.map((id) => byId[id]);

const plan = {
  monday: { breakfast: pick("m-menemen"), lunch: pick("m-mercimek"), dinner: pick("m-karniyarik") },
  tuesday: { breakfast: pick("m-yulaf"), lunch: pick("m-fasulye"), dinner: pick("m-tavuk") },
  wednesday: { breakfast: pick("m-simit"), lunch: pick("m-tarhana"), dinner: pick("m-nohut") },
  thursday: { breakfast: pick("m-menemen"), lunch: pick("m-mantı"), dinner: pick("m-kofte") },
  friday: { breakfast: pick("m-yulaf"), lunch: pick("m-mercimek"), dinner: pick("m-imam") },
  saturday: { breakfast: pick("m-pisi"), lunch: pick("m-fasulye"), dinner: pick("m-karniyarik") },
  sunday: { breakfast: pick("m-simit", "m-menemen"), lunch: [], dinner: pick("m-tavuk") },
};

const user = {
  uid: "demo-user",
  displayName: "Ayşe Yılmaz",
  email: "ayse@example.com",
  photoURL: "",
  getIdToken: async () => "x",
};
const profile = {
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  about: "Ev yemekleri ve zeytinyağlılar 🌿",
  personalRecipes: Object.values(recipes),
  savedRecipes: [],
  followers: ["u2", "u3", "u4", "u5"],
  following: ["u2", "u3"],
  personalMeals: [],
  mealPlan: plan,
};

const ok = async (v) => v;
export const listenToAuthChanges = (cb) => {
  setTimeout(() => cb(user), 0);
  return () => {};
};
export const addDefaultMealsToFirestore = ok;
export const getMealsFromFirestore = async () => meals;
export const saveMealPlanToFirestore = async () => true;
export const getMealPlanFromFirestore = async () => plan;
export const signInWithGoogle = async () => user;
export const signOutUser = async () => {};
export const getCurrentUser = () => user;
export const checkAndAddUser = async () => true;
export const isUserAdmin = async () => false;
export const getUserMeals = async () => [];
export const addUserMeal = async (u, m) => ({ ...m, id: "x" + Date.now(), isPersonal: true });
export const deleteUserMeal = async () => true;
export const getRecipesFromFirestore = async () => [];
export const addRecipeToDefaultMeal = async (id, r) => r;
export const deleteRecipeFromDefaultMeal = async () => true;
export const getUserRecipes = async () => profile.personalRecipes;
export const addUserRecipe = async (u, r) => ({ ...r, id: "x" + Date.now() });
export const deleteUserRecipe = async () => true;
export const updateUserRecipe = async (u, id, up) => ({ ...up, id });
export const addDefaultRecipesToFirestore = async () => true;
export const getUserProfile = async (uid) =>
  uid === user.uid ? profile : { uid, displayName: "Mehmet K.", personalRecipes: [] };
export const updateUserProfile = async () => true;
export const saveRecipeForUser = async (u, r) => [r];
export const unsaveRecipeForUser = async () => [];
export const getUserFollowing = async () => [];
export const getUserFollowers = async () => [];
export const searchUsers = async () => [];
export const db = {};
export const auth = { currentUser: user, signOut: async () => {} };
