import React, { useState } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";

// Türkçe karakterleri ASCII karakterlere dönüştüren yardımcı fonksiyon
const turkishToAscii = (text) => {
  if (!text) return "Isimsiz yemek";

  return text
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "S")
    .replace(/Ç/g, "C")
    .replace(/İ/g, "I")
    .replace(/Ğ/g, "G")
    .replace(/Ö/g, "O")
    .replace(/Ü/g, "U");
};

// Basit font tanımlaması - Helvetica kullanımı
Font.registerHyphenationCallback((word) => [word]);

// Basitleştirilmiş stiller
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#bfbfbf",
  },
  tableColHeader: {
    width: "16%",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  tableCol: {
    width: "16%",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 8,
    textAlign: "center",
  },
  mealCell: {
    width: "28%",
    borderRightWidth: 1,
    borderRightColor: "#bfbfbf",
    padding: 5,
  },
  mealName: {
    fontSize: 8,
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
  footer: {
    fontSize: 8,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
  shoppingListTitle: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    padding: 5,
    borderRadius: 3,
  },
  shoppingListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  shoppingListSection: {
    width: "48%",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 3,
    padding: 5,
  },
  shoppingListDay: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#f5f5f5",
    padding: 3,
    textAlign: "center",
  },
  mealTypeHeader: {
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 3,
    color: "#555",
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    paddingBottom: 2,
  },
  shoppingListItem: {
    fontSize: 8,
    marginBottom: 2,
    marginLeft: 10,
  },
  mealHeader: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 3,
    marginBottom: 2,
    marginLeft: 5,
    color: "#333",
  },
  noIngredientsText: {
    fontSize: 8,
    color: "#999",
    marginLeft: 10,
    fontStyle: "italic",
  },
  ingredientItem: {
    fontSize: 7,
    marginBottom: 1,
    marginLeft: 15,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#eaeaea",
    marginVertical: 3,
  },
});

