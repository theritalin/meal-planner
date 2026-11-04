# Android (Google Play) — Derleme ve Yayınlama

Android projesi (`android/`) hazırdır ve **GitHub Actions** ile derlenir. Bilgisayarınıza
Android Studio kurmanız gerekmez. Sizin yapacaklarınız: bir kez **Firebase** ve **GitHub
secret** ayarları, sonra her sürümde **Actions'tan dosyayı indirip Play Console'a yüklemek**.

## Projede hazır olanlar

| Ne | Nerede |
| --- | --- |
| Android projesi (Capacitor 8, minSdk 24, target/compile SDK 36) | `android/` |
| Uygulama kimliği / adı | `com.mealplanner.tarifkitabi` / **Tarif Kitabım** |
| İkonlar (uyarlanabilir), açılış ekranı (açık/koyu) | `android/app/src/main/res` (kaynak: `assets/`) |
| Yerel Google ile giriş (`@capacitor-firebase/authentication`) | `src/services/firebase.js` |
| PDF'i kaydet/paylaş (Filesystem + Share) | `src/components/pdf/exportUtils.js` |
| AdMob banner + sıklık sınırlı geçiş reklamı, UMP onay formu | `src/services/ads.js` |
| Android geri tuşu, çentik/durum çubuğu boşlukları | `src/components/layout/AppShell.js` |
| AdMob uygulama kimliği (manifest), sürüm numarası, imzalama | `android/app/build.gradle` (ortam değişkenleri) |
| `app-ads.txt` | `public/app-ads.txt` → https://haftalikyemek.space/app-ads.txt |
| Otomatik derleme (AAB + APK) | `.github/workflows/android.yml` |

Web sürümündeki AdSense ve Vercel analitiği uygulama içinde **yüklenmez** (AdSense'in
uygulama içinde kullanılması yasaktır; uygulamada AdMob kullanılır).

---

## 1. Firebase'e Android uygulamasını ekleyin (bir kez)

1. Firebase Console → ⚙️ *Proje ayarları* → *Genel* → **Uygulama ekle → Android**.
   - Paket adı: `com.mealplanner.tarifkitabi`
   - Takma ad: Tarif Kitabım (Android)
2. Aynı sayfada uygulamanın altındaki **SHA sertifika parmak izleri** bölümüne yükleme
   anahtarınızın parmak izlerini ekleyin:
   - SHA-1: `C4:5C:4E:92:E9:B8:AB:54:0F:2B:2F:63:AB:1E:9E:12:F9:DA:8E:C5`
   - SHA-256: `0F:FC:B3:97:C7:E7:A1:94:80:D3:C0:8F:43:4A:10:44:20:26:AF:07:DF:16:9B:23:DE:C6:D6:76:0D:91:28:43`
3. *Authentication → Sign-in method* → **Google** açık olmalı.
4. Parmak izlerini ekledikten **sonra** `google-services.json` dosyasını indirin
   (önce indirirseniz Google girişi için gereken istemci kimliği dosyada olmaz).

