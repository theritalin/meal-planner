const recipes = [
  {
    id: "recipe1",
    mealId: "breakfast1",
    name: "Yulaf Ezmesi",
    ingredients: [
      { name: "Yulaf", amount: 1, unit: "su bardağı" },
      { name: "Süt", amount: 1, unit: "su bardağı" },
      { name: "Karışık Meyveler", amount: 0.5, unit: "su bardağı" },
      { name: "Bal", amount: 1, unit: "yemek kaşığı" },
    ],
    instructions: [
      "Süt ve yulafı tencereye koyun",
      "Orta ateşte 5 dakika pişirin",
      "Meyveleri ve balı ekleyin",
    ],
    prepTime: 5,
    cookTime: 5,
    difficulty: "easy",
    servings: 1,
  },
  {
    id: "recipe2",
    mealId: "breakfast2",
    name: "Avokado Toast",
    ingredients: [
      { name: "Tam Tahıllı Ekmek", amount: 2, unit: "dilim" },
      { name: "Avokado", amount: 1, unit: "adet" },
      { name: "Limon Suyu", amount: 1, unit: "tatlı kaşığı" },
      { name: "Tuz", amount: 1, unit: "çimdik" },
      { name: "Karabiber", amount: 1, unit: "çimdik" },
    ],
    instructions: [
      "Ekmeği kızartın",
      "Avokadoyu ezin ve limon suyu, tuz ve karabiber ekleyin",
      "Karışımı kızarmış ekmeğin üzerine yayın",
    ],
    prepTime: 5,
    cookTime: 2,
    difficulty: "easy",
    servings: 2,
  },
  {
    id: "recipe3",
    mealId: "lunch1",
    name: "Tavuklu Sezar Salata",
    ingredients: [
      { name: "Tavuk Göğsü", amount: 200, unit: "gram" },
      { name: "Marul", amount: 1, unit: "baş" },
      { name: "Parmesan Peyniri", amount: 30, unit: "gram" },
      { name: "Kruton", amount: 50, unit: "gram" },
      { name: "Sezar Sosu", amount: 3, unit: "yemek kaşığı" },
    ],
    instructions: [
      "Tavuğu ızgarada pişirin ve dilimleyin",
      "Marulu yıkayın ve doğrayın",
      "Tüm malzemeleri karıştırın ve sosu ekleyin",
    ],
    prepTime: 10,
    cookTime: 15,
    difficulty: "medium",
    servings: 2,
  },
  {
    id: "recipe4",
    mealId: "dinner1",
    name: "Izgara Somon",
    ingredients: [
      { name: "Somon Fileto", amount: 300, unit: "gram" },
      { name: "Kuşkonmaz", amount: 200, unit: "gram" },
      { name: "Zeytinyağı", amount: 2, unit: "yemek kaşığı" },
      { name: "Limon", amount: 1, unit: "adet" },
      { name: "Tuz", amount: 1, unit: "çay kaşığı" },
      { name: "Karabiber", amount: 0.5, unit: "çay kaşığı" },
    ],
    instructions: [
      "Somonu tuz ve karabiber ile tatlandırın",
      "Kuşkonmazları temizleyin",
      "Somonu ve kuşkonmazları ızgarada pişirin",
      "Üzerine limon sıkın ve zeytinyağı gezdirin",
    ],
    prepTime: 10,
    cookTime: 15,
    difficulty: "medium",
    servings: 2,
  },
  {
    id: "recipe5",
    mealId: "dinner3",
    name: "Köfte",
    ingredients: [
      { name: "Kıyma", amount: 500, unit: "gram" },
      { name: "Soğan", amount: 1, unit: "adet" },
      { name: "Sarımsak", amount: 2, unit: "diş" },
      { name: "Maydanoz", amount: 0.5, unit: "demet" },
      { name: "Kimyon", amount: 1, unit: "çay kaşığı" },
      { name: "Pul Biber", amount: 1, unit: "çay kaşığı" },
      { name: "Tuz", amount: 1, unit: "çay kaşığı" },
      { name: "Karabiber", amount: 0.5, unit: "çay kaşığı" },
    ],
    instructions: [
      "Soğan ve sarımsağı ince doğrayın",
      "Tüm malzemeleri bir kapta karıştırın",
      "Köfte şekli verin",
      "Izgarada veya tavada pişirin",
    ],
    prepTime: 20,
    cookTime: 15,
    difficulty: "medium",
    servings: 4,
  },
];

export default recipes;
