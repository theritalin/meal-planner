import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { getUserProfile } from "../../../services/firebase";
import { getInitials } from "./utils";
import { useI18n } from "../../../i18n";

/**
 * Takipçi / takip edilen listesini gösterir; bir kişiye dokununca o kişinin
 * profiline gider.
 *
 * @param {{ open: boolean, onClose: () => void, title: string,
 *           uids: string[], currentUid?: string }} props
 */
const FollowListDialog = ({ open, onClose, title, uids, currentUid }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const key = (uids || []).join(",");

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    const ids = key ? key.split(",") : [];
    setLoading(true);
    Promise.all(ids.map((uid) => getUserProfile(uid)))
      .then((profiles) => {
        if (cancelled) return;
        // Silinmiş hesapları atla.
        setPeople(profiles.filter(Boolean));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, key]);

  const goTo = (uid) => {
    onClose();
    navigate(`/profile/${uid}`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 1 }}>
        <Box sx={{ flexGrow: 1 }}>{title}</Box>
        <IconButton aria-label={t("common.actions.close")} onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, minHeight: 160 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress size={28} />
          </Box>
        ) : people.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ textAlign: "center", py: 5, px: 2 }}
          >
            {t("auth.profile.followList.empty")}
          </Typography>
        ) : (
          <List disablePadding>
            {people.map((person) => (
              <ListItemButton key={person.uid} onClick={() => goTo(person.uid)}>
                <ListItemAvatar>
                  <Avatar
                    src={person.photoURL || undefined}
                    alt={person.displayName || t("auth.user")}
                    sx={{ bgcolor: "primary.main" }}
                  >
                    {getInitials(person.displayName)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    (person.displayName || t("auth.unnamedUser")) +
                    (person.uid === currentUid ? t("auth.you") : "")
                  }
                  secondary={
                    person.about
                      ? person.about.length > 60
                        ? `${person.about.slice(0, 60)}…`
                        : person.about
                      : null
                  }
                  primaryTypographyProps={{ fontWeight: 600, noWrap: true }}
                />
                <ChevronRightRoundedIcon color="action" />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListDialog;