> Play'e ilk yüklemeden sonra Play Console → *Test ve yayınlama → Uygulama bütünlüğü →
> Uygulama imzalama* bölümünde **Uygulama imzalama anahtarı sertifikası** (Google'ın anahtarı)
> görünür. O SHA-1 ve SHA-256'yı da Firebase'e ekleyin, `google-services.json`'u yeniden
> indirip secret'ı güncelleyin ve yeniden derleyin. **Bunu yapmazsanız Play'den indirilen
> uygulamada Google girişi çalışmaz** (en sık yapılan hata).

## 2. GitHub secret'larını ekleyin (bir kez)

GitHub → depo → **Settings → Secrets and variables → Actions → New repository secret**.

| Secret adı | Değer |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Size verilen `ANDROID_KEYSTORE_BASE64.txt` dosyasının içeriği |
| `ANDROID_KEYSTORE_PASSWORD` | Size verilen şifre |
| `ANDROID_KEY_PASSWORD` | Aynı şifre |
| `ANDROID_KEY_ALIAS` | `upload` |
| `GOOGLE_SERVICES_JSON` | İndirdiğiniz `google-services.json` dosyasının **tüm metni** |
| `REACT_APP_FIREBASE_API_KEY`, `REACT_APP_FIREBASE_AUTH_DOMAIN`, `REACT_APP_FIREBASE_PROJECT_ID`, `REACT_APP_FIREBASE_STORAGE_BUCKET`, `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`, `REACT_APP_FIREBASE_APP_ID`, `REACT_APP_FIREBASE_MEASUREMENT_ID` | Vercel → Settings → Environment Variables'daki değerlerin aynısı |

İsteğe bağlı — **AdMob reklamları** (üçü birlikte girilince uygulamada gerçek reklamlar açılır;
girilmezse uygulama reklamsız derlenir):

| Secret adı | Nereden |
| --- | --- |
| `ADMOB_APP_ID` | AdMob → Uygulamalar → Uygulama ekle (Android) → *Uygulama kimliği* `ca-app-pub-…~…` |
| `ADMOB_BANNER_ID` | AdMob → Reklam birimleri → **Banner** `ca-app-pub-…/…` |
| `ADMOB_INTERSTITIAL_ID` | AdMob → Reklam birimleri → **Geçiş reklamı** `ca-app-pub-…/…` |

> 🔐 İmzalama anahtarını (`tarifkitabi-upload.jks`) ve şifresini güvenli bir yerde
> (parola yöneticisi + bulut yedeği) saklayın. Kaybederseniz Play Console'dan yükleme
> anahtarı sıfırlama talebi gerekir.

## 3. Derleme

GitHub → **Actions → Android Build → Run workflow** (isterseniz sürüm adı girin, ör. `1.0.0`).
`main` dalına her push'ta da otomatik çalışır. ~10 dakika sonra çalışmanın sayfasında
**Artifacts → tarif-kitabim-android-…** zip'ini indirin:

- `tarif-kitabim-<sürüm>.aab` → **Google Play Console'a yükleyin**
- `tarif-kitabim-<sürüm>.apk` → telefona doğrudan kurup deneyin

`versionCode` her çalışmada otomatik artar (Actions çalışma numarası). Dosya adı
**DENEME-KURMAYIN-** ile başlıyorsa secret'lar eksiktir; çalışma özetinde hangilerinin eksik
olduğu yazar.

## 4. Play Console'a yükleme

1. https://play.google.com/console → **Uygulama oluştur** (ad: Tarif Kitabım, dil: Türkçe,
   Uygulama, Ücretsiz).
2. *Test ve yayınlama → Test → Dahili test* → **Yeni sürüm oluştur** → `.aab` dosyasını yükleyin.
   **Play Uygulama İmzalama**'yı kabul edin (varsayılan).
