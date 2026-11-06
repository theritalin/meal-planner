# Google Play — Mağaza Girişi ve Formlar (kopyala-yapıştır)

Uygulama: **Tarif Kitabım** · Paket: `com.mealplanner.tarifkitabi`
Görseller: [`store/graphics/`](graphics/) · Derleme: GitHub → Actions → **Android Build**

Hesabınız eski olduğu için 14 günlük kapalı test zorunluluğu yok; doğrudan **Üretim**'e
yayınlayabilirsiniz. Yine de aşağıdaki sıra Google girişinin incelemede sorunsuz çalışması için önemli.

---

## 0. Yayın sırası (önemli)

1. Play Console → **Uygulama oluştur**
   - Uygulama adı: `Tarif Kitabım: Haftalık Menü`
   - Varsayılan dil: **Türkçe – tr-TR**
   - Uygulama mı oyun mu: **Uygulama** · Ücretsiz mi ücretli mi: **Ücretsiz**
   - Beyanları onaylayın → **Uygulama oluştur**
2. **Test ve yayınlama → Test → Dahili test → Yeni sürüm oluştur** → Actions'tan indirdiğiniz
   `tarif-kitabim-1.0.0.aab` dosyasını yükleyin (Play Uygulama İmzalama'yı kabul edin) →
   test kullanıcısı olarak kendi e-postanızı ekleyip yayınlayın. (Bu adım sadece Google'ın
   imzalama anahtarını oluşturması içindir; inceleme beklemeden birkaç dakikada açılır.)
3. **Test ve yayınlama → Uygulama bütünlüğü → Uygulama imzalama** → "Uygulama imzalama anahtarı
   sertifikası" altındaki **SHA-1** ve **SHA-256**'yı kopyalayın → Firebase Console → Proje ayarları →
   Android uygulaması → **Parmak izi ekle** (ikisini de) → `google-services.json`'u yeniden indirin →
   GitHub secret **GOOGLE_SERVICES_JSON**'u güncelleyin.
4. GitHub → Actions → Android Build → **Run workflow** → sürüm adı `1.0.1`.
5. Dahili test bağlantısından uygulamayı Play üzerinden kurup **Google ile giriş**'i deneyin.
   Çalışıyorsa: **Test ve yayınlama → Üretim → Yeni sürüm oluştur** → `tarif-kitabim-1.0.1.aab` →
   ülkeler: **Türkiye** (isterseniz tüm ülkeler) → İncelemeye gönder.

> 3. adım atlanırsa Play'den indirilen uygulamada Google ile giriş çalışmaz ve
> inceleme ekibi giriş yapamadığı için uygulama **reddedilebilir**.

---

## 1. Ana mağaza girişi (Büyüme → Mağaza varlığı → Ana mağaza girişi)

### Uygulama adı (en fazla 30)
```
Tarif Kitabım: Haftalık Menü
```

### Kısa açıklama (en fazla 80)
```
Haftalık yemek planı yap, tariflerini sakla, tarif kitabını PDF olarak indir.
```

### Tam açıklama (en fazla 4000)
```
Tarif Kitabım, haftalık yemek planınızı dakikalar içinde hazırlamanızı ve tüm tariflerinizi tek bir yerde saklamanızı sağlayan ücretsiz bir yemek planlayıcı ve kişisel tarif defteridir. Tariflerinizi, her tarif tek sayfa olacak şekilde şık bir PDF tarif kitabına dönüştürün; yazdırın, saklayın ya da sevdiklerinizle paylaşın.

🗓️ HAFTALIK YEMEK PLANLAYICI
• Kahvaltı, öğle ve akşam yemeklerini haftanın her günü için planlayın
• Tek dokunuşla öğün ekleyin, yemekleri arayın ve filtreleyin
• "Rastgele" ile tüm haftanın menüsünü saniyeler içinde oluşturun
• Günlük ve haftalık kalori özetini görün
• Planınızı kaydedin; telefon, tablet ve bilgisayardan erişin

📖 KİŞİSEL TARİF KİTABI
• Kendi tariflerinizi malzemeleri ve adımlarıyla yazın, düzenleyin
• Malzemeleri toplu olarak yapıştırın; birimler otomatik tanınır
• Beğendiğiniz tarifleri kaydedin, tek listede toplayın
• Tarife, açıklamaya veya malzemeye göre arayın; zorluk ve öğüne göre filtreleyin

👩‍🍳 PİŞİRİRKEN YANINIZDA
• Malzemeleri ve adımları tek tek işaretleyerek ilerleyin
• Porsiyonu artırın ya da azaltın; miktarlar otomatik hesaplanır
• Hazırlık ve pişirme sürelerini bir bakışta görün

📄 PDF TARİF KİTABI
• Kapak, tıklanabilir içindekiler ve her tarif için ayrı bir A4 sayfa
• Uzun tarifler otomatik olarak tek sayfaya sığdırılır
• Kitabınıza istediğiniz adı verin, hangi tariflerin gireceğini seçin
• Tek bir tarifi de PDF olarak indirebilir ya da paylaşabilirsiniz
• Türkçe karakterler eksiksiz ve okunaklı

🛒 ALIŞVERİŞ LİSTESİ
• Haftalık planınızı PDF olarak indirin
• Plandaki tariflerin malzemeleri birleştirilir, miktarlar toplanır
• Markete gitmeden önce listeniz hazır

👥 PAYLAŞ VE İLHAM AL
• Diğer kullanıcıları arayın ve takip edin
• Profillerdeki tarifleri inceleyin, beğendiklerinizi kitabınıza ekleyin

🔒 GÜVENLİ VE KOLAY
• Google hesabınızla tek dokunuşla giriş
• Tarifleriniz ve planlarınız hesabınıza bağlı olarak güvenle saklanır
• Türkçe ve İngilizce dil desteği — giriş ekranından değiştirin
• Web sürümü: haftalikyemek.space

Tarif Kitabım ücretsizdir ve reklamlarla desteklenir.

Öneri ve sorularınız için: bsckbilgi@gmail.com
```

### Görseller

| Alan | Dosya | Şart |
| --- | --- | --- |
| Uygulama simgesi | `graphics/uygulama-ikonu-512.png` | 512×512 PNG |
| Öne çıkan görsel | `graphics/one-cikan-gorsel-1024x500.png` | 1024×500, alfa yok |
| Telefon ekran görüntüleri (bu sırayla) | `graphics/telefon-01-planlayici.png` … `telefon-07-profil.png` | 1080×1920 (9:16), 2–8 adet |
| Video | — (isteğe bağlı, boş bırakın) | |

7 inç / 10 inç tablet ekran görüntüleri isteğe bağlıdır; boş bırakabilirsiniz.

---

## 2. Mağaza ayarları (Büyüme → Mağaza varlığı → Mağaza ayarları)

| Alan | Değer |
| --- | --- |
| Uygulama kategorisi | **Uygulama → Yiyecek ve İçecek** |
| Etiketler (en fazla 5) | Yemek tarifleri · Yemek planlama · Yemek pişirme · Alışveriş listesi · Sağlıklı beslenme (listede ne varsa en yakınları) |
| E-posta adresi | `bsckbilgi@gmail.com` |
| Web sitesi | `https://haftalikyemek.space` |
| Telefon | (isteğe bağlı, boş bırakılabilir) |
| Harici pazarlama | Açık |

> Web sitesi alanı AdMob'un `app-ads.txt` doğrulaması için gereklidir
> (`https://haftalikyemek.space/app-ads.txt` hazır).

---

## 3. Uygulama içeriği (Politika → Uygulama içeriği)

### Gizlilik politikası
```
https://haftalikyemek.space/privacy
```

### Reklamlar
**Evet, uygulamam reklam içeriyor.**

### Uygulama erişimi
**Bazı işlevler kısıtlı** → Talimat ekle:
- Ad: `Google ile giriş`
- Kullanıcı adı / şifre: boş
- Diğer bilgiler:
```
Uygulamanın tüm özellikleri Google hesabıyla giriş gerektirir. Giriş ekranındaki "Google ile Giriş Yap" düğmesine dokunup herhangi bir Google hesabı seçmeniz yeterlidir; ayrıca kayıt veya şifre gerekmez. Giriş sonrası Planlayıcı, Tarifler, PDF ve Profil sekmelerinin tamamı kullanılabilir.
```

### İçerik derecelendirmesi
- E-posta: `bsckbilgi@gmail.com` · Kategori: **Diğer tüm uygulama türleri**
- Şiddet, cinsellik, küfür, uyuşturucu, kumar, korku: **Hayır** (hepsi)
- Kullanıcılar etkileşimde bulunabiliyor veya içerik paylaşabiliyor mu: **Evet**
  (kullanıcılar tarif yayınlar ve birbirini takip eder)
- Kullanıcıların konumu paylaşılıyor mu: **Hayır**
- Dijital ürün satın alma: **Hayır**
- İnternet tarayıcısı / arama motoru mu: **Hayır**
- Beklenen sonuç: PEGI 3 / Herkes (+ "Kullanıcılar etkileşimde bulunur" notu)

### Hedef kitle ve içerik
- Hedef yaş grupları: **18 ve üzeri** (önerilen; reklamlı uygulamada en az inceleme gerektiren seçenek)
- Uygulama çocukların ilgisini çekebilir mi: **Hayır**

### Reklam kimliği
**Evet** → amaç: **Reklam veya pazarlama**
(Manifestte `com.google.android.gms.permission.AD_ID` izni tanımlı.)

### Veri güvenliği (Data safety)

**Genel sorular**
| Soru | Yanıt |
| --- | --- |
| Uygulamanız gerekli kullanıcı verisi türlerini topluyor veya paylaşıyor mu? | **Evet** |
| Toplanan tüm veriler aktarım sırasında şifreleniyor mu? | **Evet** |
| Hesap oluşturma yöntemi | **OAuth ile giriş** (Google) |
| Kullanıcılar verilerinin silinmesini isteyebilir mi? | **Evet** |
| Hesap silme bağlantısı | `https://haftalikyemek.space/privacy#pp-delete` |
| Hesabı silmeden veri silme | Evet — e-posta ile (aynı bağlantı) |

**Veri türleri**
| Kategori → Tür | Toplanıyor | Paylaşılıyor | Geçici mi | Zorunlu mu | Amaçlar |
| --- | --- | --- | --- | --- | --- |
| Kişisel bilgiler → Ad | ✔ | — | Hayır | Zorunlu | Uygulama işlevselliği, Hesap yönetimi |
| Kişisel bilgiler → E-posta adresi | ✔ | — | Hayır | Zorunlu | Uygulama işlevselliği, Hesap yönetimi |
| Kişisel bilgiler → Kullanıcı kimlikleri | ✔ | — | Hayır | Zorunlu | Uygulama işlevselliği, Hesap yönetimi |
| Konum → Yaklaşık konum | ✔ | ✔ | Hayır | İsteğe bağlı | Reklam veya pazarlama (AdMob, IP'den) |
| Uygulama etkinliği → Uygulama etkileşimleri | ✔ | ✔ | Hayır | İsteğe bağlı | Reklam veya pazarlama, Analiz |
| Uygulama etkinliği → Kullanıcı tarafından oluşturulan diğer içerikler | ✔ | — | Hayır | Zorunlu | Uygulama işlevselliği |
| Uygulama bilgileri ve performansı → Kilitlenme günlükleri | ✔ | ✔ | Hayır | İsteğe bağlı | Analiz |
| Uygulama bilgileri ve performansı → Diğer uygulama performansı verileri (Tanılama) | ✔ | ✔ | Hayır | İsteğe bağlı | Analiz |
| Cihaz veya diğer kimlikler → Cihaz veya diğer kimlikler | ✔ | ✔ | Hayır | İsteğe bağlı | Reklam veya pazarlama, Analiz |

"Kullanıcı tarafından oluşturulan diğer içerikler" = tarifler, yemekler, haftalık planlar.
Paylaşılan veriler yalnızca Google AdMob (reklam SDK'sı) içindir. Güncel AdMob beyan rehberi:
https://developers.google.com/admob/android/privacy/play-data-disclosure

### Diğer beyanlar
| Form | Yanıt |
| --- | --- |
| Devlet uygulaması | Hayır |
| Finansal özellikler | Uygulamam finansal özellik sunmuyor |
| Sağlık uygulaması | Hayır (sağlık özelliği yok) |
| Haber uygulaması | Hayır |
| Veri yedekleme / Foreground service vb. | Sorulursa: kullanılmıyor |

---

## 4. Sürüm notları

### 1.0.0 / 1.0.1 (ilk yayın) — en fazla 500
```
<tr-TR>
Tarif Kitabım'a hoş geldiniz! 🎉
• Haftalık yemek planlayıcı: kahvaltı, öğle ve akşam
• Kişisel tarif kitabı: tarif ekle, düzenle, kaydet
• Tarif kitabını PDF olarak indir — her tarif tek sayfa
• Haftalık plan PDF'i ve otomatik alışveriş listesi
• Porsiyon ölçekleme ve adım adım pişirme modu
</tr-TR>
```

---

## 5. (İsteğe bağlı) İngilizce mağaza girişi — en-US

Ana mağaza girişi → **Çevirileri yönet → Kendi çevirilerinizi ekleyin → English (United States)**.

**Name:** `Recipe Book: Weekly Meal Plan`

**Short description:**
```
Plan weekly meals, keep your recipes and export your recipe book as a PDF.
```

**Full description:**
```
Recipe Book (Tarif Kitabım) is a free weekly meal planner and personal recipe book. Plan breakfast, lunch and dinner for the whole week in minutes, keep all your recipes in one place, and turn them into a beautiful PDF cookbook — one recipe per page.

• Weekly meal planner with one-tap adding and a "Random" week generator
• Personal recipe book: write, edit, search and save recipes
• Cooking mode: tick off ingredients and steps, scale servings automatically
• PDF cookbook with cover, clickable table of contents and one A4 page per recipe
• Weekly plan PDF with a combined shopping list
• Follow other cooks and save their recipes
• Sign in with Google; your data syncs across phone, tablet and web (haftalikyemek.space)

Available in English and Turkish — switch anytime from the sign-in screen. Free, supported by ads.
Contact: bsckbilgi@gmail.com
```

---

## 6. Sonraki güncellemeler

1. Kodu `main`'e gönderin (ya da Actions → Android Build → Run workflow, sürüm adı ör. `1.1.0`).
2. Artifacts'tan `.aab`'yi indirin → Play Console → Üretim → Yeni sürüm → yükleyin, sürüm notu yazın.
3. `versionCode` her derlemede otomatik artar; aynı `.aab` iki kez yüklenemez.
