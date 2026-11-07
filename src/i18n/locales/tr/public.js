// Herkese açık sayfalar (ana sayfa, tarifler, rehberler, hakkımızda).
const publicNs = {
  nav: {
    home: "Ana sayfa",
    recipes: "Tarifler",
    guides: "Rehberler",
    about: "Hakkımızda",
    login: "Giriş yap",
    start: "Ücretsiz başla",
    privacy: "Gizlilik Politikası",
    menu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    publicRecipes: "Tarif koleksiyonu",
  },
  footer: {
    tagline:
      "Haftalık yemek planlayıcı, kişisel tarif defteri ve denenmiş ev tarifleri.",
    explore: "Keşfet",
    info: "Bilgi",
    contact: "İletişim",
    rights: "Tüm hakları saklıdır.",
  },
  categories: {
    corba: "Çorbalar",
    anaYemek: "Ana yemekler",
    zeytinyagli: "Zeytinyağlılar",
    sebze: "Sebze yemekleri",
    kahvalti: "Kahvaltılıklar",
    salata: "Salatalar",
    hamurIsi: "Hamur işleri",
    pilavMakarna: "Pilav ve makarna",
    tatli: "Tatlılar",
    other: "Diğer",
  },
  home: {
    metaTitle: "Haftalık yemek planı ve ev tarifleri",
    metaDescription:
      "Haftalık yemek planınızı hazırlayın, tariflerinizi saklayın ve denenmiş ev tariflerini keşfedin. Ücretsiz, Türkçe ve telefona uyumlu.",
    eyebrow: "Ücretsiz haftalık yemek planlayıcı",
    title: "“Bugün ne pişirsem?” sorusuna haftalık bir cevap",
    subtitle:
      "Tarif Kitabım ile haftanın menüsünü dakikalar içinde planlayın, kendi tariflerinizi tek yerde saklayın ve hepsini yazdırılabilir bir PDF tarif kitabına dönüştürün.",
    cta: "Ücretsiz başla",
    browse: "Tariflere göz at",
    featuresTitle: "Mutfakta düzen, sofrada çeşit",
    features: {
      planner: {
        title: "Haftalık planlayıcı",
        text: "Kahvaltı, öğle ve akşam öğünlerini sürükle-bırak ile yerleştirin ya da tek dokunuşla haftayı otomatik doldurun.",
      },
      recipes: {
        title: "Kişisel tarif defteri",
        text: "Kendi tariflerinizi malzeme, adım ve notlarıyla kaydedin; beğendiğiniz hazır tarifleri kitabınıza ekleyin.",
      },
      pdf: {
        title: "PDF tarif kitabı",
        text: "Seçtiğiniz tarifleri kapaklı, içindekiler sayfalı bir PDF'e dönüştürün; haftalık plandan alışveriş listesi çıkarın.",
      },
    },
    featuredTitle: "Öne çıkan tarifler",
    featuredSubtitle:
      "Mutfağımızda denenmiş, adım adım anlatılmış ev yemekleri.",
    allRecipes: "Tüm tarifler",
    guidesTitle: "Rehberler",
    guidesSubtitle:
      "Menü planlama, alışveriş ve saklama üzerine pratik yazılar.",
    allGuides: "Tüm rehberler",
    faqTitle: "Sık sorulan sorular",
    faqMore: "Daha fazlası için giriş sayfasına göz atın",
    ctaTitle: "Haftanızı planlamaya hazır mısınız?",
    ctaText:
      "Google hesabınızla saniyeler içinde giriş yapın; planlarınız ve tarifleriniz her cihazda sizinle.",
  },
  recipeList: {
    metaTitle: "Tarifler",
    metaDescription:
      "Çorbadan tatlıya denenmiş ev tarifleri: malzemeler, adım adım yapılış, pişirme süresi ve püf noktalarıyla.",
    title: "Ev tarifleri",
    intro:
      "Haftalık menünüze ilham olacak, mutfağımızda denenmiş tarifler. Her tarifte malzeme listesi, adım adım yapılış, hazırlık ve pişirme süreleri ile püf noktaları bulunur. Beğendiğiniz tarifi tek dokunuşla kendi tarif kitabınıza kaydedebilirsiniz.",
    searchLabel: "Tariflerde ara",
    searchPlaceholder: "Tarif adı, malzeme…",
    filterLabel: "Kategori",
    all: "Tümü",
    count: ({ count }) => `${count} tarif`,
    empty: "Aramanızla eşleşen tarif bulunamadı.",
    clear: "Filtreleri temizle",
  },
  recipe: {
    breadcrumb: "Sayfa konumu",
    prep: "Hazırlık",
    cook: "Pişirme",
    total: "Toplam",
    servings: "Porsiyon",
    difficulty: "Zorluk",
    calories: "Kalori (porsiyon)",
    ingredients: "Malzemeler",
    instructions: "Yapılışı",
    tips: "Püf noktaları",
    related: "Benzer tarifler",
    save: "Tarif kitabıma kaydet",
    saving: "Kaydediliyor…",
    saved: "Tarif kitabınıza kaydedildi.",
    alreadySaved: "Tarif kitabınızda",
    saveError: "Tarif kaydedilemedi. Lütfen tekrar deneyin.",
    loginHint: "Kaydetmek için ücretsiz giriş yapın.",
    openBook: "Tarif kitabımı aç",
    notFoundTitle: "Tarif bulunamadı",
    notFoundText:
      "Aradığınız tarif kaldırılmış ya da adresi değişmiş olabilir. Diğer tariflerimize göz atabilirsiniz.",
    backToList: "Tüm tariflere dön",
    openAria: ({ name }) => `${name} tarifini aç`,
  },
  guideList: {
    metaTitle: "Rehberler",
    metaDescription:
      "Haftalık yemek planı, akıllı alışveriş, yemek saklama ve pratik mutfak düzeni üzerine Türkçe rehberler.",
    title: "Mutfak rehberleri",
    intro:
      "Haftalık menü hazırlamaktan alışveriş listesine, artan yemekleri değerlendirmekten mutfak düzenine kadar günlük hayatı kolaylaştıran pratik rehberler.",
    read: "Rehberi oku",
    empty: "Henüz rehber yok.",
  },
  guide: {
    readingTime: ({ count }) => `${count} dk okuma`,
    updated: ({ date }) => `Güncelleme: ${date}`,
    tip: "İpucu",
    relatedRecipes: "Bu rehberle ilgili tarifler",
    otherGuides: "Diğer rehberler",
    notFoundTitle: "Rehber bulunamadı",
    notFoundText:
      "Aradığınız rehber kaldırılmış ya da adresi değişmiş olabilir.",
    backToList: "Tüm rehberlere dön",
  },
  about: {
    metaTitle: "Hakkımızda",
    metaDescription:
      "Tarif Kitabım'ı kimin, neden hazırladığını, içerik politikamızı ve bize nasıl ulaşabileceğinizi öğrenin.",
    title: "Hakkımızda",
    lead: "Tarif Kitabım, ev yemeklerini seven ve haftalık menü hazırlamayı kolaylaştırmak isteyen küçük bir ekibin projesidir.",
    whoTitle: "Biz kimiz?",
    whoText:
      "Her akşam “bugün ne pişirsek?” sorusuyla uğraşmaktan yorulan, tariflerini defter kenarlarında ve telefon notlarında kaybeden biri olarak bu uygulamayı önce kendimiz için yaptık. Bugün haftalık planlarını ve tariflerini tek yerde tutmak isteyen herkes için ücretsiz olarak sunuyoruz.",
    appTitle: "Uygulama ne yapar?",
    appItems: [
      "Kahvaltı, öğle ve akşam öğünlerinden oluşan haftalık yemek planı hazırlar; isterseniz haftayı otomatik doldurur.",
      "Kendi tariflerinizi malzemeleri, adımları ve notlarıyla saklar; beğendiğiniz hazır tarifleri kitabınıza eklemenizi sağlar.",
      "Seçtiğiniz tariflerden yazdırılabilir bir PDF tarif kitabı ve haftalık plandan alışveriş listesi oluşturur.",
      "Telefon, tablet ve bilgisayarda çalışır; verileriniz Google hesabınızla her cihazda senkronize olur.",
    ],
    policyTitle: "İçerik politikamız",
    policyText:
      "Sitede yayınlanan tarifler ve rehberler özgündür; başka sitelerden kopyalanmaz. Tarifler ev mutfağında denenmiş, ölçüleri ve süreleri gerçek pişirme deneyimine göre yazılmıştır. Kalori değerleri porsiyon başına yaklaşık değerlerdir ve tıbbi ya da diyet tavsiyesi yerine geçmez. Bir hata fark ederseniz bize yazmanız yeterli; içerikleri düzenli olarak gözden geçirip güncelliyoruz.",
    adsTitle: "Reklamlar ve gizlilik",
    adsText:
      "Tarif Kitabım ücretsizdir ve reklamlarla desteklenir. Verilerinizi nasıl işlediğimizi Gizlilik Politikası sayfasında ayrıntılı olarak bulabilirsiniz.",
    contactTitle: "İletişim",
    contactText:
      "Öneri, hata bildirimi veya iş birliği için bize e-postayla ulaşabilirsiniz:",
    linksTitle: "Göz atın",
  },
};

export default publicNs;
