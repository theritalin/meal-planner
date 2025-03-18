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
import { MealProvider, useMeals } from "./context/MealContext";
import { RecipeProvider } from "./context/recipes/RecipeContext";
import MealPlannerPage from "./components/MealPlannerPage";
import ExportPage from "./components/pdf/PlanExport";
import UserProfile from "./components/auth/UserProfile";
import UserSearch from "./components/auth/UserSearch";
import Login from "./components/auth/Login";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  useMediaQuery,
  createTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

// Tema oluştur
const theme = createTheme();

// Korumalı Route bileşeni - MealProvider içinde kullanılacak
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

// Mobil Menü Bileşeni - MealProvider içinde kullanılacak
const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useMeals();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer anchor="left" open={isOpen} onClose={onClose}>
      <Box sx={{ width: 250, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation("/")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Ana Sayfa" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={() => setSearchOpen(!searchOpen)}>
              <ListItemIcon>
                <SearchIcon />
              </ListItemIcon>
              <ListItemText primary="Kullanıcı Ara" />
            </ListItemButton>
          </ListItem>

          {searchOpen && (
            <ListItem sx={{ pl: 4, pr: 2 }}>
              <UserSearch />
            </ListItem>
          )}

          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigation("/export")}>
              <ListItemIcon>
                <PictureAsPdfIcon />
              </ListItemIcon>
              <ListItemText primary="Dışa Aktar" />
            </ListItemButton>
          </ListItem>

          {user && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(`/profile/${user.uid}`)}
              >
                <ListItemIcon>
                  {user.photoURL ? (
                    <Avatar
                      src={user.photoURL}
                      alt={user.displayName || "Kullanıcı"}
                      sx={{ width: 24, height: 24 }}
                    />
                  ) : (
                    <Avatar
                      sx={{ width: 24, height: 24, bgcolor: "primary.main" }}
                    >
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : "K"}
                    </Avatar>
                  )}
                </ListItemIcon>
                <ListItemText primary="Profilim" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );
};

// Ana içerik bileşeni - MealProvider içinde kullanılacak
const AppContent = () => {
  const { user } = useMeals();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleLogin = () => {
    // Giriş işlemi burada yapılacak
    console.log("Giriş yapılıyor...");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        {/* Üst Menü */}
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: "none",
                color: "primary.main",
                fontWeight: "bold",
              }}
            >
              Meal Planner
            </Typography>

            {!isMobile && (
              <>
                <Button component={Link} to="/" color="inherit" sx={{ mx: 1 }}>
                  Ana Sayfa
                </Button>
                <Box sx={{ width: 250, mx: 2 }}>
                  <UserSearch />
                </Box>
                <Button
                  component={Link}
                  to="/export"
                  color="inherit"
                  sx={{ mx: 1 }}
                >
                  Dışa Aktar
                </Button>
              </>
            )}

            {user ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Button
                  component={Link}
                  to={`/profile/${user.uid}`}
                  color="inherit"
                  startIcon={
                    user.photoURL ? (
                      <Avatar
                        src={user.photoURL}
                        alt={user.displayName || "Kullanıcı"}
                        sx={{ width: 24, height: 24 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: "primary.main",
                        }}
                      >
                        {user.displayName
                          ? user.displayName.charAt(0).toUpperCase()
                          : "K"}
                      </Avatar>
                    )
                  }
                >
                  {isMobile ? "" : "Kullanıcı"}
                </Button>
              </Box>
            ) : (
              <Button color="primary" variant="contained" onClick={handleLogin}>
                Giriş Yap
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {/* Mobil Menü */}
        <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

        {/* Ana İçerik */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            p: { xs: 1, sm: 3 },
          }}
        >
          <Routes>
            <Route path="/" element={<MealPlannerPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Login />}
            />
          </Routes>
        </Box>

        {/* Alt Bilgi */}
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: "auto",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[200]
                : theme.palette.grey[800],
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Meal Planner
            </Typography>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Router>
      <MealProvider>
        <RecipeProvider>
          <DndProvider backend={HTML5Backend}>
            <AppContent />
          </DndProvider>
        </RecipeProvider>
      </MealProvider>
    </Router>
  );
}

export default App;
