import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import { useMeals } from "../../context/MealContext";
import UserSearch from "../auth/UserSearch";
import SignOutButton from "../auth/SignOut";
import ConsentBanner from "../ads/ConsentBanner";
import { useNativeBanner } from "../ads/AdBanner";
import { initAds } from "../../services/ads";

export const BOTTOM_NAV_HEIGHT = 64;

const SITE_NAME = "Tarif Kitabım";
const PAGE_TITLES = [
  ["/recipes/", "Tarif"],
  ["/recipes", "Tarif Kitabım"],
  ["/export", "PDF Olarak Dışa Aktar"],
  ["/profile", "Profil"],
  ["/privacy", "Gizlilik Politikası"],
  ["/login", "Giriş Yap — Ücretsiz Haftalık Yemek Planlayıcı"],
];

/** Sayfa başlığını (sekme adı) rotaya göre ayarlar. */
const usePageTitle = (pathname) => {
  useEffect(() => {
    const match = PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix));
    document.title = match
      ? `${match[1]} | ${SITE_NAME}`
      : `Haftalık Plan | ${SITE_NAME}`;
  }, [pathname]);
};

const NAV_ITEMS = [
  { to: "/", label: "Planlayıcı", icon: <CalendarMonthRoundedIcon /> },
  { to: "/recipes", label: "Tarif Kitabım", icon: <MenuBookRoundedIcon /> },
  { to: "/export", label: "PDF", icon: <PictureAsPdfRoundedIcon /> },
];

/** Aktif menü öğesini mevcut yola göre belirler. */
const activeIndex = (pathname) => {
  if (pathname.startsWith("/recipes")) return 1;
  if (pathname.startsWith("/export")) return 2;
  if (pathname.startsWith("/profile")) return 3;
  if (pathname === "/") return 0;
  return false;
};

const Logo = () => (
  <Box
    component={Link}
    to="/"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      textDecoration: "none",
      color: "text.primary",
      mr: 3,
    }}
  >
    <Box
      component="img"
      src={`${process.env.PUBLIC_URL}/icon.svg`}
      alt=""
      sx={{ width: 34, height: 34 }}
    />
    <Typography
      variant="h6"
      sx={{ fontFamily: '"Playfair Display", Georgia, serif', lineHeight: 1 }}
    >
      Tarif Kitabım
    </Typography>
  </Box>
);

const UserAvatar = ({ user, size = 32 }) => (
  <Avatar
    src={user?.photoURL || undefined}
    alt={user?.displayName || "Kullanıcı"}
    sx={{ width: size, height: size, bgcolor: "primary.main", fontSize: 14 }}
  >
    {(user?.displayName || "K").charAt(0).toUpperCase()}
  </Avatar>
);

/** Küçük ekranlarda kullanıcı arama: üst çubuktaki ikon + tam ekran arama. */
const MobileSearch = () => {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <IconButton aria-label="Kullanıcı ara" onClick={() => setOpen(true)}>
        <SearchRoundedIcon />
      </IconButton>
      <Dialog
        open={open}
        onClose={close}
        fullScreen
        PaperProps={{ sx: { borderRadius: 0 } }}
      >
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}
        >
          <Box sx={{ flexGrow: 1 }}>Kullanıcı Ara</Box>
          <IconButton aria-label="Kapat" onClick={close}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <UserSearch size="medium" onNavigate={close} />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            İsim ya da e-posta ile arayın (en az 2 harf).
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

const UserMenu = ({ user }) => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);
  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <>
      <Tooltip title="Hesabım">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="Hesap menüsü"
          size="small"
        >
          <UserAvatar user={user} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>
            {user.displayName || "Kullanıcı"}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => go(`/profile/${user.uid}`)}>
          <ListItemIcon>
            <PersonRoundedIcon fontSize="small" />
          </ListItemIcon>
          Profilim
        </MenuItem>
        <MenuItem onClick={() => go("/privacy")}>
          <ListItemIcon>
            <PrivacyTipOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Gizlilik Politikası
        </MenuItem>
        <Divider />
        <SignOutButton variant="menuItem" onDone={close} />
      </Menu>
    </>
  );
};

/**
 * Uygulama kabuğu: masaüstünde üst menü, mobilde alt gezinme çubuğu.
 * Android'de (Capacitor) alttaki AdMob bandı için yer açar.
 */
const AppShell = ({ children }) => {
  const { user } = useMeals();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const current = activeIndex(location.pathname);
  const showChrome = Boolean(user) && location.pathname !== "/login";
  usePageTitle(location.pathname);

  useEffect(() => {
    initAds();
  }, []);

  const { bannerHeight } = useNativeBanner({
    enabled: showChrome && location.pathname !== "/privacy",
  });
  const bottomOffset = bannerHeight || 0;

  if (!showChrome) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {children}
        <ConsentBanner bottomOffset={{ xs: 16, md: 16 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      <AppBar position="sticky" elevation={0} className="no-print">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 56, md: 68 } }}>
            <Logo />
            {!isMobile && (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {NAV_ITEMS.map((item, i) => (
                  <Button
                    key={item.to}
                    component={Link}
                    to={item.to}
                    startIcon={item.icon}
                    color={current === i ? "primary" : "inherit"}
                    sx={{
                      bgcolor: current === i ? "rgba(194,65,12,0.08)" : "transparent",
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {isMobile ? (
              <MobileSearch />
            ) : (
              <Box sx={{ width: 260 }}>
                <UserSearch />
              </Box>
            )}
            <UserMenu user={user} />
          </Toolbar>
        </Container>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 2, md: 4 },
          pb: {
            xs: `${BOTTOM_NAV_HEIGHT + 24 + bottomOffset}px`,
            md: `${32 + bottomOffset}px`,
          },
        }}
      >
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {isMobile ? (
        <Paper
          component="nav"
          className="no-print"
          elevation={0}
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: bottomOffset,
            zIndex: (t) => t.zIndex.appBar,
            borderTop: 1,
            borderColor: "divider",
            pb: "env(safe-area-inset-bottom)",
          }}
        >
          <BottomNavigation
            showLabels
            value={current}
            onChange={(_, index) => {
              const target =
                index === 3 ? `/profile/${user.uid}` : NAV_ITEMS[index].to;
              navigate(target);
            }}
            sx={{ height: BOTTOM_NAV_HEIGHT, bgcolor: "transparent" }}
          >
            {NAV_ITEMS.map((item) => (
              <BottomNavigationAction
                key={item.to}
                label={item.label === "Tarif Kitabım" ? "Tarifler" : item.label}
                icon={item.icon}
              />
            ))}
            <BottomNavigationAction label="Profil" icon={<PersonRoundedIcon />} />
          </BottomNavigation>
        </Paper>
      ) : (
        <Box
          component="footer"
          className="no-print"
          sx={{ py: 3, borderTop: 1, borderColor: "divider" }}
        >
          <Container
            maxWidth="xl"
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Tarif Kitabım
            </Typography>
            <Typography
              variant="body2"
              component={Link}
              to="/privacy"
              color="text.secondary"
              sx={{ textDecoration: "none", "&:hover": { color: "primary.main" } }}
            >
              Gizlilik Politikası
            </Typography>
          </Container>
        </Box>
      )}
      <ConsentBanner
        bottomOffset={{ xs: BOTTOM_NAV_HEIGHT + 24 + bottomOffset, md: 16 }}
      />
    </Box>
  );
};

export default AppShell;
