import React, { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, Navigate, useParams } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  BookmarkRemove as BookmarkRemoveIcon,
} from "@mui/icons-material";
import { useMeals } from "../../context/MealContext";
import { useRecipes } from "../../context/recipes/RecipeContext";
import { auth, updateUserProfile } from "../../services/firebase";
import useProfileData from "./profile/useProfileData";
import ProfileHeader from "./profile/ProfileHeader";
import ProfileRecipeGrid from "./profile/ProfileRecipeGrid";
import RecipePreviewDialog from "./profile/RecipePreviewDialog";
import EditProfileDialog from "./profile/EditProfileDialog";
import AccountSection from "./profile/AccountSection";

const countOf = (value) => (Array.isArray(value) ? value.length : 0);
const recipeHref = (recipe) => `/recipes/${recipe.id}`;

const UserProfile = () => {
  const { userId } = useParams();
  const { user, authLoading } = useMeals();
  const { userRecipes, savedRecipes, saveRecipe, unsaveRecipe, isRecipeSaved } =
    useRecipes();

  const profileUid = userId || user?.uid;
  const {
    profile,
    loading,
    notFound,
    isOwnProfile,
    isFollowing,
    followBusy,
    toggleFollow,
    patchProfile,
  } = useProfileData(profileUid, user);

  const [tab, setTab] = useState("recipes");
  const [editOpen, setEditOpen] = useState(false);
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [snackbar, setSnackbar] = useState(null);

  const notify = (message, severity = "success") =>
    setSnackbar({ message, severity });

  const recipes = useMemo(
    () => (isOwnProfile ? userRecipes : profile?.personalRecipes || []),
    [isOwnProfile, userRecipes, profile],
  );

  const stats = useMemo(
    () => ({
      recipes: recipes.length,
      saved: isOwnProfile
        ? savedRecipes.length
        : countOf(profile?.savedRecipes),
      followers: countOf(profile?.followers),
      following: countOf(profile?.following),
    }),
    [recipes, isOwnProfile, savedRecipes, profile],
  );

  const handleToggleFollow = async () => {
    try {
      const nowFollowing = await toggleFollow();
      notify(nowFollowing ? "Takip edildi" : "Takipten çıkıldı");
    } catch (error) {
      console.error("Takip işlemi sırasında hata oluştu:", error);
      notify("Takip işlemi sırasında bir hata oluştu", "error");
    }
  };

  const handleSaveProfile = async ({ displayName, about }) => {
    try {
      await updateUserProfile(user.uid, { displayName, about });
      if (auth.currentUser && auth.currentUser.displayName !== displayName) {
        await updateProfile(auth.currentUser, { displayName }).catch((err) =>
          console.error("Auth profili güncellenemedi:", err),
        );
      }
      patchProfile({ displayName, about });
      setEditOpen(false);
      notify("Profil güncellendi");
    } catch (error) {
      console.error("Profil güncellenirken hata oluştu:", error);
      notify("Profil güncellenirken bir hata oluştu", "error");
    }
  };

  const handleSaveOthersRecipe = useCallback(
    async (recipe) => {
      setSavingId(recipe.id);
      const result = await saveRecipe(user.uid, {
        ...recipe,
        // Kaydedilen kopya kaydedenin kişisel tarifi değildir.
        isPersonal: false,
        createdBy: profile?.displayName || "",
        createdByPhoto: profile?.photoURL || "",
        createdByUid: profile?.uid || "",
      });
      setSavingId(null);
      if (result) notify("Tarif kaydedilenlere eklendi");
      else notify("Tarif kaydedilemedi", "error");
    },
    [saveRecipe, user, profile],
  );

  const handleUnsave = async (recipe) => {
    const ok = await unsaveRecipe(user.uid, recipe.id);
    if (ok) notify("Tarif kaydedilenlerden kaldırıldı");
    else notify("Tarif kaldırılamadı", "error");
  };

  if (authLoading) {
    return <CenteredSpinner />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <CenteredSpinner />;
  }
  if (notFound || !profile) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Kullanıcı bulunamadı
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Aradığınız profil silinmiş ya da hiç var olmamış olabilir.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Ana sayfaya dön
        </Button>
      </Box>
    );
  }

  const activeTab = isOwnProfile ? tab : "recipes";
  const firstName = (profile.displayName || "").split(" ")[0];

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", py: { xs: 2, sm: 3 } }}>
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        stats={stats}
        isFollowing={isFollowing}
        followBusy={followBusy}
        onToggleFollow={handleToggleFollow}
        onEdit={() => setEditOpen(true)}
      />

      <Tabs
        value={activeTab}
        onChange={(_e, value) => setTab(value)}
        aria-label="Profil sekmeleri"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab value="recipes" label={`Tarifler (${stats.recipes})`} />
        {isOwnProfile && (
          <Tab value="saved" label={`Kaydedilenler (${stats.saved})`} />
        )}
      </Tabs>

      {activeTab === "recipes" &&
        (isOwnProfile ? (
          <ProfileRecipeGrid
            recipes={recipes}
            getHref={recipeHref}
            emptyText="Henüz kendi tarifinizi eklemediniz."
            emptyAction={
              <Button
                component={RouterLink}
                to="/recipes"
                variant="contained"
                startIcon={<AddIcon />}
              >
                Tarif Kitabına git
              </Button>
            }
          />
        ) : (
          <ProfileRecipeGrid
            recipes={recipes}
            onOpen={setPreviewRecipe}
            emptyText={`${firstName || "Bu kullanıcı"} henüz tarif paylaşmadı.`}
          />
        ))}

      {activeTab === "saved" && (
        <ProfileRecipeGrid
          recipes={savedRecipes}
          getHref={recipeHref}
          emptyText="Henüz hiç tarif kaydetmediniz."
          action={(recipe) => (
            <Button
              size="small"
              color="error"
              startIcon={<BookmarkRemoveIcon />}
              onClick={() => handleUnsave(recipe)}
            >
              Kayıttan Kaldır
            </Button>
          )}
        />
      )}

      {isOwnProfile && <AccountSection email={profile.email || user.email} />}

      {isOwnProfile && (
        <EditProfileDialog
          open={editOpen}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

      <RecipePreviewDialog
        recipe={previewRecipe}
        onClose={() => setPreviewRecipe(null)}
        isSaved={previewRecipe ? isRecipeSaved(previewRecipe.id) : false}
        saving={Boolean(previewRecipe) && savingId === previewRecipe.id}
        onSave={handleSaveOthersRecipe}
      />

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={3500}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ mb: { xs: 9, md: 0 } }}
      >
        {snackbar ? (
          <Alert
            onClose={() => setSnackbar(null)}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
};

const CenteredSpinner = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
    <CircularProgress aria-label="Yükleniyor" />
  </Box>
);

export default UserProfile;
