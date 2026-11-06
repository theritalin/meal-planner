import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useI18n } from "../../../i18n";

const NAME_MAX = 50;
const ABOUT_MAX = 300;

/** Görünen ad ve "hakkımda" metnini düzenleme penceresi. */
const EditProfileDialog = ({ open, profile, onClose, onSave }) => {
  const { t } = useI18n();
  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(profile?.displayName || "");
      setAbout(profile?.about || "");
    }
  }, [open, profile]);

  const trimmedName = displayName.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trimmedName) return;
    setSaving(true);
    try {
      await onSave({ displayName: trimmedName, about: about.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
    >
      <DialogTitle>{t("auth.profile.edit.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label={t("auth.profile.edit.name")}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value.slice(0, NAME_MAX))}
            required
            fullWidth
            autoFocus
            error={!trimmedName}
            helperText={
              !trimmedName ? t("auth.profile.edit.nameRequired") : " "
            }
          />
          <TextField
            label={t("auth.profile.edit.about")}
            value={about}
            onChange={(e) => setAbout(e.target.value.slice(0, ABOUT_MAX))}
            multiline
            minRows={3}
            fullWidth
            placeholder={t("auth.profile.edit.aboutPlaceholder")}
            helperText={`${about.length}/${ABOUT_MAX}`}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          {t("auth.profile.edit.cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={saving || !trimmedName}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {t("auth.profile.edit.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileDialog;
