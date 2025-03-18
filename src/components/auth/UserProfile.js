import React, { useState, useEffect } from "react";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import {
  auth,
  updateUserProfile,
  getUserProfile,
} from "../../services/firebase";
import {
  Container,
  Grid,
  Box,
  Paper,
  Typography,
  Button,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  CardActionArea,
  IconButton,
  TextField,
  Chip,
  useMediaQuery,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Edit as EditIcon,
  MenuBook as MenuBookIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon,
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import RecipeList from "../recipes/RecipeList";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const { userId } = useParams(); // URL'den kullanıcı ID'sini al
  const { user, setCurrentUser, isAdmin } = useMeals();
  const {
    userRecipes,
    getAllRecipes,
    savedRecipes: initialSavedRecipes,
    saveRecipe,
    unsaveRecipe,
  } = useRecipes();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [profileUser, setProfileUser] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [userStats, setUserStats] = useState({
    recipeCount: 0,
    followers: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [savedRecipes, setSavedRecipes] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openRecipeDialog, setOpenRecipeDialog] = useState(false);

  // Profil sahibini belirle
  useEffect(() => {
    const checkProfileOwner = async () => {
      // Eğer URL'de userId varsa ve giriş yapmış kullanıcıdan farklıysa
      if (userId && user && userId !== user.uid) {
        setIsOwnProfile(false);
        // Profil sahibinin bilgilerini getir
        try {
          const profileData = await getUserProfile(userId);
          setProfileUser(profileData);
          // Takip durumunu kontrol et
          setIsFollowing(
            user.following &&
              Array.isArray(user.following) &&
              user.following.includes(userId)
          );
        } catch (error) {
          console.error("Profil bilgileri alınamadı:", error);
        }
      } else {
        setIsOwnProfile(true);
        setProfileUser(user);
      }
    };

    if (user) {
      checkProfileOwner();
    } else {
      // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
      window.location.href = "/login";
    }
  }, [userId, user]);

  // Kullanıcı istatistiklerini yükle
  useEffect(() => {
    const loadUserStats = async () => {
      if (profileUser) {
        try {
          // Gerçek uygulamada bu veriler Firebase'den gelecek
          const profile = await getUserProfile(profileUser.uid);
          const recipeCount = isOwnProfile
            ? userRecipes.length
            : profile.recipes
            ? profile.recipes.length
            : 0;

          setUserStats({
            recipeCount,
            followers: profile.followers ? profile.followers.length : 0,
          });

          // Kullanıcı hakkında bilgisini yükle
          setAboutText(profile.about || "Henüz hakkımda bilgisi eklenmemiş.");
        } catch (error) {
          console.error("Kullanıcı istatistikleri yüklenemedi:", error);
        }
      }
    };

    loadUserStats();
  }, [profileUser, userRecipes, isOwnProfile]);

  // Kaydedilen tarifleri yükle
  useEffect(() => {
    if (initialSavedRecipes) {
      setSavedRecipes(initialSavedRecipes);
    }
  }, [initialSavedRecipes]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      // Çıkış yapıldığında login sayfasına yönlendir
      window.location.href = "/login";
    } catch (error) {
      console.error("Çıkış yaparken hata oluştu:", error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditAbout = () => {
    setEditMode(true);
  };

  const handleSaveAbout = async () => {
    try {
      // Firebase'e kaydet
      await updateUserProfile(user.uid, { about: aboutText });
      setEditMode(false);
      setSnackbar({
        open: true,
        message: "Hakkımda bilgisi başarıyla güncellendi",
        severity: "success",
      });
    } catch (error) {
      console.error("Hakkımda bilgisi güncellenirken hata oluştu:", error);
      setSnackbar({
        open: true,
        message: "Hakkımda bilgisi güncellenirken bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleAboutChange = (e) => {
    setAboutText(e.target.value);
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      // Eğer zaten takip ediyorsa, takipten çık
      if (isFollowing) {
        // Kullanıcının takip listesinden çıkar
        const updatedFollowing = Array.isArray(user.following)
          ? user.following.filter((id) => id !== profileUser.uid)
          : [];

        await updateUserProfile(user.uid, { following: updatedFollowing });

        // Takip edilen kullanıcının takipçi listesinden çıkar
        const updatedFollowers = Array.isArray(profileUser.followers)
          ? profileUser.followers.filter((id) => id !== user.uid)
          : [];

        await updateUserProfile(profileUser.uid, {
          followers: updatedFollowers,
        });
      } else {
        // Takip et
        const updatedFollowing = Array.isArray(user.following)
          ? [...user.following, profileUser.uid]
          : [profileUser.uid];

        await updateUserProfile(user.uid, { following: updatedFollowing });

        // Takip edilen kullanıcının takipçi listesine ekle
        const updatedFollowers = Array.isArray(profileUser.followers)
          ? [...profileUser.followers, user.uid]
          : [user.uid];

        await updateUserProfile(profileUser.uid, {
          followers: updatedFollowers,
        });
      }

      // Takip durumunu güncelle
      setIsFollowing(!isFollowing);

      // Bildirim göster
      setSnackbar({
        open: true,
        message: isFollowing ? "Takipten çıkıldı" : "Takip edildi",
        severity: "success",
      });

      // Takipçi sayısını güncelle
      setUserStats((prev) => ({
        ...prev,
        followers: isFollowing ? prev.followers - 1 : prev.followers + 1,
      }));
    } catch (error) {
      console.error("Takip işlemi sırasında hata oluştu:", error);
      setSnackbar({
        open: true,
        message: "Takip işlemi sırasında bir hata oluştu",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tarif detaylarını göster
  const handleOpenRecipeDialog = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenRecipeDialog(true);
  };

  const handleCloseRecipeDialog = () => {
    setOpenRecipeDialog(false);
    setSelectedRecipe(null);
  };

  // Malzeme formatını kontrol eden yardımcı fonksiyon
  const formatIngredient = (ingredient) => {
    if (typeof ingredient === "string") {
      return ingredient;
    } else if (typeof ingredient === "object" && ingredient !== null) {
      // Obje formatındaysa (name, amount, unit)
      return `${ingredient.name}: ${ingredient.amount} ${ingredient.unit}`;
    }
    return "";
  };

  if (!user || !profileUser) {
    return null;
  }

  // Kullanıcı adından baş harflerini al
  const getInitials = (name) => {
    if (!name) return "K";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Profil Üst Kısmı */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "center" : "flex-start",
            mb: 4,
          }}
        >
          {/* Profil Fotoğrafı */}
          <Avatar
            src={profileUser.photoURL}
            alt={profileUser.displayName || "Kullanıcı"}
            sx={{
              width: isMobile ? 120 : 150,
              height: isMobile ? 120 : 150,
              mb: isMobile ? 2 : 0,
              mr: isMobile ? 0 : 4,
              bgcolor: "primary.main",
              fontSize: isMobile ? 40 : 50,
            }}
          >
            {!profileUser.photoURL && getInitials(profileUser.displayName)}
          </Avatar>

          {/* Kullanıcı Bilgileri */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: isMobile ? "center" : "flex-start",
            }}
          >
            {/* İsim ve Konum */}
            <Typography
              variant={isMobile ? "h5" : "h4"}
              component="h1"
              fontWeight="bold"
              gutterBottom
              align={isMobile ? "center" : "left"}
            >
              {profileUser.displayName || "Kullanıcı"}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              gutterBottom
              align={isMobile ? "center" : "left"}
            >
              {profileUser.email}
            </Typography>

            {/* İstatistikler */}
            <Box
              sx={{
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-start",
                mt: 2,
                mb: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mr: 4,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {userStats.recipeCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tarif
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {userStats.followers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Takipçi
                </Typography>
              </Box>
            </Box>

            {/* Butonlar */}
            <Box
              sx={{
                display: "flex",
                mt: 2,
                width: "100%",
                justifyContent: isMobile ? "center" : "flex-start",
              }}
            >
              {!isOwnProfile && (
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  color="primary"
                  startIcon={isFollowing ? <CloseIcon /> : <PersonAddIcon />}
                  onClick={handleFollow}
                  sx={{ mr: 2 }}
                >
                  {isFollowing ? "Takibi Bırak" : "Takip Et"}
                </Button>
              )}
              {isOwnProfile && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleSignOut}
                >
                  Çıkış
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Hakkında Bölümü */}
        <Paper
          elevation={1}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Hakkımda
            </Typography>
            {isOwnProfile && !editMode && (
              <IconButton onClick={handleEditAbout} size="small">
                <EditIcon />
              </IconButton>
            )}
          </Box>

          {isOwnProfile && editMode ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={aboutText}
                onChange={handleAboutChange}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAbout}
              >
                Kaydet
              </Button>
            </Box>
          ) : (
            <Typography variant="body1">{aboutText}</Typography>
          )}
        </Paper>

        {/* Sekmeler */}
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "fullWidth" : "standard"}
              centered={!isMobile}
            >
              <Tab label="Tarifler" />
              <Tab label="Kaydedilenler" />
            </Tabs>
          </Box>

          {/* Tarifler Sekmesi */}
          {tabValue === 0 && (
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {isOwnProfile
                    ? "Tariflerim"
                    : `${profileUser.displayName}'in Tarifleri`}
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<MenuBookIcon />}
                    component={Link}
                    to="/"
                  >
                    Yeni Tarif
                  </Button>
                )}
              </Box>

              {/* Tarifler Listesi - Kendi profilimizde kendi tariflerimizi, başkasının profilinde onun tariflerini göster */}
              {isOwnProfile ? (
                <RecipeList userOnly={true} />
              ) : (
                <RecipeList userOnly={true} userId={profileUser.uid} />
              )}
            </Box>
          )}

          {/* Kaydedilenler Sekmesi */}
          {tabValue === 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Kaydedilen Tarifler
              </Typography>
              {isOwnProfile ? (
                <Grid container spacing={3}>
                  {savedRecipes.length === 0 ? (
                    <Grid item xs={12}>
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          Henüz hiç tarif kaydedilmemiş.
                        </Typography>
                      </Box>
                    </Grid>
                  ) : (
                    savedRecipes.map((recipe) => (
                      <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                        <Card
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <CardActionArea
                            onClick={() => handleOpenRecipeDialog(recipe)}
                          >
                            <CardMedia
                              component="div"
                              sx={{
                                height: 140,
                                bgcolor: "rgba(0, 0, 0, 0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <MenuBookIcon
                                sx={{
                                  fontSize: 60,
                                  color: "rgba(0, 0, 0, 0.3)",
                                }}
                              />
                            </CardMedia>
                            <CardContent sx={{ flexGrow: 1 }}>
                              <Typography
                                gutterBottom
                                variant="h6"
                                component="div"
                                noWrap
                              >
                                {recipe.name}
                              </Typography>
                              {recipe.createdBy && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mb: 1,
                                  }}
                                >
                                  <Avatar
                                    src={recipe.createdByPhoto}
                                    alt={recipe.createdBy}
                                    sx={{
                                      width: 24,
                                      height: 24,
                                      mr: 1,
                                      fontSize: "0.8rem",
                                    }}
                                  >
                                    {!recipe.createdByPhoto &&
                                      recipe.createdBy.charAt(0).toUpperCase()}
                                  </Avatar>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {recipe.createdBy}
                                  </Typography>
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  size="small"
                                  icon={<AccessTimeIcon />}
                                  label={`${
                                    recipe.prepTime + recipe.cookTime
                                  } dk`}
                                  variant="outlined"
                                />
                                <Chip
                                  size="small"
                                  icon={<RestaurantIcon />}
                                  label={`${recipe.servings} Porsiyon`}
                                  variant="outlined"
                                />
                              </Box>
                            </CardContent>
                          </CardActionArea>
                          <CardActions>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<CloseIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                unsaveRecipe(user.uid, recipe.id);
                                // Kaydedilen tariflerden kaldır
                                setSavedRecipes((prev) =>
                                  prev.filter((r) => r.id !== recipe.id)
                                );
                                setSnackbar({
                                  open: true,
                                  message: "Tarif kaydedilenlerden kaldırıldı",
                                  severity: "success",
                                });
                              }}
                            >
                              Kayıttan Kaldır
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Diğer kullanıcıların kaydedilen tarifleri görüntülenemez.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Paper>

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

      {/* Tarif Detay Dialog */}
      <Dialog
        open={openRecipeDialog}
        onClose={handleCloseRecipeDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedRecipe && (
          <>
            <DialogTitle>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h6">{selectedRecipe.name}</Typography>
                <IconButton onClick={handleCloseRecipeDialog} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 2 }}>
                {selectedRecipe.createdBy && (
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      src={selectedRecipe.createdByPhoto}
                      alt={selectedRecipe.createdBy}
                      sx={{ width: 24, height: 24, mr: 1, fontSize: "0.8rem" }}
                    >
                      {!selectedRecipe.createdByPhoto &&
                        selectedRecipe.createdBy.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" color="text.secondary">
                      {selectedRecipe.createdBy}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Chip
                    size="small"
                    icon={<AccessTimeIcon />}
                    label={`Hazırlık: ${selectedRecipe.prepTime} dk`}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<AccessTimeIcon />}
                    label={`Pişirme: ${selectedRecipe.cookTime} dk`}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    icon={<RestaurantIcon />}
                    label={`${selectedRecipe.servings} Porsiyon`}
                    variant="outlined"
                  />
                  {selectedRecipe.isPersonal && (
                    <Chip size="small" label="Kişisel" color="primary" />
                  )}
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Malzemeler
              </Typography>
              <List dense>
                {selectedRecipe.ingredients &&
                  selectedRecipe.ingredients.map((ingredient, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={formatIngredient(ingredient)} />
                    </ListItem>
                  ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Hazırlanışı
              </Typography>
              <List dense>
                {selectedRecipe.instructions &&
                  selectedRecipe.instructions.map((instruction, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${index + 1}. ${instruction}`} />
                    </ListItem>
                  ))}
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRecipeDialog}>Kapat</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default UserProfile;
