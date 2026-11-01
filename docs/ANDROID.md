# Android'e Paketleme ve Google Play'de Yayınlama

Bu rehber, React (Create React App) uygulamasını **Capacitor 8** ile Android uygulamasına
dönüştürüp reklamlı olarak Google Play'de yayınlamayı adım adım anlatır.

Projede hazır olanlar:

- `capacitor.config.json` — `appId`, `appName: "Tarif Kitabım"`, `webDir: "build"`
- Bağımlılıklar: `@capacitor/core`, `@capacitor/android`, `@capacitor/cli` (dev),
  `@capacitor-community/admob` (hepsi 8.x)
- npm betikleri: `npm run cap:sync` (derle + senkronize et), `npm run cap:open` (Android Studio'da aç)
- Reklam katmanı: `src/services/ads.js` (bkz. [ADS.md](./ADS.md))
- Gizlilik politikası sayfası: `/privacy`

---

## 0. Gereksinimler

| Araç | Sürüm |
| --- | --- |
| Node.js | 22 veya üzeri (Capacitor 8 şartı) |
| Android Studio | Güncel kararlı sürüm (Android SDK 36 kurulu) |
| JDK | 21 (Android Studio ile birlikte gelir) |
| Google Play Console | Geliştirici hesabı (tek seferlik ücret) |
| AdMob hesabı | Uygulama + reklam birimleri oluşturulmuş |

## 1. Uygulama kimliğini (appId) seçin — KALICIDIR

`capacitor.config.json` içindeki `"appId": "com.mealplanner.tarifkitabi"` geçici bir
örnektir. Play'e **ilk yüklemeden önce** kendinize ait, benzersiz bir kimlik seçin
(ör. `com.soyadiniz.tarifkitabi`). Paket adı yüklendikten sonra **asla değiştirilemez**;
değiştirmek yeni bir uygulama yayınlamak demektir.

## 2. Web uygulamasını derleyin ve Android projesini ekleyin

```bash
npm install
npm run build                 # build/ klasörü oluşur
npx cap add android           # android/ klasörünü oluşturur (yalnızca bir kez)
npx cap sync android          # build/ ve eklentileri android/ içine kopyalar
npm run cap:open              # Android Studio'da açar
```

Sonraki her değişiklikte yalnızca:

```bash
npm run cap:sync
```

> `android/` klasörü git'e eklenmelidir (yerel ayarlar, manifest, ikonlar orada).
> Ancak **keystore dosyalarını ve şifrelerini asla commit etmeyin** (bkz. Adım 9).

Yayın derlemesi için ortam değişkenlerini `.env.production.local` içine yazın
(`REACT_APP_ADS_ENABLED=true`, `REACT_APP_ADS_TEST_MODE=false`, gerçek AdMob kimlikleri).
Geliştirme ve iç test sırasında `REACT_APP_ADS_TEST_MODE=true` kalsın.

## 3. AdMob uygulama kimliği (AndroidManifest)

AdMob SDK, uygulama kimliği manifestte yoksa **açılışta çöker**. Dosya:
`android/app/src/main/AndroidManifest.xml` — `<application>` etiketinin içine:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="@string/admob_app_id" />
```

`android/app/src/main/res/values/strings.xml` içine:

```xml
<!-- Test: ca-app-pub-3940256099942544~3347511713 — yayında kendi kimliğinizle değiştirin -->
<string name="admob_app_id">ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY</string>
```

Notlar:

- Bu değer `REACT_APP_ADMOB_APP_ID` ile aynı olmalı (JS tarafı bilgi amaçlı tutar; asıl
  kaynak manifesttir).
- Google Mobile Ads SDK, `com.google.android.gms.permission.AD_ID` iznini otomatik ekler.
  Play Console'da "Reklam kimliği kullanıyor musunuz?" sorusuna **Evet** deyin.
- AdMob panelinde *Gizlilik ve mesajlaşma → GDPR* mesajı oluşturun; uygulama Google UMP
  onay formunu (`initAds()` içinde) otomatik gösterir.

## 4. app-ads.txt

AdMob, reklam envanterini doğrulamak için **geliştirici web sitenizde** `app-ads.txt` arar.

1. Play Console → *Mağaza ayarları → İletişim bilgileri* bölümüne web sitenizi girin
   (ör. `https://tarifkitabi.example.com`).
2. Sitenin **kök dizinine** `app-ads.txt` koyun
   (`https://tarifkitabi.example.com/app-ads.txt`). Web sürümü bu projeden yayınlanıyorsa
   dosyayı `public/app-ads.txt` olarak ekleyin:

   ```
   google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
   ```

3. AdMob → *Uygulamalar → app-ads.txt* sekmesinde doğrulamanın tamamlanmasını bekleyin
   (24 saate kadar sürebilir).

## 5. Firebase Google ile giriş (Android)

**Sorun:** `signInWithPopup` Android WebView'da çalışmaz (açılır pencere yok); Google ayrıca
gömülü WebView içinde OAuth girişini engeller (`disallowed_useragent`).

**Önerilen çözüm: `@capacitor-firebase/authentication`** (yerel Google Sign-In / Credential Manager)

```bash
npm install @capacitor-firebase/authentication
npx cap sync android
```

> Uyumluluk: eklentinin 8.x sürümü `firebase@^12` ister; proje şu an `firebase@10`
> kullanıyor. Önce Firebase JS SDK'yı 12'ye yükseltin (API'ler modüler ve büyük ölçüde
> aynıdır) ya da eklentinin dokümantasyonundaki uyumluluk tablosuna bakın.

`capacitor.config.json`'a ekleyin:

```json
"plugins": {
  "FirebaseAuthentication": {
    "skipNativeAuth": true,
    "providers": ["google.com"]
  }
}
```

Giriş kodu (platforma göre):

```js
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import { isNativeApp } from './services/platform';

export async function signInWithGoogle(auth) {
  if (isNativeApp()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
    const result = await FirebaseAuthentication.signInWithGoogle();
    const credential = GoogleAuthProvider.credential(result.credential?.idToken);
    return signInWithCredential(auth, credential); // web SDK oturumu → Firestore çalışır
  }
  return signInWithPopup(auth, new GoogleAuthProvider());
}
// Çıkış: native'de FirebaseAuthentication.signOut() + auth.signOut()
```

Alternatif (daha zayıf): `signInWithRedirect` — WebView'da Google tarafından
engellenebildiği için önerilmez.

**Firebase / SHA-1 kurulumu:**

1. Firebase Console → *Proje ayarları → Uygulama ekle → Android*; paket adı = `appId`.
2. **SHA-1 ve SHA-256** parmak izlerini ekleyin — üç ayrı anahtar için:
   - Hata ayıklama (debug) anahtarı:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey \
       -storepass android -keypass android
     ```
     veya `cd android && ./gradlew signingReport`
   - Yükleme (upload) anahtarınız (Adım 9'da oluşturulan keystore)
   - **Play Uygulama İmzalama anahtarı:** Play Console → *Test ve yayınlama → Uygulama
     bütünlüğü → Uygulama imzalama* bölümündeki SHA-1/SHA-256. (Bunu eklemezseniz Play'den
     indirilen uygulamada giriş **çalışmaz** — en sık yapılan hata.)
3. `google-services.json` dosyasını indirip `android/app/` içine koyun
   (Capacitor şablonu dosya varsa Google Services Gradle eklentisini otomatik uygular).
4. Firebase Console → *Authentication → Sign-in method* → Google açık olmalı.

## 6. PDF kaydetme / paylaşma (Android)

WebView'da `<a download>` ile blob indirme çalışmaz. `src/components/pdf/exportUtils.js`
içindeki `saveBlob(blob, filename)` fonksiyonu bu iş için ayrılmış kancadır (TODO).
Native'de dosyayı önbelleğe yazıp sistem paylaşım menüsünü açın:

```bash
npm install @capacitor/filesystem @capacitor/share
npx cap sync android
```

```js
import { isNativeApp } from '../../services/platform';

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(String(r.result).split(',')[1]);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

export async function saveBlob(blob, filename) {
  if (isNativeApp()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: await blobToBase64(blob),
      directory: Directory.Cache,
    });
    await Share.share({ title: filename, url: uri, dialogTitle: 'PDF’i kaydet veya paylaş' });
    return;
  }
  // Web: mevcut indirme davranışı
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
```

`Directory.Cache` depolama izni gerektirmez. Paylaşım menüsünden kullanıcı "Dosyalar'a
kaydet", Drive, WhatsApp vb. seçebilir. Dışa aktarma bittikten **sonra**
`maybeShowInterstitial({ reason: 'pdf-export' })` çağrılabilir.

## 7. İkonlar ve açılış ekranı

```bash
npm install -D @capacitor/assets
```

Proje kökünde `assets/` klasörü oluşturun:

- `assets/icon-only.png` — 1024×1024, kenarlarda boşluklu
- `assets/icon-foreground.png` + `assets/icon-background.png` — uyarlanabilir ikon (1024×1024)
- `assets/splash.png` ve `assets/splash-dark.png` — 2732×2732

```bash
npx capacitor-assets generate --android
```

Play mağazası için ayrıca: 512×512 uygulama ikonu, 1024×500 öne çıkan görsel, en az 2 telefon
ekran görüntüsü.

## 8. Sürüm numarası

`android/app/build.gradle` → `defaultConfig`:

```gradle
versionCode 1        // her yüklemede 1 artırın (tam sayı)
versionName "1.0.0"  // kullanıcıya görünen sürüm
```

## 9. İmzalama (keystore)

Play App Signing kullanılır: siz **yükleme anahtarı** ile imzalarsınız, Google son
kullanıcıya kendi anahtarıyla dağıtır.

```bash
keytool -genkeypair -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 \
  -validity 10000 -alias upload
