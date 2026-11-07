import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Box, CircularProgress, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { MealProvider, useMeals } from "./context/MealContext";
import { RecipeProvider } from "./context/recipes/RecipeContext";
import AppShell from "./components/layout/AppShell";
import { LanguageProvider } from "./i18n";

// Sayfalar ihtiyaç anında yüklenir (PDF kütüphanesi gibi ağır modüller
// yalnızca ilgili sayfa açıldığında indirilir).
const MealPlannerPage = lazy(() => import("./components/MealPlannerPage"));
const RecipeBookPage = lazy(
  () => import("./components/recipes/RecipeBookPage"),
);
const RecipeDetailPage = lazy(
  () => import("./components/recipes/RecipeDetailPage"),
);
const ExportPage = lazy(() => import("./components/pdf/ExportPage"));
const UserProfile = lazy(() => import("./components/auth/UserProfile"));
const PrivacyPolicy = lazy(() => import("./components/legal/PrivacyPolicy"));
const Login = lazy(() => import("./components/auth/Login"));
// Herkese açık içerik sayfaları (oturum gerektirmez).
const PublicHome = lazy(() => import("./components/public/PublicHome"));
const RecipeListPage = lazy(
  () => import("./components/public/RecipeListPage"),
);
const PublicRecipePage = lazy(
  () => import("./components/public/PublicRecipePage"),
);
const GuideListPage = lazy(() => import("./components/public/GuideListPage"));
const GuidePage = lazy(() => import("./components/public/GuidePage"));
const AboutPage = lazy(() => import("./components/public/AboutPage"));

const PageLoader = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "50vh",
    }}
  >
    <CircularProgress />
  </Box>
);

/** Oturum açmamış kullanıcıları giriş sayfasına yönlendirir. */
const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useMeals();
  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const LoginRoute = () => {
  const { user, authLoading } = useMeals();
  if (authLoading) return <PageLoader />;
  return user ? <Navigate to="/" replace /> : <Login />;
};

/** "/": oturum açıksa planlayıcı, değilse herkese açık ana sayfa. */
const HomeRoute = () => {
  const { user, authLoading } = useMeals();
  if (authLoading) return <PageLoader />;
  return user ? <MealPlannerPage /> : <PublicHome />;
};

const protect = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

const AppContent = () => (
  <AppShell>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/tarifler" element={<RecipeListPage />} />
        <Route path="/tarifler/:slug" element={<PublicRecipePage />} />
        <Route path="/rehberler" element={<GuideListPage />} />
        <Route path="/rehberler/:slug" element={<GuidePage />} />
        <Route path="/hakkimizda" element={<AboutPage />} />
        <Route path="/recipes" element={protect(<RecipeBookPage />)} />
        <Route
          path="/recipes/:recipeId"
          element={protect(<RecipeDetailPage />)}
        />
        <Route path="/export" element={protect(<ExportPage />)} />
        <Route path="/profile/:userId" element={protect(<UserProfile />)} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </AppShell>
);

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <MealProvider>
            <RecipeProvider>
              <DndProvider backend={HTML5Backend}>
                <AppContent />
              </DndProvider>
            </RecipeProvider>
          </MealProvider>
        </Router>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
