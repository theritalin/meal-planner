# Meal Planner

Haftalık yemek planlamanızı kolaylaştıran bir web uygulaması. Yemeklerinizi sürükle-bırak ile planlayın, PDF olarak indirin ve Firebase ile verilerinizi senkronize edin.

## Özellikler

- Haftalık yemek planlama
- Sürükle-bırak arayüzü
- Yemek arama ve filtreleme
- PDF olarak dışa aktarma
- Firebase entegrasyonu
- Google ile giriş yapma
- Otomatik veri senkronizasyonu

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- npm veya yarn
- Firebase hesabı

### Adımlar

1. Repoyu klonlayın:

   ```
   git clone https://github.com/kullanici/meal-planner.git
   cd meal-planner
   ```

2. Bağımlılıkları yükleyin:

   ```
   npm install
   ```

3. `.env` dosyasını oluşturun:

   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Uygulamayı başlatın:
   ```
   npm start
   ```

## Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com/) adresine gidin ve yeni bir proje oluşturun.
2. "Authentication" bölümünden Google ile giriş yöntemini etkinleştirin.
3. "Firestore Database" bölümünden yeni bir veritabanı oluşturun.
4. Proje ayarlarından web uygulaması ekleyin ve yapılandırma bilgilerini alın.
5. Bu bilgileri `.env` dosyasına ekleyin.

## Kullanım

1. Google hesabınızla giriş yapın.
2. Yemek listesinden istediğiniz yemekleri haftalık plana sürükleyin.
3. Planınızı kaydetmek için "Planı Kaydet" butonuna tıklayın.
4. PDF olarak indirmek için "PDF Olarak İndir" butonuna tıklayın.

## Lisans

MIT
