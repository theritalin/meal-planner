import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Edit as EditIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { getInitials } from "./utils";
import FollowListDialog from "./FollowListDialog";

const Stat = ({ value, label, onClick }) => {
  const content = (
    <>
      <Typography variant="h6" component="p" sx={{ lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </>
  );
  if (!onClick) {
    return <Box sx={{ textAlign: "center", minWidth: 64 }}>{content}</Box>;
  }
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`${label} listesini göster`}
      sx={{
        flexDirection: "column",
        minWidth: 64,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      {content}
    </ButtonBase>
  );
};

/**
 * Profil başlığı: avatar, isim, (kendi profilinde) e-posta, hakkında metni,
 * istatistikler ve takip / düzenle butonu.
 */
const ProfileHeader = ({
  profile,
  isOwnProfile,
  stats,
  isFollowing,
  followBusy,
  onToggleFollow,
  onEdit,
  currentUid,
}) => {
  const name = profile.displayName || "İsimsiz Kullanıcı";
  const [list, setList] = useState(null); // 'followers' | 'following' | null
  const followers = Array.isArray(profile.followers) ? profile.followers : [];
  const following = Array.isArray(profile.following) ? profile.following : [];

  return (
    <Paper
      variant="outlined"
      sx={{ overflow: "hidden", borderRadius: 4, mb: 3 }}
    >
      <Box
        sx={(theme) => ({
          height: { xs: 72, sm: 96 },
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.85,
          )}, ${alpha(theme.palette.primary.light, 0.7)} 60%, ${alpha(
            theme.palette.secondary.main,
            0.6,
          )})`,
        })}
      />
      <Box sx={{ px: { xs: 2, sm: 4 }, pb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 3 }}
          alignItems={{ xs: "center", sm: "flex-end" }}
          sx={{ mt: { xs: -5, sm: -6 } }}
        >
          <Avatar
            src={profile.photoURL || undefined}
            alt={name}
            sx={{
              width: { xs: 96, sm: 112 },
              height: { xs: 96, sm: 112 },
              fontSize: 36,
              bgcolor: "primary.main",
              border: "4px solid",
              borderColor: "background.paper",
            }}
          >
            {getInitials(profile.displayName)}
          </Avatar>

          <Box
            sx={{
              flexGrow: 1,
              minWidth: 0,
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontSize: { xs: 26, sm: 32 } }}
            >
              {name}
            </Typography>
            {isOwnProfile && profile.email && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {profile.email}
              </Typography>
            )}
          </Box>

          <Box>
            {isOwnProfile ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEdit}
              >
                Profili Düzenle
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                startIcon={
                  followBusy ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : isFollowing ? (
                    <PersonRemoveIcon />
                  ) : (
                    <PersonAddIcon />
                  )
                }
                onClick={onToggleFollow}
                disabled={followBusy}
              >
                {isFollowing ? "Takibi Bırak" : "Takip Et"}
              </Button>
            )}
          </Box>
        </Stack>

        {profile.about ? (
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              whiteSpace: "pre-line",
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            {profile.about}
          </Typography>
        ) : (
          isOwnProfile && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2, textAlign: { xs: "center", sm: "left" } }}
            >
              Henüz kendinizden bahsetmediniz. "Profili Düzenle" ile kısa bir
              tanıtım ekleyebilirsiniz.
            </Typography>
          )
        )}

        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 3 }}
          justifyContent={{ xs: "space-around", sm: "flex-start" }}
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Stat value={stats.recipes} label="Tarif" />
          <Stat value={stats.saved} label="Kaydedilen" />
          <Stat
            value={stats.followers}
            label="Takipçi"
            onClick={() => setList("followers")}
          />
          <Stat
            value={stats.following}
            label="Takip"
            onClick={() => setList("following")}
          />
        </Stack>
      </Box>
      <FollowListDialog
        open={list !== null}
        onClose={() => setList(null)}
        title={list === "following" ? "Takip Edilenler" : "Takipçiler"}
        uids={list === "following" ? following : followers}
        currentUid={currentUid}
      />
    </Paper>
  );
};

export default ProfileHeader;
