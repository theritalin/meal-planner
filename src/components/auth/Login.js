import React, { useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CalendarMonth as CalendarMonthIcon,
  MenuBook as MenuBookIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from "@mui/icons-material";
import { signInWithGoogle } from "../../services/firebase";
import { useMeals } from "../../context/MealContext";

const FEATURES = [
  {
    icon: CalendarMonthIcon,
    title: "Planlayıcı",
    text: "Haftanın yemeklerini sürükle-bırak ile dakikalar içinde planla.",
  },
  {
    icon: MenuBookIcon,
    title: "Tarif Kitabı",
    text: "Kendi tariflerini ve beğendiklerini tek yerde sakla.",
  },
  {
    icon: PictureAsPdfIcon,
    title: "PDF",
    text: "Planını ya da tarif kitabını PDF olarak indir, paylaş.",
  },
];

const FOOD_EMOJI = ["🥘", "🥗", "🍲", "🥐", "🍝", "🫓"];

const GoogleIcon = () => (
  <Box
    component="svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    sx={{ width: 20, height: 20 }}
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Box>
);

const errorMessage = (err) => {
  switch (err?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Giriş penceresi kapatıldı. Tekrar denemek için butona dokunun.";
    case "auth/popup-blocked":
      return "Tarayıcınız giriş penceresini engelledi. Açılır pencerelere izin verip tekrar deneyin.";
    case "auth/network-request-failed":
      return "İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.";
    default:
      return "Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.";
  }
};

const Login = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useMeals();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!authLoading && user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Giriş yaparken hata oluştu:", err);
      setError(errorMessage(err));
      setLoading(false);
    }
  };

  return (
    <Box
      component="main"
      sx={(theme) => ({
        minHeight: "100vh",
        "@supports (min-height: 100dvh)": { minHeight: "100dvh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: { xs: 4, sm: 6 },
        position: "relative",
        overflow: "hidden",
        background: `radial-gradient(circle at 15% 10%, ${alpha(
          theme.palette.primary.light,
          0.35,
        )}, transparent 45%), radial-gradient(circle at 90% 90%, ${alpha(
          theme.palette.secondary.main,
          0.22,
        )}, transparent 50%), ${theme.palette.background.default}`,
      })}
    >
      {/* Dekoratif yemek emojileri */}
      <Box
        aria-hidden="true"
        sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {FOOD_EMOJI.map((emoji, i) => (
          <Box
            key={emoji}
            component="span"
            sx={{
              position: "absolute",
              fontSize: { xs: 28, sm: 40 },
              opacity: 0.18,
              top: `${[8, 20, 72, 84, 45, 60][i]}%`,
              left: `${[6, 82, 10, 78, 92, 3][i]}%`,
              transform: `rotate(${[-12, 14, 8, -18, 20, -6][i]}deg)`,
            }}
          >
            {emoji}
          </Box>
        ))}
      </Box>

      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 5 },
          borderRadius: 5,
          boxShadow: "0 20px 50px -20px rgba(194, 65, 12, 0.35)",
        }}
      >
        <Stack alignItems="center" textAlign="center" spacing={1.5}>
          <Box
            sx={(theme) => ({
              width: 72,
              height: 72,
              borderRadius: "22px",
              display: "grid",
              placeItems: "center",
              fontSize: 38,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              boxShadow: `0 10px 24px -8px ${alpha(theme.palette.primary.main, 0.6)}`,
            })}
            aria-hidden="true"
          >
            🍳
          </Box>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontSize: { xs: 32, sm: 38 } }}
          >
            Tarif Kitabım
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 320 }}>
            Haftalık planla, tariflerini sakla, PDF olarak paylaş
          </Typography>
        </Stack>

        <Stack
          component="ul"
          spacing={2}
          sx={{ listStyle: "none", p: 0, my: 4 }}
        >
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Stack
              component="li"
              key={title}
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={(theme) => ({
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                })}
              >
                <Icon />
              </Box>
              <Box>
                <Typography variant="subtitle2" component="p" fontWeight={700}>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {text}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          size="large"
          variant="outlined"
          onClick={handleGoogleSignIn}
          disabled={loading || authLoading}
          startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
          sx={{
            py: 1.5,
            bgcolor: "background.paper",
            color: "text.primary",
            borderColor: "divider",
            "&:hover": {
              bgcolor: "background.default",
              borderColor: "text.secondary",
            },
          }}
        >
          {loading ? "Giriş yapılıyor…" : "Google ile Giriş Yap"}
        </Button>

        <Typography
          variant="caption"
          color="text.secondary"
          component="p"
          textAlign="center"
          sx={{ mt: 3 }}
        >
          Giriş yaparak planlarınızı ve tariflerinizi her cihazdan erişilebilir
          şekilde saklarsınız.{" "}
          <Link component={RouterLink} to="/privacy" underline="hover">
            Gizlilik Politikası
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
