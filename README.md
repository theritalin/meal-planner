# Tarif Kitabım — Yemek Planlayıcı

Haftalık yemek planlayıcı + kişisel tarif kitabı. Tarif kitabınızı tek tıkla,
**her tarif tek sayfa** olacak şekilde PDF'e aktarabilirsiniz. Web'de çalışır;
Capacitor ile Android (Google Play) uygulamasına dönüştürülmeye hazırdır.

## Özellikler

- **Planlayıcı** — masaüstünde sürükle-bırak haftalık tablo, mobilde gün gün görünüm
  ve dokunarak yemek ekleme; rastgele plan, kaydetme, kalori özeti.
- **Tarif Kitabım** — kendi tarifleriniz + kaydettikleriniz + hazır tarifler;
  arama/filtre, düzenleme, porsiyon ölçekleme, pişirirken malzeme/adım işaretleme, yazdırma.
- **PDF** (`/export`)
  - Tarif kitabı: kapak, içindekiler (tıklanabilir), tarif başına bir sayfa.
    Uzun tarifler otomatik olarak küçültülür / tek sütuna geçer ki tek sayfaya sığsın.
  - Haftalık plan + birleştirilmiş alışveriş listesi.
  - Tekil tarif PDF'i (tarif detay sayfasından).
  - Türkçe karakter destekli gömülü fontlar (Inter, Playfair Display — `public/fonts`).
- **Reklamlar** — web'de AdSense, Android'de AdMob; onay (consent) akışı ve
  sıklık sınırlı geçiş reklamı. Varsayılan olarak kapalı. Bkz. [`docs/ADS.md`](docs/ADS.md).
- **Google Play hazırlığı** — `capacitor.config.json`, gizlilik politikası (`/privacy`),
  adım adım rehber: [`docs/ANDROID.md`](docs/ANDROID.md).
- Google ile giriş, profil, kullanıcı arama/takip, Firestore senkronizasyonu.

## Kurulum

```bash
npm install
cp .env.example .env   # Firebase ve (isteğe bağlı) reklam değişkenlerini doldurun
npm start
```

Testler: `npm test` · Üretim derlemesi: `npm run build`

## Firebase

1. Firebase Console'da proje oluşturun, Authentication > Google'ı etkinleştirin.
2. Firestore veritabanı oluşturun ve [`firestore.rules`](firestore.rules) içeriğini
   Rules sekmesine yapıştırın.
3. Yönetici yetkisi istemciden verilmez: Firestore'da `users/{uid}` belgesinde
   `isAdmin: true` alanını elle ayarlayın.

## Proje yapısı

```
src/
  App.js                    rotalar (lazy-loaded sayfalar)
  theme.js, constants.js    tema ve ortak sabitler
  context/                  MealContext (plan/yemekler), RecipeContext (tarifler)
  services/                 firebase.js, ads.js, platform.js
  components/
    layout/AppShell.js      üst menü / mobil alt gezinme / reklam bandı
    MealPlannerPage.js, calendar/, meals/   planlayıcı
    recipes/                tarif kitabı, detay, form
    pdf/                    PDF belgeleri, sığdırma algoritması (fitRecipe.js), ExportPage
    auth/                   giriş, profil, kullanıcı arama
    ads/, legal/            reklam bileşenleri, gizlilik politikası
```

## Lisans

MIT. Fontlar SIL Open Font License altındadır (`public/fonts/*.txt`).
