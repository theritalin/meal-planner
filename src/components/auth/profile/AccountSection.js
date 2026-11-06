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
  Translate as TranslateIcon,
} from "@mui/icons-material";
import SignOutButton from "../SignOut";
import { CONTACT_EMAIL } from "./utils";
import { useI18n } from "../../../i18n";
import LanguageSwitcher from "../../common/LanguageSwitcher";

/** Kendi profilinde gösterilen hesap ayarları bölümü. */
const AccountSection = ({ email }) => {
  const { t } = useI18n();
  const subject = encodeURIComponent(t("auth.profile.account.mailSubject"));
  const deleteBody = encodeURIComponent(
    t("auth.profile.account.mailBody", { email: email || "" }),
  );
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${deleteBody}`;

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 4, mt: 4, overflow: "hidden" }}
    >
      <Typography variant="h6" component="h2" sx={{ px: 2.5, pt: 2, pb: 1 }}>
        {t("auth.profile.account.title")}
      </Typography>
      <List disablePadding>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/privacy">
            <ListItemIcon>
              <PrivacyTipIcon />
            </ListItemIcon>
            <ListItemText primary={t("auth.profile.account.privacy")} />
            <ChevronRightIcon color="action" />
          </ListItemButton>
        </ListItem>
        <ListItem sx={{ borderTop: 1, borderColor: "divider", gap: 1 }}>
          <ListItemIcon>
            <TranslateIcon />
          </ListItemIcon>
          <ListItemText primary={t("auth.profile.account.language")} />
          <LanguageSwitcher />
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
            primary={t("auth.profile.account.deleteTitle")}
            secondaryTypographyProps={{ component: "div" }}
            secondary={
              <>
                {t("auth.profile.account.deleteBefore")}{" "}
                <Link href={mailto} underline="hover">
                  {CONTACT_EMAIL}
                </Link>{" "}
                {t("auth.profile.account.deleteAfter")}
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
