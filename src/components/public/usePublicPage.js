import { useEffect } from "react";
import { loadAdSense } from "../../services/ads";
import { useI18n } from "../../i18n";

/** AdSense betiğini yalnızca herkese açık içerik sayfalarında yükler. */
export const usePublicAds = () => {
  useEffect(() => {
    loadAdSense();
  }, []);
};

let defaultDescription = null;
const metaDescription = () =>
  typeof document === "undefined"
    ? null
    : document.querySelector('meta[name="description"]');

/**
 * Sekme başlığını ve meta açıklamayı ayarlar; sayfadan çıkınca açıklamayı
 * index.html'deki varsayılana geri döndürür.
 */
export const usePageMeta = (title, description) => {
  const { t } = useI18n();
  const appName = t("common.appName");
  useEffect(() => {
    if (title) document.title = `${title} | ${appName}`;
    const meta = metaDescription();
    if (meta) {
      if (defaultDescription === null) {
        defaultDescription = meta.getAttribute("content") || "";
      }
      if (description) meta.setAttribute("content", description);
    }
  }, [title, description, appName]);

  useEffect(
    () => () => {
      const meta = metaDescription();
      if (meta && defaultDescription !== null) {
        meta.setAttribute("content", defaultDescription);
      }
    },
    [],
  );
};

/** İçerik sayfaları için ikisi bir arada. */
const usePublicPage = (title, description) => {
  usePublicAds();
  usePageMeta(title, description);
};

export default usePublicPage;
