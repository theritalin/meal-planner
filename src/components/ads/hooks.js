import { useEffect, useState } from 'react';
import {
  getConsent,
  subscribeConsent,
  isNativeAdsActive,
  showBanner,
  hideBanner,
  onBannerSizeChange,
} from '../../services/ads';

/** Web reklam onayı: 'granted' | 'denied' | null. Değişimlere abone olur. */
export const useAdsConsent = () => {
  const [consent, setConsentState] = useState(getConsent);
  useEffect(() => subscribeConsent(setConsentState), []);
  return consent;
};

/**
 * Native (Android) uygulamada ekranın altına AdMob banner'ı yerleştirir.
 * Uygulama kabuğunda (App.js) BİR KEZ çağırın. Web'de ve reklamlar kapalıyken no-op.
 *
 * Banner, WebView'un üstüne yerel olarak çizilir ve içeriği örter. Bu yüzden
 * dönen `bannerHeight` kadar:
 *   - alt navigasyonu yukarı kaydırın (BottomNavigation: `bottom: bannerHeight`)
 *   - sayfa içeriğine ek alt boşluk verin (paddingBottom: navHeight + bannerHeight)
 *
 * @param {{ enabled?: boolean }} [opts] enabled=false → banner gizlenir
 *        (ör. /login veya /privacy sayfalarında).
 * @returns {{ isNative: boolean, bannerHeight: number }}
 */
export const useNativeBanner = ({ enabled = true } = {}) => {
  const active = isNativeAdsActive();
  const [bannerHeight, setBannerHeight] = useState(0);

  // Yükseklik dinleyicisi
  useEffect(() => {
    if (!active) return undefined;
    let unsubscribe = () => {};
    let cancelled = false;
    onBannerSizeChange((h) => {
      if (!cancelled) setBannerHeight(Math.max(0, Math.round(h)));
    }).then((fn) => {
      if (cancelled) fn();
      else unsubscribe = fn;
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [active]);

  // Göster / gizle
  useEffect(() => {
    if (!active) return undefined;
    let cancelled = false;
    if (enabled) {
      showBanner().then((ok) => {
        if (!ok && !cancelled) setBannerHeight(0);
      });
    } else {
      hideBanner();
      setBannerHeight(0);
    }
    return () => {
      cancelled = true;
    };
  }, [active, enabled]);

  // Kabuk kaldırılırken banner'ı gizle
  useEffect(() => {
    if (!active) return undefined;
    return () => {
      hideBanner();
    };
  }, [active]);

  return { isNative: active, bannerHeight: active && enabled ? bannerHeight : 0 };
};