// Basitleştirilmiş PDF bileşeni
const MealPlanDocument = ({ weekPlan }) => {
  try {
    // Gün adları - ASCII karakterleri kullanma
    const dayNames = {
      monday: "Pazartesi",
      tuesday: "Sali",
      wednesday: "Carsamba",
      thursday: "Persembe",
      friday: "Cuma",
      saturday: "Cumartesi",
      sunday: "Pazar",
    };

    // Yemek türleri - ASCII karakterleri kullanma
    const mealTypes = {
      breakfast: "Kahvalti",
      lunch: "Ogle Yemegi",
      dinner: "Aksam Yemegi",
    };

    // Öğün sıralaması
    const mealOrder = ["breakfast", "lunch", "dinner"];

    // Gün sırası
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Alışveriş listesi oluşturma fonksiyonu
    const generateShoppingList = () => {
      const shoppingList = {};

      // Her gün için
      days.forEach((day) => {
        if (!weekPlan[day]) return;

        shoppingList[day] = {};

        // Her öğün için (kahvaltı, öğle, akşam)
        Object.keys(weekPlan[day]).forEach((mealTime) => {
          const meals = weekPlan[day][mealTime];

          if (!Array.isArray(meals) || meals.length === 0) return;

          // Her yemek için
          meals.forEach((meal) => {
            // Yemek adını alışveriş listesine ekle
            if (!shoppingList[day][mealTime]) {
              shoppingList[day][mealTime] = [];
            }

            // Yemek adını ve malzemeleri ekle
            if (meal.recipe && meal.recipe.ingredients) {
              // Tarif bilgisi varsa malzemeleri ekle
              shoppingList[day][mealTime].push({
                mealName: meal.name,
                ingredients: meal.recipe.ingredients,
              });
            } else {
              // Tarif bilgisi yoksa sadece yemek adını ekle
              shoppingList[day][mealTime].push({
                mealName: meal.name,
                ingredients: [],
              });
            }
          });
        });
      });

      return shoppingList;
    };

    // Alışveriş listesini oluştur
    const shoppingList = generateShoppingList();

    // Alışveriş listesi için günleri iki sütuna böl
    const leftColumnDays = days.filter((_, index) => index % 2 === 0);
    const rightColumnDays = days.filter((_, index) => index % 2 === 1);

    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text style={styles.title}>Haftalik Yemek Plani</Text>

          <View style={styles.table}>
            {/* Tablo başlığı */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableCellHeader}>Gun</Text>
              </View>
              <View style={styles.mealCell}>
                <Text style={styles.tableCellHeader}>
                  {mealTypes.breakfast}
                </Text>
              </View>
              <View style={styles.mealCell}>
                <Text style={styles.tableCellHeader}>{mealTypes.lunch}</Text>
              </View>
              <View style={styles.mealCell}>
                <Text style={styles.tableCellHeader}>{mealTypes.dinner}</Text>
              </View>
            </View>

            {/* Günler */}
            {days.map((day) => {
              // Güvenlik kontrolü
              const dayData =
                weekPlan && weekPlan[day]
                  ? weekPlan[day]
                  : { breakfast: [], lunch: [], dinner: [] };

              return (
                <View style={styles.tableRow} key={day}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCell}>{dayNames[day]}</Text>
                  </View>

                  {/* Kahvaltı */}
                  <View style={styles.mealCell}>
                    {Array.isArray(dayData.breakfast) &&
                    dayData.breakfast.length > 0 ? (
                      dayData.breakfast.map((meal, i) => (
                        <Text key={i} style={styles.mealName}>
                          {turkishToAscii(meal.name)}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>-</Text>
                    )}
                  </View>

                  {/* Öğle */}
                  <View style={styles.mealCell}>
                    {Array.isArray(dayData.lunch) &&
                    dayData.lunch.length > 0 ? (
                      dayData.lunch.map((meal, i) => (
                        <Text key={i} style={styles.mealName}>
                          {turkishToAscii(meal.name)}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>-</Text>
                    )}
                  </View>

                  {/* Akşam */}
                  <View style={styles.mealCell}>
                    {Array.isArray(dayData.dinner) &&
                    dayData.dinner.length > 0 ? (
                      dayData.dinner.map((meal, i) => (
                        <Text key={i} style={styles.mealName}>
                          {turkishToAscii(meal.name)}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.emptyText}>-</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Alışveriş Listesi */}
          <Text style={styles.shoppingListTitle}>Alisveris Listesi</Text>

          <View style={styles.shoppingListContainer}>
            {days.map((day) => {
              if (
                !shoppingList[day] ||
                Object.keys(shoppingList[day]).length === 0
              ) {
                return null;
              }

              return (
                <View
                  style={styles.shoppingListSection}
                  key={`shopping-${day}`}
                >
                  <Text style={styles.shoppingListDay}>{dayNames[day]}</Text>

                  {mealOrder.map((mealTime) => {
                    if (
                      !shoppingList[day][mealTime] ||
                      shoppingList[day][mealTime].length === 0
                    ) {
                      return null;
                    }

                    return (
                      <View key={`${day}-${mealTime}`}>
                        <Text style={styles.mealTypeHeader}>
                          {mealTypes[mealTime]}
                        </Text>

                        {shoppingList[day][mealTime].map((item, index) => (
                          <View key={`${day}-${mealTime}-${index}`}>
                            <Text style={styles.mealHeader}>
                              • {turkishToAscii(item.mealName)}
                            </Text>

                            {item.ingredients && item.ingredients.length > 0 ? (
                              item.ingredients.map((ingredient, i) => {
                                let ingredientText = "";

                                if (typeof ingredient === "string") {
                                  ingredientText = ingredient;
                                } else if (ingredient && ingredient.name) {
                                  ingredientText = `${ingredient.name}${
                                    ingredient.amount
                                      ? ` (${ingredient.amount}`
                                      : ""
                                  }${
                                    ingredient.unit
                                      ? ` ${ingredient.unit})`
                                      : ingredient.amount
                                      ? ")"
                                      : ""
                                  }`;
                                }

                                return ingredientText ? (
                                  <Text
                                    style={styles.ingredientItem}
                                    key={`ingredient-${i}`}
                                  >
                                    - {turkishToAscii(ingredientText)}
                                  </Text>
                                ) : null;
                              })
                            ) : (
                              <Text style={styles.noIngredientsText}>
                                Malzeme bilgisi bulunamadi
                              </Text>
                            )}

                            {index < shoppingList[day][mealTime].length - 1 && (
                              <View style={styles.divider} />
                            )}
                          </View>
                        ))}
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Olusturulma tarihi: {new Date().toLocaleDateString()}
          </Text>
        </Page>
      </Document>
    );
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>PDF olusturulurken bir hata olustu</Text>
        </Page>
      </Document>
    );
  }
};

// Export button component
const PlanExport = () => {
  const { weekPlan } = useMeals();
  const { getAllRecipes } = useRecipes();
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Yemek planına tarif bilgilerini ekle
  const enrichWeekPlanWithRecipes = () => {
    if (!weekPlan) return {};

    const allRecipes = getAllRecipes();
    const enrichedPlan = { ...weekPlan };

    // Her gün için
    Object.keys(enrichedPlan).forEach((day) => {
      // Her öğün için
      Object.keys(enrichedPlan[day]).forEach((mealTime) => {
        const meals = enrichedPlan[day][mealTime];

        if (Array.isArray(meals)) {
          // Her yemek için
          enrichedPlan[day][mealTime] = meals.map((meal) => {
            // Yemeğin tarifini bul
            const recipe = allRecipes.find(
              (r) =>
                r.name &&
                meal.name &&
                r.name.toLowerCase() === meal.name.toLowerCase()
            );

            // Tarif bilgisini ekle
            return {
              ...meal,
              recipe: recipe || null,
            };
          });
        }
      });
    });

    return enrichedPlan;
  };

  const handleClick = () => {
    try {
      setIsGenerating(true);
      console.log("PDF oluşturma başlatılıyor...");

      // weekPlan'ı kontrol et
      if (!weekPlan) {
        console.warn("weekPlan tanımlı değil, boş bir plan kullanılacak");
      } else {
        console.log("weekPlan yapısı:", Object.keys(weekPlan));
      }

      // Hata durumunda 3 saniye sonra durumu sıfırla
      setTimeout(() => {
        setIsGenerating(false);
      }, 3000);
    } catch (err) {
      console.error("PDF oluşturma hatası:", err);
      setError(err.message);
      setIsGenerating(false);
    }
  };

  // PDF oluşturma bileşeni
  const renderPDF = () => {
    try {
      // Tarif bilgileriyle zenginleştirilmiş plan
      const enrichedPlan = enrichWeekPlanWithRecipes();

      return (
        <PDFDownloadLink
          document={<MealPlanDocument weekPlan={enrichedPlan || {}} />}
          fileName="haftalik-yemek-plani.pdf"
          className={`${
            isGenerating
              ? "bg-gray-400 cursor-wait"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center w-full`}
          onClick={handleClick}
        >
          {({ loading, error }) => {
            if (error) {
              console.error("PDF link hatası:", error);
              return "PDF oluşturulurken hata oluştu";
            }

            if (loading || isGenerating) {
              return "PDF Hazırlanıyor...";
            }

            return "PDF Olarak İndir";
          }}
        </PDFDownloadLink>
      );
    } catch (err) {
      console.error("PDF render hatası:", err);
      setError(err.message);
      return (
        <button
          className="bg-red-500 text-white px-4 py-2 rounded text-sm font-medium w-full"
          onClick={() => setError(null)}
        >
          PDF oluşturulamadı. Tekrar dene
        </button>
      );
    }
  };

  if (error) {
    return (
      <div className="mt-4">
        <div className="p-3 mb-3 bg-red-100 text-red-700 rounded">
          PDF oluşturulurken hata oluştu: {error}
        </div>
        <button
          onClick={() => setError(null)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium w-full"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return <div className="mt-4">{renderPDF()}</div>;
};

export default PlanExport;
