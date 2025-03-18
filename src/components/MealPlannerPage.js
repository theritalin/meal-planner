import React, { useState, useEffect } from "react";
import { useMeals } from "../context/MealContext";
import { useRecipes } from "../context/recipes/RecipeContext";
import MealList from "./meals/MealList";
import WeekView from "./calendar/WeekView";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import SaveIcon from "@mui/icons-material/Save";
import RecipeForm from "./recipes/RecipeForm";

const MealPlannerPage = () => {
  const {
    user,
    generateRandomMealPlan,
    clearMealPlan,
    saveMealPlanToFirebase,
  } = useMeals();
  const navigate = useNavigate();
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Kullanıcı girişi kontrolü
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Kullanıcı girişi yapılmamışsa içeriği gösterme
  if (!user) {
    return null;
  }

  const handleOpenRecipeDialog = () => {
    setOpenRecipeDialog(true);
  };

  const handleCloseRecipeDialog = () => {
    setOpenRecipeDialog(false);
  };

  const handleRandomPlan = () => {
    generateRandomMealPlan();
    setSnackbar({
      open: true,
      message: "Rastgele plan oluşturuldu",
      severity: "success",
    });
  };

  const handleClearPlan = () => {
    clearMealPlan();
    setSnackbar({
      open: true,
      message: "Plan temizlendi",
      severity: "info",
    });
  };

  const handleSavePlan = () => {
    saveMealPlanToFirebase();
    setSnackbar({
      open: true,
      message: "Plan kaydedildi",
      severity: "success",
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Grid container spacing={4}>
          {/* Mobil görünümde sıralamayı değiştir */}
          {isMobile ? (
            <>
              {/* Mobil için önce Haftalık Plan */}
              <Grid item xs={12}>
                <Paper
                  elevation={3}
                  sx={{ p: 2, height: "100%", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                      flexWrap: "wrap",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      Haftalık Yemek Planı
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShuffleIcon />}
                        onClick={handleRandomPlan}
                      >
                        Rastgele
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<ClearAllIcon />}
                        onClick={handleClearPlan}
                      >
                        Temizle
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSavePlan}
                      >
                        Kaydet
                      </Button>
                    </Stack>
                  </Box>
                  <WeekView />
                </Paper>
              </Grid>

              {/* Sonra Yemek Listesi */}
              <Grid item xs={12}>
                <Paper
                  elevation={3}
                  sx={{ p: 2, height: "100%", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      Yemek Listesi
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleOpenRecipeDialog}
                    >
                      Yeni Tarif
                    </Button>
                  </Box>
                  <Box sx={{ height: "400px", overflow: "auto" }}>
                    <MealList />
                  </Box>
                </Paper>
              </Grid>
            </>
          ) : (
            <>
              {/* Masaüstü görünümü - Sol Taraf - Yemek Listesi */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{ p: 2, height: "100%", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      Yemek Listesi
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={handleOpenRecipeDialog}
                    >
                      Yeni Tarif
                    </Button>
                  </Box>
                  <Box sx={{ height: "calc(100vh - 250px)", overflow: "auto" }}>
                    <MealList />
                  </Box>
                </Paper>
              </Grid>

              {/* Masaüstü görünümü - Sağ Taraf - Haftalık Plan */}
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={3}
                  sx={{ p: 2, height: "100%", borderRadius: 2 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      Haftalık Yemek Planı
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ShuffleIcon />}
                        onClick={handleRandomPlan}
                      >
                        Rastgele
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<ClearAllIcon />}
                        onClick={handleClearPlan}
                      >
                        Temizle
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSavePlan}
                      >
                        Kaydet
                      </Button>
                    </Stack>
                  </Box>
                  <WeekView />
                </Paper>
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {/* Yeni Tarif Ekleme Dialog */}
      <Dialog
        open={openRecipeDialog}
        onClose={handleCloseRecipeDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Yeni Tarif Ekle</DialogTitle>
        <DialogContent>
          <RecipeForm onClose={handleCloseRecipeDialog} />
        </DialogContent>
      </Dialog>

      {/* Bildirim Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MealPlannerPage;
