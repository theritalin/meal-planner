import { createTheme, alpha } from "@mui/material/styles";

// Uygulama genelinde kullanılan renk paleti.
// Sıcak, mutfak temalı bir görünüm: domates kırmızısı + zeytin yeşili.
export const palette = {
  primary: "#C2410C", // turuncu-kırmızı (domates)
  primaryLight: "#FB923C",
  secondary: "#4D7C0F", // zeytin yeşili
  background: "#FBF7F2", // krem
  paper: "#FFFFFF",
  text: "#1C1917",
  textMuted: "#78716C",
  border: "#E7E0D8",
  breakfast: "#F59E0B",
  lunch: "#16A34A",
  dinner: "#7C3AED",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: palette.primary, light: palette.primaryLight },
    secondary: { main: palette.secondary },
    background: { default: palette.background, paper: palette.paper },
    text: { primary: palette.text, secondary: palette.textMuted },
    divider: palette.border,
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h2: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h3: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h4: { fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, paddingInline: 16 } },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        outlined: { borderColor: palette.border },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${palette.border}`,
          transition: "box-shadow .2s ease, transform .2s ease",
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(palette.paper, 0.9),
          backdropFilter: "blur(8px)",
          color: palette.text,
          borderBottom: `1px solid ${palette.border}`,
        },
      },
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiTextField: { defaultProps: { size: "small" } },
  },
});

export default theme;
