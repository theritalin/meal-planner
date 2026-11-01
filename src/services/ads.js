/**
 * Reklam soyutlama katmanı.
 *
 *  - Web     → Google AdSense (adsbygoogle.js yalnızca gerektiğinde, tembel yüklenir)
 *  - Android → Google AdMob (@capacitor-community/admob, dinamik import ile)
 *
 * Kurallar:
 *  - REACT_APP_ADS_ENABLED !== 'true' ise her fonksiyon sessizce no-op'tur.
 *  - Reklam yükleme hataları asla uygulamayı çökertmez (her şey try/catch içinde).
 *  - Native eklenti dinamik import edildiği için web paketine yük getirmez.
 *
 * Ayrıntılar: docs/ADS.md
 */
import { isNativeApp } from './platform';

/* -------------------------------------------------------------------------- */
/* Yapılandırma                                                               */
/* -------------------------------------------------------------------------- */

// Google'ın resmi TEST reklam birimleri (https://developers.google.com/admob/android/test-ads)
export const ADMOB_TEST_IDS = {
  appIdAndroid: 'ca-app-pub-3940256099942544~3347511713',
  banner: 'ca-app-pub-3940256099942544/9214589741', // uyarlanabilir (adaptive) banner
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
};

const env = process.env;
const trimmed = (v) => (typeof v === 'string' ? v.trim() : '');

// CRA ortam değişkenlerini derleme anında sabitler; bu yüzden her slot açıkça yazılı.
const ADSENSE_SLOTS = {
  default: trimmed(env.REACT_APP_ADSENSE_SLOT_DEFAULT),
  planner: trimmed(env.REACT_APP_ADSENSE_SLOT_PLANNER),
  recipes: trimmed(env.REACT_APP_ADSENSE_SLOT_RECIPES),
  recipeDetail: trimmed(env.REACT_APP_ADSENSE_SLOT_RECIPE_DETAIL),
  export: trimmed(env.REACT_APP_ADSENSE_SLOT_EXPORT),
};

const config = Object.freeze({
  enabled: trimmed(env.REACT_APP_ADS_ENABLED) === 'true',
  testMode: trimmed(env.REACT_APP_ADS_TEST_MODE) !== 'false', // varsayılan: true
  debug: trimmed(env.REACT_APP_ADS_DEBUG) === 'true',
  adsenseClient: trimmed(env.REACT_APP_ADSENSE_CLIENT),
  adsenseSlots: ADSENSE_SLOTS,
  admobAppId: trimmed(env.REACT_APP_ADMOB_APP_ID),
  admobBannerId: trimmed(env.REACT_APP_ADMOB_BANNER_ID),
  admobInterstitialId: trimmed(env.REACT_APP_ADMOB_INTERSTITIAL_ID),
  admobTestDeviceIds: trimmed(env.REACT_APP_ADMOB_TEST_DEVICE_IDS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  interstitialMinIntervalMs: 3 * 60 * 1000, // en fazla 3 dakikada bir
  interstitialMinActions: 2, // oturumdaki ilk eylemde asla gösterme
});

export const getAdsConfig = () => config;

/** Reklamlar genel olarak açık mı? */
export const adsEnabled = () => config.enabled;

/** Web'de AdSense kullanılabilir mi? (açık + client tanımlı + native değil) */
export const isWebAdsActive = () =>
  config.enabled && !!config.adsenseClient && !isNativeApp();

/** Native'de AdMob kullanılabilir mi? */
export const isNativeAdsActive = () => config.enabled && isNativeApp();

/** Bir yerleşim (placement) için AdSense slot kimliği. */
export const getAdSenseSlot = (placement) =>
  (placement && config.adsenseSlots[placement]) || config.adsenseSlots.default || '';

const bannerAdId = () => (config.testMode ? ADMOB_TEST_IDS.banner : config.admobBannerId);
const interstitialAdId = () =>
  config.testMode ? ADMOB_TEST_IDS.interstitial : config.admobInterstitialId;

/* -------------------------------------------------------------------------- */
/* Güvenli localStorage                                                       */
/* -------------------------------------------------------------------------- */

const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null || value === undefined) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, String(value));
    } catch (e) {
      /* gizli sekme / engellenmiş depolama: yoksay */
    }
  },
};

