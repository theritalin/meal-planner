import React, { useEffect, useState, useCallback } from "react";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { useMeals } from "../../context/MealContext";
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import RecipeList from "./RecipeList";

const RecipePage = () => {
  const { loadUserRecipes, addDefaultRecipes, refreshData } = useRecipes();
  const { user, isAdmin } = useMeals();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Kullanıcı tarifleri yükleme fonksiyonunu memoize et
  const loadRecipes = useCallback(() => {
    if (user) {
      console.log("RecipePage - Kullanıcı tarifleri yükleniyor");
      loadUserRecipes(user.uid);
    }
  }, [user, loadUserRecipes]);

  // Sadece kullanıcı değiştiğinde tarifleri yükle
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Verileri yenileme fonksiyonu
  const handleRefreshData = useCallback(() => {
    console.log("Veriler yenileniyor");
    refreshData();
    setSnackbarMessage("Veriler yenilendi");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  }, [refreshData]);

  const handleAddDefaultRecipes = async () => {
    try {
      const result = await addDefaultRecipes();
      if (result) {
        setSnackbarMessage("Varsayılan tarifler başarıyla eklendi");
        setSnackbarSeverity("success");
      } else {
        setSnackbarMessage("Varsayılan tarifler eklenirken bir hata oluştu");
        setSnackbarSeverity("error");
      }
    } catch (error) {
      setSnackbarMessage("Varsayılan tarifler eklenirken bir hata oluştu");
      setSnackbarSeverity("error");
    }
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          Tarifler
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefreshData}
            sx={{ mr: 1 }}
          >
            Verileri Yenile
          </Button>
          {isAdmin && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddDefaultRecipes}
            >
              Varsayılan Tarifleri Ekle (Yönetici)
            </Button>
          )}
        </Box>
      </Box>
      <Paper
        sx={{
          p: 2,
          display: "flex",
          flexDirection: "column",
          minHeight: "70vh",
        }}
      >
        <RecipeList />
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RecipePage;
