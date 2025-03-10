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
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#bfbfbf",
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
      lunch: "Ogle",
      dinner: "Aksam",
    };

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
  const { weekPlan, saveMealPlanToFirebase, saveStatus, user } = useMeals();
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Kaydetme işlemi
  const handleSave = async () => {
    await saveMealPlanToFirebase();
  };

  // Kaydet butonu render fonksiyonu
  const renderSaveButton = () => {
    if (!user) return null;

    let buttonClass = "bg-green-500 hover:bg-green-600";
    let buttonText = "Planı Kaydet";
    let isDisabled = false;

    if (saveStatus === "saving") {
      buttonClass = "bg-gray-400 cursor-wait";
      buttonText = "Kaydediliyor...";
      isDisabled = true;
    } else if (saveStatus === "success") {
      buttonClass = "bg-green-600";
      buttonText = "Kaydedildi ✓";
      isDisabled = true;
    } else if (saveStatus === "error") {
      buttonClass = "bg-red-500 hover:bg-red-600";
      buttonText = "Kaydetme Hatası!";
    }

    return (
      <button
        onClick={handleSave}
        disabled={isDisabled}
        className={`${buttonClass} text-white px-4 py-2 rounded text-sm font-medium flex items-center justify-center w-full mb-2`}
      >
        <span className="mr-2">💾</span>
        {buttonText}
      </button>
    );
  };

  // PDF oluşturma bileşeni
  const renderPDF = () => {
    try {
      return (
        <PDFDownloadLink
          document={<MealPlanDocument weekPlan={weekPlan || {}} />}
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

  return (
    <div className="mt-4">
      {renderSaveButton()}
      {renderPDF()}
    </div>
  );
};

export default PlanExport;