const KEYS = {
  consent: 'mp_ads_consent', // 'granted' | 'denied'
  lastInterstitial: 'mp_ads_last_interstitial', // epoch ms
};

/* -------------------------------------------------------------------------- */
/* Onay (consent)                                                             */
/* -------------------------------------------------------------------------- */

const consentListeners = new Set();

/** Web onayı: 'granted' | 'denied' | null (henüz seçilmedi). */
export const getConsent = () => {
  const v = storage.get(KEYS.consent);
  return v === 'granted' || v === 'denied' ? v : null;
};

export const setConsent = (value) => {
  storage.set(KEYS.consent, value === 'granted' || value === 'denied' ? value : null);
  const current = getConsent();
  consentListeners.forEach((fn) => {
    try {
      fn(current);
    } catch (e) {
      /* dinleyici hatası uygulamayı etkilemesin */
    }
  });
};

export const subscribeConsent = (fn) => {
  consentListeners.add(fn);
  return () => consentListeners.delete(fn);
};

/**
 * Kullanıcının reklam/gizlilik tercihlerini yeniden açar.
 *  - Native: AdMob UMP "gizlilik seçenekleri" formu
 *  - Web: kayıtlı seçimi siler → ConsentBanner yeniden görünür
 */
export const openConsentPreferences = async () => {
  if (!config.enabled) return;
  if (isNativeApp()) {
    const AdMob = await loadAdMob();
    if (!AdMob) return;
    try {
      await AdMob.showPrivacyOptionsForm();
    } catch (e) {
      console.error('[ads] Gizlilik seçenekleri formu açılamadı:', e);
    }
    return;
  }
  setConsent(null);
};

/* -------------------------------------------------------------------------- */
/* Web: AdSense                                                               */
/* -------------------------------------------------------------------------- */

let adsenseScriptPromise = null;

/**
 * adsbygoogle.js'i yalnızca bir kez, tembel olarak yükler.
 * Onay verilmediyse kişiselleştirilmemiş reklam ister.
 * Başarılıysa true, aksi halde false döner (asla reject etmez).
 */
