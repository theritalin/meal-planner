# Reklamlar (AdMob + AdSense)

Tüm reklam mantığı `src/services/ads.js` içindedir. Bileşenler:

| Dosya | Ne yapar |
| --- | --- |
| `src/services/platform.js` | `isNativeApp()`, `isAndroid()`, `getPlatform()` (Capacitor) |
| `src/services/ads.js` | Yapılandırma, `initAds()`, banner, geçiş reklamı, onay |
| `src/components/ads/AdBanner.js` | Sayfa içi web reklamı (`<AdBanner placement="recipes" />`) + `useNativeBanner` yeniden dışa aktarımı |
| `src/components/ads/hooks.js` | `useNativeBanner()`, `useAdsConsent()` |
| `src/components/ads/ConsentBanner.js` | Web için basit çerez/reklam onay bandı |

**Varsayılan davranış:** `REACT_APP_ADS_ENABLED` `true` değilse her şey no-op'tur —
hiçbir betik yüklenmez, hiçbir şey çizilmez. Reklam hataları uygulamayı asla çökertmez.

## Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
| --- | --- | --- |
| `REACT_APP_ADS_ENABLED` | `false` | Ana anahtar |
| `REACT_APP_ADS_TEST_MODE` | `true` | `true` iken Google'ın resmi **test** reklam birimleri kullanılır (AdMob) ve AdSense'e `data-adtest="on"` eklenir. Yalnızca Play'e yüklenecek yayın derlemesinde `false` yapın. |
| `REACT_APP_ADS_DEBUG` | `false` | Reklamlar kapalıyken reklam alanlarını kesikli çerçeve olarak gösterir (yerleşimi görmek için) |
| `REACT_APP_ADSENSE_CLIENT` | — | `ca-pub-XXXXXXXXXXXXXXXX` |
| `REACT_APP_ADSENSE_SLOT_DEFAULT` | — | Yerleşime özel slot yoksa kullanılır |
| `REACT_APP_ADSENSE_SLOT_PLANNER` / `_RECIPES` / `_RECIPE_DETAIL` / `_EXPORT` | — | Yerleşime özel slotlar |
| `REACT_APP_ADMOB_APP_ID` | — | `ca-app-pub-XXX~YYY` (bilgi amaçlı; asıl yeri `AndroidManifest.xml`) |
| `REACT_APP_ADMOB_BANNER_ID` | — | Uyarlanabilir banner birimi |
| `REACT_APP_ADMOB_INTERSTITIAL_ID` | — | Geçiş reklamı birimi |
| `REACT_APP_ADMOB_TEST_DEVICE_IDS` | — | Virgülle ayrılmış test cihazı kimlikleri (UMP formunu "AB'deymiş gibi" test etmek için) |
| `REACT_APP_CONTACT_EMAIL` | `bsckbilgi@gmail.com` | Gizlilik politikasındaki iletişim adresi |

> CRA ortam değişkenlerini **derleme anında** gömer. Değişiklikten sonra yeniden derleyin.

Google test kimlikleri (kodda `ADMOB_TEST_IDS`):

- Uygulama (Android): `ca-app-pub-3940256099942544~3347511713`
- Uyarlanabilir banner: `ca-app-pub-3940256099942544/9214589741`
- Geçiş reklamı: `ca-app-pub-3940256099942544/1033173712`

## Yerleşimler (placement)

| `placement` | Nerede | Not |
| --- | --- | --- |
| `planner` | Haftalık plan sayfasının altı | Sürükle-bırak alanına bitişik koymayın |
| `recipes` | Tarif listesinde, kartlar arasında / listenin altında | En fazla ~her 8–10 kartta bir |
| `recipeDetail` | Tarif detayında, malzemeler ile hazırlanış arasında veya sonunda | |
| `export` | PDF dışa aktarma sayfasında, butonların **altında**, aralarında boşlukla | İndirme butonuna yapışık koymayın |

Native (Android) uygulamada `AdBanner` hiçbir şey çizmez; onun yerine kabukta tek bir
alt banner gösterilir (`useNativeBanner`).

## Uygulama kabuğuna entegrasyon (App.js)

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAds } from './services/ads';
import ConsentBanner from './components/ads/ConsentBanner';
import { useNativeBanner } from './components/ads/AdBanner';

