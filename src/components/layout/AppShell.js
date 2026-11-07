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
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import { useMeals } from "../../context/MealContext";
import UserSearch from "../auth/UserSearch";
import SignOutButton from "../auth/SignOut";
import ConsentBanner from "../ads/ConsentBanner";
import { useNativeBanner } from "../ads/AdBanner";
import { initAds } from "../../services/ads";
import { isNativeApp } from "../../services/platform";
import { useI18n } from "../../i18n";
import LanguageSwitcher from "../common/LanguageSwitcher";
import PublicLayout, { isPublicContentPath } from "../public/PublicLayout";

export const BOTTOM_NAV_HEIGHT = 64;

const PAGE_TITLES = [
  ["/recipes/", "recipe"],
  ["/recipes", "recipes"],
  ["/export", "export"],
  ["/profile", "profile"],
  ["/privacy", "privacy"],
  ["/login", "login"],
];

/** Sayfa başlığını (sekme adı) rotaya ve dile göre ayarlar. */
const usePageTitle = (pathname, skip) => {
  const { t } = useI18n();
  useEffect(() => {
    // Herkese açık içerik sayfaları kendi başlıklarını ayarlar.
    if (skip) return;
    const match = PAGE_TITLES.find(([prefix]) => pathname.startsWith(prefix));
    const page = t(`shell.pageTitles.${match ? match[1] : "planner"}`);
    document.title = `${page} | ${t("common.appName")}`;
  }, [pathname, t, skip]);
};

const NAV_ITEMS = [
  { to: "/", key: "planner", icon: <CalendarMonthRoundedIcon /> },
  {
    to: "/recipes",
    key: "recipes",
    short: "recipesShort",
    icon: <MenuBookRoundedIcon />,
  },
  { to: "/export", key: "pdf", icon: <PictureAsPdfRoundedIcon /> },
];

/** Aktif menü öğesini mevcut yola göre belirler. */
const activeIndex = (pathname) => {
  if (pathname.startsWith("/recipes")) return 1;
  if (pathname.startsWith("/export")) return 2;
  if (pathname.startsWith("/profile")) return 3;
  if (pathname === "/") return 0;
  return false;
};

const Logo = () => {
  const { t } = useI18n();
  return (
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
        {t("common.appName")}
      </Typography>
    </Box>
  );
};

const UserAvatar = ({ user, size = 32 }) => (
  <Avatar
    src={user?.photoURL || undefined}
    alt={user?.displayName || ""}
    sx={{ width: size, height: size, bgcolor: "primary.main", fontSize: 14 }}
  >
    {(user?.displayName || "K").charAt(0).toUpperCase()}
  </Avatar>
);

/** Küçük ekranlarda kullanıcı arama: üst çubuktaki ikon + tam ekran arama. */
const MobileSearch = () => {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <>
      <IconButton
        aria-label={t("shell.searchUsers")}
        onClick={() => setOpen(true)}
      >
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
          <Box sx={{ flexGrow: 1 }}>{t("shell.searchUsersTitle")}</Box>
          <IconButton aria-label={t("common.actions.close")} onClick={close}>
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
            {t("shell.searchHint")}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};

const UserMenu = ({ user }) => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);
  const go = (path) => {
    close();
    navigate(path);
  };

  return (
    <>
      <Tooltip title={t("shell.account")}>
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label={t("shell.accountMenu")}
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
            {user.displayName || t("shell.user")}
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
          {t("shell.myProfile")}
        </MenuItem>
        <MenuItem onClick={() => go("/tarifler")}>
          <ListItemIcon>
            <RestaurantMenuRoundedIcon fontSize="small" />
          </ListItemIcon>
          {t("public.nav.publicRecipes")}
        </MenuItem>
        <MenuItem onClick={() => go("/privacy")}>
          <ListItemIcon>
            <PrivacyTipOutlinedIcon fontSize="small" />
          </ListItemIcon>
          {t("shell.privacy")}
        </MenuItem>
        <Box
          sx={{ px: 2, py: 1, display: "flex", alignItems: "center", gap: 1.5 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ flexGrow: 1 }}
          >
            {t("common.language")}
          </Typography>
          <LanguageSwitcher />
        </Box>
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
  const { user, authLoading } = useMeals();
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const current = activeIndex(location.pathname);
  const { pathname } = location;
  const showChrome = Boolean(user) && pathname !== "/login";
  const isContentPath = isPublicContentPath(pathname);
  // Oturum açmamış ziyaretçiler: içerik sayfalarında ve (oturum durumu
  // belli olunca) ana sayfada herkese açık üst menü + alt bilgi.
  const showPublic =
    !user && (isContentPath || (pathname === "/" && !authLoading));
  usePageTitle(pathname, isContentPath || showPublic);

  useEffect(() => {
    initAds();
  }, []);

  // Android geri tuşu: geçmişte geri git, yoksa uygulamadan çık.
  useEffect(() => {
    if (!isNativeApp()) return undefined;
    let handle;
    import("@capacitor/app")
      .then(({ App }) =>
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack && window.history.length > 1) window.history.back();
          else App.exitApp();
        }),
      )
      .then((h) => {
        handle = h;
      })
      .catch(() => {});
    return () => {
      if (handle) handle.remove();
    };
  }, []);

  const { bannerHeight } = useNativeBanner({
    enabled: showChrome && location.pathname !== "/privacy",
  });
  const bottomOffset = bannerHeight || 0;

  if (showPublic) {
    return (
      <>
        <PublicLayout>{children}</PublicLayout>
        <ConsentBanner bottomOffset={{ xs: 16, md: 16 }} />
      </>
    );
  }

  if (!showChrome) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          pt: "env(safe-area-inset-top)",
        }}
      >
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
      <AppBar
        position="sticky"
        elevation={0}
        className="no-print"
        sx={{ pt: "env(safe-area-inset-top)" }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ gap: 1, minHeight: { xs: 56, md: 68 } }}
          >
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
                      bgcolor:
                        current === i ? "rgba(194,65,12,0.08)" : "transparent",
                    }}
                  >
                    {t(`shell.nav.${item.key}`)}
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
                label={t(`shell.nav.${item.short || item.key}`)}
                icon={item.icon}
              />
            ))}
            <BottomNavigationAction
              label={t("shell.nav.profile")}
              icon={<PersonRoundedIcon />}
            />
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
              © {new Date().getFullYear()} {t("common.appName")}
            </Typography>
            <Typography
              variant="body2"
              component={Link}
              to="/privacy"
              color="text.secondary"
              sx={{
                textDecoration: "none",
                "&:hover": { color: "primary.main" },
              }}
            >
              {t("shell.privacy")}
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