export const loadAdSense = () => {
  if (!isWebAdsActive() || typeof document === 'undefined') return Promise.resolve(false);
  if (adsenseScriptPromise) return adsenseScriptPromise;

  adsenseScriptPromise = new Promise((resolve) => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      // Onay yoksa kişiselleştirilmemiş reklam (NPA).
      window.adsbygoogle.requestNonPersonalizedAds = getConsent() === 'granted' ? 0 : 1;

      const existing = document.querySelector('script[data-mp-adsense]');
      if (existing) {
        resolve(true);
        return;
      }
      const s = document.createElement('script');
      s.async = true;
      s.crossOrigin = 'anonymous';
      s.dataset.mpAdsense = 'true';
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        config.adsenseClient
      )}`;
      s.onload = () => resolve(true);
      s.onerror = () => {
        // Reklam engelleyici vb. — sessizce devam et.
        adsenseScriptPromise = null;
        resolve(false);
      };
      document.head.appendChild(s);
    } catch (e) {
      console.error('[ads] AdSense yüklenemedi:', e);
      adsenseScriptPromise = null;
      resolve(false);
    }
  });
  return adsenseScriptPromise;
};

/** Bir <ins class="adsbygoogle"> öğesini doldurur. Hata durumunda false. */
export const pushAdSenseUnit = () => {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  } catch (e) {
    // "All ins elements already have ads" gibi hatalar zararsız.
    return false;
  }
};

/* -------------------------------------------------------------------------- */
/* Native: AdMob                                                              */
/* -------------------------------------------------------------------------- */

let admobModulePromise = null;

/** @capacitor-community/admob modülünü dinamik yükler; başarısızsa null. */
const loadAdMobModule = () => {
  if (!isNativeApp()) return Promise.resolve(null);
  if (!admobModulePromise) {
    admobModulePromise = import('@capacitor-community/admob').catch((e) => {
      console.error('[ads] AdMob eklentisi yüklenemedi:', e);
      admobModulePromise = null;
      return null;
    });
  }
  return admobModulePromise;
};

const loadAdMob = async () => {
  const mod = await loadAdMobModule();
  return mod ? mod.AdMob : null;
};

let initPromise = null;
let nativeCanRequestAds = false;
let interstitialReady = false;

const initNative = async () => {
  const mod = await loadAdMobModule();
  if (!mod) return false;
  const { AdMob, AdmobConsentStatus, AdmobConsentDebugGeography } = mod;

  try {
    await AdMob.initialize({
      initializeForTesting: config.testMode,
      testingDevices: config.admobTestDeviceIds,
    });
  } catch (e) {
    console.error('[ads] AdMob başlatılamadı:', e);
    return false;
  }

  // Google UMP onay akışı (AB/BK/İsviçre kullanıcıları için zorunlu).
  try {
    const consentOptions = { tagForUnderAgeOfConsent: false };
    if (config.testMode && config.admobTestDeviceIds.length) {
      consentOptions.debugGeography = AdmobConsentDebugGeography.EEA;
      consentOptions.testDeviceIdentifiers = config.admobTestDeviceIds;
    }
    let info = await AdMob.requestConsentInfo(consentOptions);
    if (info.status === AdmobConsentStatus.REQUIRED && info.isConsentFormAvailable) {
      info = await AdMob.showConsentForm();
    }
    nativeCanRequestAds = info.canRequestAds !== false;
  } catch (e) {
    // Onay akışı başarısız olursa yine de dene; UMP sonraki açılışta tekrar sorar.
    console.error('[ads] Onay bilgisi alınamadı:', e);
    nativeCanRequestAds = true;
  }

  if (nativeCanRequestAds) prepareInterstitial();
  return nativeCanRequestAds;
};

/**
 * Reklam altyapısını başlatır (idempotent). Uygulama açılışında bir kez çağırın.
 * Web'de: onay zaten verildiyse/reddedildiyse AdSense betiğini önceden yükler.
 * Native'de: AdMob + UMP onay akışı.
 * @returns {Promise<boolean>} reklam istenebilir mi
 */
export const initAds = () => {
  if (!config.enabled) return Promise.resolve(false);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      if (isNativeApp()) return await initNative();
      if (!isWebAdsActive()) return false;
      // Web: kullanıcı seçim yapana kadar betik yüklenmez.
      if (getConsent() !== null) return await loadAdSense();
      return false;
    } catch (e) {
      console.error('[ads] initAds hatası:', e);
      return false;
    }
  })();

  // Web'de ilk seçim yapıldığında betiği yükle.
  if (!isNativeApp() && isWebAdsActive()) {
    subscribeConsent((value) => {
      if (value !== null) loadAdSense();
    });
  }
  return initPromise;
};

/* ----------------------------- Banner (native) ---------------------------- */

let bannerVisible = false;

/**
 * Alt kısımda uyarlanabilir AdMob banner'ı gösterir (yalnızca native).
 * @param {{ margin?: number }} [opts] alt kenardan boşluk (dp)
 * @returns {Promise<boolean>}
 */
export const showBanner = async ({ margin = 0 } = {}) => {
  if (!isNativeAdsActive()) return false;
  const adId = bannerAdId();
  if (!adId) return false;
  try {
    const ok = await initAds();
    if (!ok) return false;
    const mod = await loadAdMobModule();
    if (!mod) return false;
    const { AdMob, BannerAdSize, BannerAdPosition } = mod;
    if (bannerVisible) {
      await AdMob.resumeBanner();
      return true;
    }
    await AdMob.showBanner({
      adId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin,
      isTesting: config.testMode,
    });
    bannerVisible = true;
    return true;
  } catch (e) {
    console.error('[ads] Banner gösterilemedi:', e);
    return false;
  }
};

/** Banner'ı gizler (tekrar göstermek için showBanner). */
export const hideBanner = async () => {
  if (!isNativeAdsActive() || !bannerVisible) return;
  try {
    const AdMob = await loadAdMob();
    if (AdMob) await AdMob.hideBanner();
  } catch (e) {
    console.error('[ads] Banner gizlenemedi:', e);
  }
};

/** Banner'ı tamamen kaldırır. */
export const removeBanner = async () => {
  if (!isNativeAdsActive() || !bannerVisible) return;
  try {
    const AdMob = await loadAdMob();
    if (AdMob) await AdMob.removeBanner();
  } catch (e) {
    console.error('[ads] Banner kaldırılamadı:', e);
  } finally {
    bannerVisible = false;
  }
};

/**
 * Banner yükseklik değişimlerini dinler (dp ≈ CSS px).
 * @returns {Promise<() => void>} aboneliği iptal eden fonksiyon
 */
export const onBannerSizeChange = async (callback) => {
  const noop = () => {};
  if (!isNativeAdsActive()) return noop;
  try {
    const mod = await loadAdMobModule();
    if (!mod) return noop;
    const handles = await Promise.all([
      mod.AdMob.addListener(mod.BannerAdPluginEvents.SizeChanged, (info) =>
        callback(info && typeof info.height === 'number' ? info.height : 0)
      ),
      mod.AdMob.addListener(mod.BannerAdPluginEvents.FailedToLoad, () => callback(0)),
    ]);
    return () => handles.forEach((h) => h && h.remove && h.remove());
  } catch (e) {
    return noop;
  }
};

/* -------------------------- Geçiş reklamı (native) ------------------------- */

let preparing = null;

const prepareInterstitial = () => {
  if (!isNativeAdsActive() || interstitialReady || preparing) return preparing;
  const adId = interstitialAdId();
  if (!adId) return null;
  preparing = (async () => {
    try {
      const AdMob = await loadAdMob();
      if (!AdMob) return false;
      await AdMob.prepareInterstitial({ adId, isTesting: config.testMode });
      interstitialReady = true;
      return true;
    } catch (e) {
      // "No fill" sık görülür; sessizce geç.
      interstitialReady = false;
      return false;
    } finally {
      preparing = null;
    }
  })();
  return preparing;
};

let sessionActionCount = 0;

/**
 * Doğal bir duraklama noktasında (ör. PDF dışa aktarımından SONRA) geçiş reklamı
 * göstermeyi dener. Sıklık sınırı:
 *  - oturumdaki ilk eylemde gösterilmez,
 *  - en fazla 3 dakikada bir gösterilir (zaman damgası localStorage'da).
 * Web'de geçiş reklamı yoktur (AdSense "vignette" otomatik reklamları panelden yönetilir).
 *
 * @param {{ reason?: string }} [opts] ör. { reason: 'pdf-export' }
 * @returns {Promise<boolean>} reklam gösterildi mi
 */
export const maybeShowInterstitial = async ({ reason = 'unknown' } = {}) => {
  if (!isNativeAdsActive()) return false;
  try {
    sessionActionCount += 1;
    if (sessionActionCount < config.interstitialMinActions) {
      prepareInterstitial();
      return false;
    }
    const last = Number(storage.get(KEYS.lastInterstitial)) || 0;
    if (Date.now() - last < config.interstitialMinIntervalMs) return false;

    const ok = await initAds();
    if (!ok) return false;
    if (!interstitialReady) {
      const prepared = await prepareInterstitial();
      if (!prepared) return false;
    }
    const AdMob = await loadAdMob();
    if (!AdMob) return false;

    interstitialReady = false;
    storage.set(KEYS.lastInterstitial, Date.now());
    await AdMob.showInterstitial();
    // Bir sonrakini arka planda hazırla.
    setTimeout(() => prepareInterstitial(), 1000);
    return true;
  } catch (e) {
    console.error(`[ads] Geçiş reklamı gösterilemedi (${reason}):`, e);
    return false;
  }
};
