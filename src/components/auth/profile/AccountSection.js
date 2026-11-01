import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  DeleteForever as DeleteForeverIcon,
  PrivacyTip as PrivacyTipIcon,
} from "@mui/icons-material";
import SignOutButton from "../SignOut";
import { CONTACT_EMAIL } from "./utils";

const DELETE_SUBJECT = encodeURIComponent("Hesap silme talebi");

/** Kendi profilinde gösterilen hesap ayarları bölümü. */
const AccountSection = ({ email }) => {
  const deleteBody = encodeURIComponent(
    `Merhaba,\n\nTarif Kitabım hesabımın ve tüm verilerimin silinmesini talep ediyorum.\n\nHesap e-postası: ${
      email || ""
    }\n`,
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${DELETE_SUBJECT}&body=${deleteBody}`;

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 4, mt: 4, overflow: "hidden" }}
    >
      <Typography variant="h6" component="h2" sx={{ px: 2.5, pt: 2, pb: 1 }}>
        Hesap
      </Typography>
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/privacy">
            <ListItemIcon>
              <PrivacyTipIcon />
            </ListItemIcon>
            <ListItemText primary="Gizlilik Politikası" />
            <ChevronRightIcon color="action" />
          </ListItemButton>
        </ListItem>
        <ListItem
          sx={{
            alignItems: "flex-start",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <ListItemIcon sx={{ mt: 0.5 }}>
            <DeleteForeverIcon color="error" />
          </ListItemIcon>
          <ListItemText
            primary="Hesabımı sil"
            secondaryTypographyProps={{ component: "div" }}
            secondary={
              <>
                Hesabınızın ve tüm verilerinizin (tarifler, planlar,
                kaydedilenler) kalıcı olarak silinmesi için{" "}
                <Link href={mailto} underline="hover">
                  {CONTACT_EMAIL}
                </Link>{" "}
                adresine hesabınıza bağlı e-posta adresinden yazın. Talebiniz en
                geç 30 gün içinde işleme alınır.
              </>
            }
          />
        </ListItem>
      </List>
      <Box sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: "divider" }}>
        <SignOutButton fullWidth />
      </Box>
    </Paper>
  );
};

export default AccountSection;