function Shell() {
  const { pathname } = useLocation();
  useEffect(() => { initAds(); }, []);

  // Giriş ve gizlilik sayfalarında banner gösterme
  const { bannerHeight } = useNativeBanner({
    enabled: !['/login', '/privacy'].includes(pathname),
  });

  return (
    <>
      {/* ... AppBar, <Routes> ... */}
      {/* İçerik: paddingBottom = 72 (alt nav) + bannerHeight */}
      {/* BottomNavigation (position: fixed): bottom: bannerHeight */}
      <ConsentBanner bottomOffset={{ xs: 88 + bannerHeight, md: 16 }} />
    </>
  );
}
```

### Alt navigasyonun kaydırılması (native)

AdMob banner'ı WebView'un **üzerine** yerel olarak çizilir ve ekranın en altına yapışır.
Bu yüzden:

1. `BottomNavigation` için `sx={{ position: 'fixed', bottom: bannerHeight, ... }}` kullanın;
   banner navigasyonun **altında** kalır, butonları örtmez.
2. Sayfa kapsayıcısına `pb: \`${72 + bannerHeight}px\`` verin.
3. `bannerHeight` banner yüklenene kadar `0`'dır, yüklenince (`bannerAdSizeChanged`
   olayıyla) gerçek yüksekliği alır (tipik 50–60 dp ≈ CSS px).
4. Yanlışlıkla tıklamayı önlemek için navigasyonun altına 1 px kenarlık (divider) ve
   birkaç piksel boşluk bırakın; banner ile butonlar bitişik görünmesin.

## Geçiş reklamı (interstitial)

```js
import { maybeShowInterstitial } from '../../services/ads';

await exportPdf();                       // indirme/kaydetme tamamlandıktan SONRA
maybeShowInterstitial({ reason: 'pdf-export' });
```

Sıklık sınırı (`ads.js` → `config`):

- Oturumdaki **ilk** eylemde gösterilmez (yalnızca arka planda yüklenir).
- En fazla **3 dakikada bir** gösterilir (zaman damgası `localStorage`'da: `mp_ads_last_interstitial`).
- Yalnızca native'de; web'de `false` döner (AdSense "vignette" otomatik reklamlarını
  istersen AdSense panelinden açabilirsin).

Kural: geçiş reklamını asla bir işlemin **ortasında** veya beklenmedik anda değil,
doğal bir duraklamada (PDF hazırlandıktan sonra) gösterin.

## Onay (consent)

- **Android:** `initAds()` Google UMP akışını çalıştırır
  (`requestConsentInfo` → gerekiyorsa `showConsentForm`). AdMob panelinde
  *Privacy & messaging → GDPR* mesajı oluşturulmuş olmalıdır, yoksa form gelmez.
- **Web:** `ConsentBanner` seçimi `localStorage` (`mp_ads_consent` = `granted`/`denied`)
  içinde saklar. Seçim yapılana kadar AdSense betiği **yüklenmez**; "Reddet" seçilirse
  kişiselleştirilmemiş reklam (`requestNonPersonalizedAds = 1`) istenir.
  AEA/BK trafiği için Google, sertifikalı bir CMP şart koşar — AdSense panelinde
  *Privacy & messaging → European regulations* mesajını açmanız önerilir (o durumda
  `ConsentBanner` yine de zararsızdır).
- Tercihleri yeniden açmak: `openConsentPreferences()` (Gizlilik Politikası sayfasında
  "Reklam tercihlerimi değiştir" butonu bunu kullanır).

## AdSense site doğrulaması

AdSense, siteyi onaylarken `<head>` içinde hesap etiketini arar. Betik tembel yüklendiği için
`public/index.html` `<head>` içine şu meta etiketi eklenmelidir:

```html
<meta name="google-adsense-account" content="%REACT_APP_ADSENSE_CLIENT%" />
```

Ayrıca web sitesinin köküne `public/ads.txt` koyun:

```
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

## Politika notları

- Kendi reklamlarınıza tıklamayın; test sırasında **daima** test modunu kullanın.
- Reklamları butonlara, sürükle-bırak alanlarına veya navigasyona yapışık koymayın.
- "Reklam" etiketi `AdBanner` içinde otomatik gösterilir.
- Ekran başına en fazla bir banner (native) — içerikten fazla reklam olmamalı.
