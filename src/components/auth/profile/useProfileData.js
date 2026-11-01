import { useCallback, useEffect, useState } from "react";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { getUserProfile, updateUserProfile } from "../../../services/firebase";

/**
 * Profil sayfasının veri katmanı.
 * - `profile`: görüntülenen kullanıcının Firestore belgesi (users/{uid})
 * - `isFollowing`: oturumdaki kullanıcı bu profili takip ediyor mu
 * - `toggleFollow()`: takip et / bırak. Firestore alan adları korunur:
 *   users/{me}.following ve users/{them}.followers (uid dizileri).
 */
const useProfileData = (profileUid, currentUser) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const isOwnProfile = Boolean(currentUser && profileUid === currentUser.uid);

  useEffect(() => {
    if (!profileUid || !currentUser) return undefined;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      const [target, me] = await Promise.all([
        getUserProfile(profileUid),
        isOwnProfile ? Promise.resolve(null) : getUserProfile(currentUser.uid),
      ]);
      if (cancelled) return;

      if (!target && !isOwnProfile) {
        setNotFound(true);
        setProfile(null);
      } else {
        // Kendi profilimiz için Firestore belgesi henüz yoksa auth bilgisiyle doldur.
        setProfile({
          uid: profileUid,
          ...(isOwnProfile
            ? {
                displayName: currentUser.displayName || "",
                email: currentUser.email || "",
                photoURL: currentUser.photoURL || "",
              }
            : {}),
          ...(target || {}),
        });
      }
      setIsFollowing(
        !isOwnProfile &&
          Array.isArray(me?.following) &&
          me.following.includes(profileUid),
      );
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileUid, currentUser, isOwnProfile]);

  const toggleFollow = useCallback(async () => {
    if (!currentUser || isOwnProfile || !profile) return;
    const willFollow = !isFollowing;
    const op = willFollow ? arrayUnion : arrayRemove;
    setFollowBusy(true);
    try {
      await updateUserProfile(currentUser.uid, {
        following: op(profile.uid),
      });
      await updateUserProfile(profile.uid, { followers: op(currentUser.uid) });
      setIsFollowing(willFollow);
      setProfile((prev) => {
        const followers = Array.isArray(prev.followers) ? prev.followers : [];
        return {
          ...prev,
          followers: willFollow
            ? [
                ...followers.filter((id) => id !== currentUser.uid),
                currentUser.uid,
              ]
            : followers.filter((id) => id !== currentUser.uid),
        };
      });
      return willFollow;
    } finally {
      setFollowBusy(false);
    }
  }, [currentUser, isOwnProfile, isFollowing, profile]);

  /** Yerel profil durumunu (kaydetme sonrası) günceller. */
  const patchProfile = useCallback((updates) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  return {
    profile,
    loading,
    notFound,
    isOwnProfile,
    isFollowing,
    followBusy,
    toggleFollow,
    patchProfile,
  };
};

export default useProfileData;
