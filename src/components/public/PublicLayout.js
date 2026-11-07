import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useI18n } from "../../i18n";
import LanguageSwitcher from "../common/LanguageSwitcher";
import { CONTACT_EMAIL } from "./siteInfo";

export const PUBLIC_NAV = [
  { to: "/tarifler", key: "recipes" },
  { to: "/rehberler", key: "guides" },
  { to: "/hakkimizda", key: "about" },
];

/** Herkese açık içerik yolu mu? (/ hariç: o, oturum durumuna bağlıdır.) */
export const isPublicContentPath = (pathname) =>
  /^\/(tarifler|rehberler|hakkimizda)(\/|$)/.test(pathname);

const isActive = (pathname, to) =>
  pathname === to || pathname.startsWith(`${to}/`);

const PublicLogo = () => {
  const { t } = useI18n();
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        textDecoration: "none",
        color: "text.primary",
        mr: 2,
        minWidth: 0,
      }}
    >
      <Box
        component="img"
        src={`${process.env.PUBLIC_URL}/icon.svg`}
        alt=""
        sx={{ width: 34, height: 34, flexShrink: 0 }}
      />
      <Typography
        variant="h6"
        noWrap
        sx={{ fontFamily: '"Playfair Display", Georgia, serif', lineHeight: 1 }}
      >
        {t("common.appName")}
      </Typography>
    </Box>
  );
};

const PublicHeader = () => {
  const { t } = useI18n();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <AppBar position="sticky" elevation={0} sx={{ pt: "env(safe-area-inset-top)" }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 1, minHeight: { xs: 56, md: 68 } }}>
          <PublicLogo />
          {!isMobile && (
            <Box component="nav" sx={{ display: "flex", gap: 0.5 }}>
              {PUBLIC_NAV.map((item) => {
                const active = isActive(pathname, item.to);
                return (
                  <Button
                    key={item.to}
                    component={RouterLink}
                    to={item.to}
                    color={active ? "primary" : "inherit"}
                    aria-current={active ? "page" : undefined}
                    sx={{ bgcolor: active ? "rgba(194,65,12,0.08)" : "transparent" }}
                  >
                    {t(`public.nav.${item.key}`)}
                  </Button>
                );
              })}
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {!isMobile && <LanguageSwitcher />}
          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            size={isMobile ? "small" : "medium"}
            sx={{ flexShrink: 0 }}
          >
            {t("public.nav.login")}
          </Button>
          {isMobile && (
            <IconButton
              aria-label={t("public.nav.menu")}
              onClick={() => setOpen(true)}
              edge="end"
            >
              <MenuRoundedIcon />
            </IconButton>
          )}
        </Toolbar>
      </Container>
      <Drawer anchor="right" open={open} onClose={close}>
        <Box sx={{ width: 280, p: 2 }} role="navigation">
          <Stack direction="row" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {t("common.appName")}
            </Typography>
            <IconButton aria-label={t("public.nav.closeMenu")} onClick={close}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <List>
            {[{ to: "/", key: "home" }, ...PUBLIC_NAV].map((item) => (
              <ListItemButton
                key={item.to}
                component={RouterLink}
                to={item.to}
                onClick={close}
                selected={
                  item.to === "/" ? pathname === "/" : isActive(pathname, item.to)
                }
              >
                <ListItemText primary={t(`public.nav.${item.key}`)} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
              {t("common.language")}
            </Typography>
            <LanguageSwitcher />
          </Stack>
          <Button
            fullWidth
            variant="contained"
            component={RouterLink}
            to="/login"
            onClick={close}
            sx={{ mt: 2 }}
          >
            {t("public.nav.start")}
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
};

const FooterLink = ({ to, href, children }) => (
  <Link
    component={to ? RouterLink : "a"}
    to={to}
    href={href}
    underline="hover"
    color="text.secondary"
    variant="body2"
    sx={{ display: "block", py: 0.5, "&:hover": { color: "primary.main" } }}
  >
    {children}
  </Link>
);

const FooterTitle = ({ children }) => (
  <Typography variant="subtitle2" component="h2" sx={{ mb: 1 }}>
    {children}
  </Typography>
);

const PublicFooter = () => {
  const { t } = useI18n();
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        py: { xs: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <PublicLogo />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: 340 }}>
              {t("public.footer.tagline")}
            </Typography>
          </Grid>
          <Grid item xs={6} md={2}>
            <FooterTitle>{t("public.footer.explore")}</FooterTitle>
            <FooterLink to="/tarifler">{t("public.nav.recipes")}</FooterLink>
            <FooterLink to="/rehberler">{t("public.nav.guides")}</FooterLink>
            <FooterLink to="/login">{t("public.nav.start")}</FooterLink>
          </Grid>
          <Grid item xs={6} md={2}>
            <FooterTitle>{t("public.footer.info")}</FooterTitle>
            <FooterLink to="/hakkimizda">{t("public.nav.about")}</FooterLink>
            <FooterLink to="/privacy">{t("public.nav.privacy")}</FooterLink>
          </Grid>
          <Grid item xs={12} md={3}>
            <FooterTitle>{t("public.footer.contact")}</FooterTitle>
            <FooterLink href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</FooterLink>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} {t("common.appName")}. {t("public.footer.rights")}
        </Typography>
      </Container>
    </Box>
  );
};

/** Oturum açmamış ziyaretçiler için üst menü + alt bilgi düzeni. */
const PublicLayout = ({ children }) => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      bgcolor: "background.default",
    }}
  >
    <PublicHeader />
    <Box component="main" sx={{ flexGrow: 1 }}>
      {children}
    </Box>
    <PublicFooter />
  </Box>
);

export default PublicLayout;
