import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { signOutUser } from "../../services/firebase";

/**
 * Yeniden kullanılabilir çıkış butonu.
 *
 * Props:
 * - variant: "button" (varsayılan, kırmızı outlined buton) | "menuItem"
 *   (Menu içinde MenuItem) | "icon" (yalnızca ikon, tooltip'li)
 * - onDone: çıkış başarıyla tamamlandıktan sonra çağrılır (ör. menüyü kapatmak için)
 * - diğer props kök bileşene aktarılır (ör. fullWidth, sx, size)
 *
 * Çıkıştan sonra /login sayfasına yönlendirir.
 */
const SignOutButton = ({ variant = "button", onDone, ...rest }) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOutUser();
      onDone?.();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
      setBusy(false);
    }
  };

  if (variant === "menuItem") {
    return (
      <MenuItem onClick={handleSignOut} disabled={busy} {...rest}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" color="error" />
        </ListItemIcon>
        <ListItemText primaryTypographyProps={{ color: "error" }}>
          Çıkış Yap
        </ListItemText>
      </MenuItem>
    );
  }

  if (variant === "icon") {
    return (
      <Tooltip title="Çıkış Yap">
        <span>
          <IconButton
            aria-label="Çıkış Yap"
            onClick={handleSignOut}
            disabled={busy}
            {...rest}
          >
            {busy ? <CircularProgress size={20} /> : <LogoutIcon />}
          </IconButton>
        </span>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outlined"
      color="error"
      onClick={handleSignOut}
      disabled={busy}
      startIcon={
        busy ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />
      }
      {...rest}
    >
      Çıkış Yap
    </Button>
  );
};

export default SignOutButton;
