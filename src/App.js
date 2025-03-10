import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { MealProvider } from "./context/MealContext";
import { useMeals } from "./context/MealContext";
import WeekView from "./components/calendar/WeekView";
import MealList from "./components/meals/MealList";
import PlanExport from "./components/pdf/PlanExport";
import Login from "./components/auth/Login";
import UserProfile from "./components/auth/UserProfile";

// Korumalı Route bileşeni
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useMeals();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Ana uygulama içeriği
const AppContent = () => {
  const {
    user,
    loading,
    generateRandomMealPlan,
    clearMealPlan,
    saveMealPlanToFirebase,
    saveStatus,
    mealFilter,
  } = useMeals();
  const [isMobile, setIsMobile] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");

  // Ekran boyutunu kontrol et
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // İlk yükleme
    checkScreenSize();

    // Ekran boyutu değiştiğinde
    window.addEventListener("resize", checkScreenSize);

    // Temizleme
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Rastgele yemek planı oluştur
  const handleGenerateRandomPlan = () => {
    let filterMessage = "";
    if (mealFilter === "personal") {
      filterMessage =
        "Sadece kişisel yemeklerden rastgele dağıtım yapılıyor...";
    } else if (mealFilter === "default") {
      filterMessage =
        "Sadece varsayılan yemeklerden rastgele dağıtım yapılıyor...";
    } else {
      filterMessage = "Tüm yemeklerden rastgele dağıtım yapılıyor...";
    }

    setMessage(filterMessage);
    setShowMessage(true);

    // 3 saniye sonra mesajı kapat
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);

    generateRandomMealPlan();
  };

  // Yemek planını temizle
  const handleClearPlan = () => {
    if (window.confirm("Yemek planını temizlemek istediğinize emin misiniz?")) {
      clearMealPlan();
    }
  };

  // Yemek planını kaydet
  const handleSavePlan = async () => {
    await saveMealPlanToFirebase();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Buton durumları
  const getSaveButtonClass = () => {
    let baseClass =
      "px-2 py-1 md:px-3 md:py-2 rounded text-xs md:text-sm font-medium flex items-center";

    if (saveStatus === "saving") {
      return `${baseClass} bg-gray-400 cursor-wait`;
    } else if (saveStatus === "success") {
      return `${baseClass} bg-green-600`;
    } else if (saveStatus === "error") {
      return `${baseClass} bg-red-500 hover:bg-red-600`;
    }

    return `${baseClass} bg-blue-500 hover:bg-blue-600 text-white`;
  };

  const getSaveButtonText = () => {
    if (saveStatus === "saving") return "Kaydediliyor...";
    if (saveStatus === "success") return "Kaydedildi ✓";
    if (saveStatus === "error") return "Hata!";
    return "Kaydet";
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Yemek Planlayıcı
            </h1>
            <div className="flex items-center space-x-2">
              <div className="flex gap-1 md:gap-2">
                <button
                  onClick={handleGenerateRandomPlan}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 md:px-3 md:py-2 rounded text-xs md:text-sm font-medium flex items-center"
                >
                  <span className="mr-1 md:mr-2">🎲</span>
                  <span className="hidden md:inline">Rastgele</span>
                </button>
                <button
                  onClick={handleClearPlan}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 md:px-3 md:py-2 rounded text-xs md:text-sm font-medium flex items-center"
                >
                  <span className="mr-1 md:mr-2">🗑️</span>
                  <span className="hidden md:inline">Temizle</span>
                </button>
                <button
                  onClick={handleSavePlan}
                  className={getSaveButtonClass()}
                  disabled={saveStatus === "saving"}
                >
                  <span className="mr-1 md:mr-2">💾</span>
                  <span className="hidden md:inline">
                    {getSaveButtonText()}
                  </span>
                </button>
                {/* <Link
                  to="/profile"
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
                >
                  Profil
                </Link> */}
              </div>
              <UserProfile />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4">
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MobileLayout isMobile={isMobile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <MobileLayout isMobile={isMobile} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="bg-white mt-12 py-6 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Yemek Planlayıcı - Tüm hakları saklıdır
            </p>
          </div>
        </footer>
        {showMessage && (
          <div className="bg-blue-100 border border-blue-300 text-blue-700 px-4 py-2 rounded mb-4 text-center">
            {message}
          </div>
        )}
      </div>
    </Router>
  );
};

// Mobil ve masaüstü düzeni yönetimi
const MobileLayout = ({ isMobile }) => {
  if (isMobile) {
    return (
      <div className="flex flex-col">
        <div className="mb-4">
          <WeekView />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[calc(100vh-300px)] overflow-y-auto">
            <MealList compactMode={true} />
          </div>
          <div className="mt-4 md:mt-0">
            <PlanExport />
          </div>
        </div>
      </div>
    );
  }

  // Masaüstü düzeni
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <WeekView />
        <div className="mt-4">
          <PlanExport />
        </div>
      </div>
      <div className="lg:col-span-1 h-[calc(100vh-200px)]">
        <MealList />
      </div>
    </div>
  );
};

function App() {
  return (
    <MealProvider>
      <DndProvider backend={HTML5Backend}>
        <AppContent />
      </DndProvider>
    </MealProvider>
  );
}

export default App;