3. Ardından 1. adımdaki notu uygulayın (Google'ın imzalama SHA'larını Firebase'e ekleyin).
4. Mağaza girişi: kısa/uzun açıklama, 512×512 ikon (`public/icon-512.png`), 1024×500 öne
   çıkan görsel, en az 2 telefon ekran görüntüsü.
5. Yeni kişisel geliştirici hesaplarında üretime çıkmadan önce **en az 12 test kullanıcısıyla
   14 gün kapalı test** zorunludur.

## 5. app-ads.txt

Play Console → *Mağaza ayarları → İletişim bilgileri → Web sitesi*: `https://haftalikyemek.space`.
AdMob bu sitedeki `app-ads.txt` dosyasını doğrular. AdMob yayıncı kimliğiniz AdSense'tekinden
(`pub-8721131084537312`) farklıysa `public/app-ads.txt` dosyasını güncelleyin.

## 6. Play Console formları

#### Gizlilik politikası URL'si

`https://haftalikyemek.space/privacy` (web sürümü yayında olmalı; girişsiz erişilebilir olmalı).

#### Veri güvenliği (Data safety) — `/privacy` sayfasıyla uyumlu yanıtlar

| Soru | Yanıt |
| --- | --- |
| Uygulama kullanıcı verisi topluyor veya paylaşıyor mu? | **Evet** |
| Aktarım sırasında veriler şifreleniyor mu? | **Evet** (HTTPS/TLS) |
| Kullanıcılar veri silinmesini isteyebilir mi? | **Evet** — e-posta ile (`/privacy` §7). Play ayrıca bir **hesap silme URL'si** ister: `https://haftalikyemek.space/privacy#pp-delete` |
| Hesap oluşturma | Google ile giriş (OAuth) |

Toplanan veri türleri:

| Veri türü | Toplanıyor | Paylaşılıyor | Amaç | Zorunlu mu |
| --- | --- | --- | --- | --- |
| Kişisel bilgi → **Ad** | Evet | Hayır | Uygulama işlevselliği, Hesap yönetimi | Evet |
| Kişisel bilgi → **E-posta adresi** | Evet | Hayır | Uygulama işlevselliği, Hesap yönetimi | Evet |
| Kişisel bilgi → **Kullanıcı kimlikleri** | Evet | Hayır | Uygulama işlevselliği, Hesap yönetimi | Evet |
| Fotoğraflar → profil fotoğrafı URL'si | Evet* | Hayır | Uygulama işlevselliği | Evet |
| Uygulama etkinliği → **Diğer kullanıcı tarafından oluşturulan içerik** (tarifler, planlar) | Evet | Hayır | Uygulama işlevselliği | Evet |
| Cihaz veya diğer kimlikler → **Reklam kimliği** | Evet | **Evet** (Google AdMob) | Reklam veya pazarlama | Hayır** |
| Uygulama etkinliği → **Uygulama etkileşimleri** (reklam etkileşimleri) | Evet | Evet (AdMob) | Reklam, Analiz | Hayır** |
| Uygulama bilgileri ve performans → **Kilitlenme günlükleri / Tanılama** | Evet (AdMob SDK) | Evet | Analiz | Hayır** |

\* Google profil fotoğrafının URL'si saklanıyorsa işaretleyin.
\** AdMob SDK otomatik toplar; "isteğe bağlı" çünkü UMP ile kişiselleştirme reddedilebilir.
Konum (yaklaşık konum, IP'den) için AdMob'un güncel veri beyanı rehberine bakın:
<https://developers.google.com/admob/android/privacy/play-data-disclosure>

#### Diğer beyanlar

- **Reklamlar:** "Uygulamanız reklam içeriyor mu?" → **Evet**.
- **Reklam kimliği beyanı:** Evet, reklam amaçlı.
- **Hedef kitle ve içerik:** 13 yaş ve üzeri (ör. 18+ veya 13–17 ve 18+). 13 yaş altını
  seçmeyin; aksi halde "Aileler" politikası ve sertifikalı reklam SDK şartları devreye girer.
- **İçerik derecelendirmesi:** anketi doldurun (yemek tarifi — genelde "Herkes"/PEGI 3).
- **Uygulama erişimi:** Bazı özellikler giriş gerektiriyorsa incelemeciler için bir test
  hesabı ya da açıklama verin.

## 7. Reklam politikası notları (hesap kapatılmasını önlemek için)

- Geliştirme ve testte **daima test reklamları** (AdMob test cihazı ekleyin: AdMob → Ayarlar → Test cihazları) kullanın;
  kendi gerçek reklamlarınıza asla tıklamayın.
- **Yanlışlıkla tıklama yok:** Banner'ı alt navigasyon butonlarına, "PDF indir" butonuna
  veya sürükle-bırak alanlarına yapışık koymayın. Native banner en altta, alt navigasyon
  onun üstünde (`useNativeBanner` → `bannerHeight` kadar yukarı kaydırılır; bkz. ADS.md).
- Ekranda aynı anda en fazla **bir** banner; içerikten fazla reklam olmasın.
- **Geçiş reklamı** yalnızca doğal duraklamalarda (PDF dışa aktarımı **bittikten sonra**),
  uygulama açılışında veya bir işlemin ortasında değil. Kodda sıklık sınırı: oturumun ilk
  eyleminde yok, en fazla 3 dakikada bir.
- Reklamları "Reklam" etiketiyle ayırt edin (AdBanner bunu yapar); reklamları içerik veya
  menü gibi göstermeyin.
- Giriş ekranında ve gizlilik politikasında reklam göstermeyin.

## Sık karşılaşılan sorunlar

| Belirti | Çözüm |
| --- | --- |
| Açılışta çökme: "The Google Mobile Ads SDK was initialized incorrectly" | `ADMOB_APP_ID` secret'ı hatalı biçimde (`ca-app-pub-…~…` olmalı) |
| Play'den indirilen sürümde Google girişi `DEVELOPER_ERROR` / 10 | Play App Signing SHA-1'i Firebase'e eklenmemiş (Adım 1 notu) |
| Beyaz ekran | `npm run build` yapılmadan `cap sync` çalıştırılmış; `webDir` = `build` olmalı |
| Banner gelmiyor | Yeni reklam birimleri birkaç saat "no fill" verebilir; önce test modunda deneyin |
| PDF indirilmiyor | `npx cap sync android` çalıştırılmamış (Filesystem/Share eklentileri yüklenmemiş) |
| Uygulama açılır açılmaz kapanıyor | `GOOGLE_SERVICES_JSON` secret'ı eksik/yanlış (paket adı `com.mealplanner.tarifkitabi` olmalı) |
| Beyaz ekran ya da "API key" hatası | `REACT_APP_FIREBASE_*` secret'ları eksik |

## Yerel derleme (isteğe bağlı)

Android Studio kuruluysa: `npm run cap:sync` → `npm run cap:open`. İmzalı derleme için
`android/keystore.properties` oluşturun (git'e eklenmez):

```properties
storeFile=/tam/yol/tarifkitabi-upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

`assets/` içindeki görselleri değiştirirseniz ikon ve açılış ekranını yeniden üretin:

```bash
npx @capacitor/assets generate --android --iconBackgroundColor '#C2410C' --splashBackgroundColor '#FBF7F2' --splashBackgroundColorDark '#1C1917'
```
