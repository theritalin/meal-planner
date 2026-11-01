import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Container,
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
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useMeals } from "../../context/MealContext";
import UserSearch from "../auth/UserSearch";

export const BOTTOM_NAV_HEIGHT = 64;

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

const UserMenu = ({ user }) => {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const close = () => setAnchor(null);
  const go = (path) => {
    close();
    navigate(path);
  };

  const handleSignOut = async () => {
    close();
    await signOut(auth);
    navigate("/login");
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
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Çıkış Yap
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * Uygulama kabuğu: masaüstünde üst menü, mobilde alt gezinme çubuğu.
 * `bottomOffset`: native reklam bandı gibi alttaki ek yükseklik (px).
 */
const AppShell = ({ children, bottomOffset = 0 }) => {
  const { user } = useMeals();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const current = activeIndex(location.pathname);
  const showChrome = Boolean(user) && location.pathname !== "/login";

  if (!showChrome) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {children}
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
            {!isMobile && (
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
    </Box>
  );
};

export default AppShell;
