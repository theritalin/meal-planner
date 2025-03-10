import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
  const { user, loading } = useMeals();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Yemek Planlayıcı
            </h1>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <a href="/" className="text-gray-700 hover:text-gray-900">
                  Ana Sayfa
                </a>
                <a
                  href="/planner"
                  className="text-gray-700 hover:text-gray-900"
                >
                  Haftalık Plan
                </a>
              </nav>
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
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <WeekView />
                      <div className="mt-4">
                        <PlanExport />
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <MealList />
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3">
                      <WeekView />
                      <div className="mt-4">
                        <PlanExport />
                      </div>
                    </div>
                    <div className="lg:col-span-1">
                      <MealList />
                    </div>
                  </div>
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
      </div>
    </Router>
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