```

- Dosyayı ve şifreleri **repo dışında**, güvenli bir yerde yedekleyin (kaybederseniz
  Play Console'dan anahtar sıfırlama talep etmeniz gerekir).
- `.gitignore`'a ekleyin: `*.jks`, `*.keystore`, `android/keystore.properties`.

`android/keystore.properties` (commit etmeyin):

```properties
storeFile=/mutlak/yol/upload-keystore.jks
storePassword=******
keyAlias=upload
keyPassword=******
```

`android/app/build.gradle`:

```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

## 10. AAB oluşturma ve yükleme

```bash
npm run cap:sync
cd android && ./gradlew bundleRelease
# Çıktı: android/app/build/outputs/bundle/release/app-release.aab
```

(veya Android Studio → *Build → Generate Signed App Bundle*)

Play Console:

1. *Uygulama oluştur* → ad: "Tarif Kitabım", dil: Türkçe, Uygulama, Ücretsiz.
2. **Dahili test** kanalına AAB'yi yükleyin, kendi cihazınızda deneyin.
3. Yeni kişisel geliştirici hesaplarında üretime geçmeden önce **kapalı test** zorunludur
   (en az 12 test kullanıcısı, 14 gün — güncel şartı Play Console'da kontrol edin).
4. Sonra üretime yükseltin.

## 11. Hedef API düzeyi (target SDK)

Google Play, yeni uygulamaların ve güncellemelerin **güncel Android sürümünü hedeflemesini**
şart koşar. 31 Ağustos 2026'dan itibaren bu **API 36 (Android 16)**'dır. Capacitor 8
şablonu varsayılan olarak `compileSdkVersion = 36`, `targetSdkVersion = 36`,
`minSdkVersion = 24` ayarlar (`android/variables.gradle`). Her yıl Ağustos ayında şart
yükselir — Play Console uyarılarını takip edin ve Capacitor'ı güncel tutun.

## 12. Play Console formları

### Gizlilik politikası URL'si

`https://<alan-adınız>/privacy` (web sürümü yayında olmalı; girişsiz erişilebilir olmalı).

### Veri güvenliği (Data safety) — `/privacy` sayfasıyla uyumlu yanıtlar

| Soru | Yanıt |
| --- | --- |
| Uygulama kullanıcı verisi topluyor veya paylaşıyor mu? | **Evet** |
| Aktarım sırasında veriler şifreleniyor mu? | **Evet** (HTTPS/TLS) |
| Kullanıcılar veri silinmesini isteyebilir mi? | **Evet** — e-posta ile (`/privacy` §7). Play ayrıca bir **hesap silme URL'si** ister: `https://<alan-adınız>/privacy#pp-delete` |
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

### Diğer beyanlar

- **Reklamlar:** "Uygulamanız reklam içeriyor mu?" → **Evet**.
- **Reklam kimliği beyanı:** Evet, reklam amaçlı.
- **Hedef kitle ve içerik:** 13 yaş ve üzeri (ör. 18+ veya 13–17 ve 18+). 13 yaş altını
  seçmeyin; aksi halde "Aileler" politikası ve sertifikalı reklam SDK şartları devreye girer.
- **İçerik derecelendirmesi:** anketi doldurun (yemek tarifi — genelde "Herkes"/PEGI 3).
- **Uygulama erişimi:** Bazı özellikler giriş gerektiriyorsa incelemeciler için bir test
  hesabı ya da açıklama verin.

## 13. Reklam politikası notları (hesap kapatılmasını önlemek için)

- Geliştirme ve testte **daima test reklamları** (`REACT_APP_ADS_TEST_MODE=true`) kullanın;
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
| Açılışta çökme: "The Google Mobile Ads SDK was initialized incorrectly" | Manifestte `APPLICATION_ID` meta-data eksik (Adım 3) |
| Play'den indirilen sürümde Google girişi `DEVELOPER_ERROR` / 10 | Play App Signing SHA-1'i Firebase'e eklenmemiş (Adım 5) |
| Beyaz ekran | `npm run build` yapılmadan `cap sync` çalıştırılmış; `webDir` = `build` olmalı |
| Banner gelmiyor | Yeni reklam birimleri birkaç saat "no fill" verebilir; önce test modunda deneyin |
| PDF indirilmiyor | `saveBlob` native dalı (Adım 6) eklenmemiş |
