import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useLocation,
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
import RecipePage from "./components/recipes/RecipePage";

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

// Mobil Menü Bileşeni
const MobileMenu = () => {
  const { user } = useMeals();
  const navigate = useNavigate();

  return (
    <div className="flex items-center">
      <div className="flex space-x-2">
        <button
          onClick={() => navigate("/")}
          className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
        >
          Ana Sayfa
        </button>
        <button
          onClick={() => navigate("/recipes")}
          className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
        >
          Tarifler
        </button>
        <button
          onClick={() => navigate("/export")}
          className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
        >
          Dışa Aktar
        </button>
      </div>
      {user && (
        <button onClick={() => navigate("/profile")} className="ml-2">
          {user.photoURL ? (
            <img
              className="h-6 w-6 rounded-full"
              src={user.photoURL}
              alt={user.displayName || "Kullanıcı"}
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              {user.displayName
                ? user.displayName.charAt(0).toUpperCase()
                : "K"}
            </div>
          )}
        </button>
      )}
    </div>
  );
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
  const location = useLocation();

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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">
                  Meal Planner
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Ana Sayfa
                </Link>
                <Link
                  to="/recipes"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tarifler
                </Link>
                <Link
                  to="/export"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dışa Aktar
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {user ? (
                <Link
                  to="/profile"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <div className="flex items-center">
                    {user.photoURL ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.photoURL}
                        alt={user.displayName || "Kullanıcı"}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "K"}
                      </div>
                    )}
                    <span className="ml-2">
                      {user.displayName || user.email}
                    </span>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Giriş Yap
                </Link>
              )}
            </div>

            {/* Mobil menü */}
            {isMobile && (
              <div className="flex items-center">
                <div className="flex space-x-2">
                  <Link
                    to="/"
                    className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
                  >
                    Ana Sayfa
                  </Link>
                  <Link
                    to="/recipes"
                    className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
                  >
                    Tarifler
                  </Link>
                  <Link
                    to="/export"
                    className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
                  >
                    Dışa Aktar
                  </Link>
                </div>
                {user && (
                  <Link to="/profile" className="ml-2">
                    {user.photoURL ? (
                      <img
                        className="h-6 w-6 rounded-full"
                        src={user.photoURL}
                        alt={user.displayName || "Kullanıcı"}
                      />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "K"}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile menu - Sadece ana sayfada göster */}
      {isMobile && location.pathname === "/" && (
        <div className="flex flex-col p-4">
          <MobileLayout />
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {showMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">
              {message || "Yemek planınız başarıyla kaydedildi!"}
            </span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setShowMessage(false)}
            >
              <svg
                className="fill-current h-6 w-6 text-green-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Kapat</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                {isMobile ? (
                  <MobileLayout />
                ) : (
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-wrap gap-2 justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={handleGenerateRandomPlan}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Rastgele Plan Oluştur
                        </button>
                        <button
                          onClick={handleClearPlan}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Planı Temizle
                        </button>
                      </div>
                      <button
                        onClick={handleSavePlan}
                        className={getSaveButtonClass()}
                        disabled={saveStatus === "saving"}
                      >
                        {getSaveButtonText()}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3">
                        <WeekView />
                      </div>
                      <div className="lg:col-span-1 h-[calc(100vh-200px)]">
                        <MealList />
                      </div>
                    </div>
                  </div>
                )}
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute>
                <RecipePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/export"
            element={
              <ProtectedRoute>
                <PlanExport />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />
        </Routes>
      </main>
    </div>
  );
};

// Mobil ve masaüstü düzeni yönetimi
const MobileLayout = () => {
  const {
    generateRandomMealPlan,
    clearMealPlan,
    saveMealPlanToFirebase,
    saveStatus,
  } = useMeals();

  // Rastgele yemek planı oluştur
  const handleGenerateRandomPlan = () => {
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

  // Buton durumları
  const getSaveButtonClass = () => {
    let baseClass = "px-2 py-1 rounded text-xs font-medium flex items-center";

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
    <div className="flex flex-col">
      <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleGenerateRandomPlan}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs font-medium"
          >
            Rastgele Plan
          </button>
          <button
            onClick={handleClearPlan}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-xs font-medium"
          >
            Planı Temizle
          </button>
        </div>
        <button
          onClick={handleSavePlan}
          className={getSaveButtonClass()}
          disabled={saveStatus === "saving"}
        >
          {getSaveButtonText()}
        </button>
      </div>
      <div className="mb-4">
        <WeekView />
      </div>
      <div className="grid grid-cols-1 gap-4">
        <div className="h-[calc(100vh-300px)] overflow-y-auto">
          <MealList compactMode={true} />
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <MealProvider>
        <DndProvider backend={HTML5Backend}>
          <AppContent />
        </DndProvider>
      </MealProvider>
    </Router>
  );
}

export default App;
