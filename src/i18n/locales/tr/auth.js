const auth = {
  login: {
    tagline: "Haftalık planla, tariflerini sakla, PDF olarak paylaş",
    features: {
      planner: {
        title: "Planlayıcı",
        text: "Haftanın yemeklerini sürükle-bırak ile dakikalar içinde planla.",
      },
      recipes: {
        title: "Tarif Kitabı",
        text: "Kendi tariflerini ve beğendiklerini tek yerde sakla.",
      },
      pdf: {
        title: "PDF",
        text: "Planını ya da tarif kitabını PDF olarak indir, paylaş.",
      },
    },
    google: "Google ile Giriş Yap",
    signingIn: "Giriş yapılıyor…",
    footer:
      "Giriş yaparak planlarınızı ve tariflerinizi her cihazdan erişilebilir şekilde saklarsınız.",
    privacy: "Gizlilik Politikası",
    faqTitle: "Sık Sorulan Sorular",
    errors: {
      popupClosed:
        "Giriş penceresi kapatıldı. Tekrar denemek için butona dokunun.",
      popupBlocked:
        "Tarayıcınız giriş penceresini engelledi. Açılır pencerelere izin verip tekrar deneyin.",
      network:
        "İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edip tekrar deneyin.",
      unauthorizedDomain:
        "Bu alan adı ({host}) Firebase'de yetkili değil. Firebase Console > Authentication > Settings > Authorized domains listesine ekleyin.",
      invalidApiKey:
        "Firebase API anahtarı eksik veya hatalı. Ortam değişkenlerini (REACT_APP_FIREBASE_*) kontrol edin.",
      operationNotAllowed:
        "Google ile giriş Firebase'de etkin değil. Firebase Console > Authentication > Sign-in method bölümünden Google'ı etkinleştirin.",
      nativeConfig:
        "Google ile giriş bu uygulama sürümü için yapılandırılmamış. Uygulamanın imza parmak izleri (SHA-1/SHA-256) Firebase'e eklenmeli ve google-services.json güncellenmeli.",
      noAccount:
        "Cihazda Google hesabı bulunamadı. Ayarlar > Hesaplar bölümünden bir Google hesabı ekleyip tekrar deneyin.",
      generic:
        "Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.",
    },
  },
  signOut: "Çıkış Yap",
  unnamedUser: "İsimsiz Kullanıcı",
  user: "Kullanıcı",
  you: " (siz)",
  search: {
    placeholder: "Kullanıcı ara…",
    ariaLabel: "Kullanıcı ara",
    searching: "Aranıyor…",
    minChars: "En az {count} harf yazın",
    noResults: "Kullanıcı bulunamadı",
  },
  profile: {
    loading: "Yükleniyor",
    notFound: {
      title: "Kullanıcı bulunamadı",
      text: "Aradığınız profil silinmiş ya da hiç var olmamış olabilir.",
      home: "Ana sayfaya dön",
    },
    tabsLabel: "Profil sekmeleri",
    tabs: {
      recipes: "Tarifler ({count})",
      saved: "Kaydedilenler ({count})",
    },
    empty: {
      ownRecipes: "Henüz kendi tarifinizi eklemediniz.",
      goToRecipes: "Tarif Kitabına git",
      othersRecipes: "{name} henüz tarif paylaşmadı.",
      thisUser: "Bu kullanıcı",
      saved: "Henüz hiç tarif kaydetmediniz.",
    },
    unsave: "Kayıttan Kaldır",
    snackbar: {
      followed: "Takip edildi",
      unfollowed: "Takipten çıkıldı",
      followError: "Takip işlemi sırasında bir hata oluştu",
      profileUpdated: "Profil güncellendi",
      profileUpdateError: "Profil güncellenirken bir hata oluştu",
      recipeSaved: "Tarif kaydedilenlere eklendi",
      recipeSaveError: "Tarif kaydedilemedi",
      recipeUnsaved: "Tarif kaydedilenlerden kaldırıldı",
      recipeUnsaveError: "Tarif kaldırılamadı",
    },
    header: {
      edit: "Profili Düzenle",
      follow: "Takip Et",
      unfollow: "Takibi Bırak",
      noAbout:
        'Henüz kendinizden bahsetmediniz. "Profili Düzenle" ile kısa bir tanıtım ekleyebilirsiniz.',
      showList: "{label} listesini göster",
    },
    stats: {
      recipes: "Tarif",
      saved: "Kaydedilen",
      followers: "Takipçi",
      following: "Takip",
    },
    followList: {
      followers: "Takipçiler",
      following: "Takip Edilenler",
      empty: "Henüz kimse yok.",
    },
    edit: {
      title: "Profili Düzenle",
      name: "Görünen ad",
      nameRequired: "Ad boş olamaz",
      about: "Hakkımda",
      aboutPlaceholder: "Mutfakta en çok neyi seversiniz?",
      cancel: "Vazgeç",
      save: "Kaydet",
    },
    account: {
      title: "Hesap",
      privacy: "Gizlilik Politikası",
      language: "Dil / Language",
      deleteTitle: "Hesabımı sil",
      deleteBefore:
        "Hesabınızın ve tüm verilerinizin (tarifler, planlar, kaydedilenler) kalıcı olarak silinmesi için",
      deleteAfter:
        "adresine hesabınıza bağlı e-posta adresinden yazın. Talebiniz en geç 30 gün içinde işleme alınır.",
      mailSubject: "Hesap silme talebi",
      mailBody:
        "Merhaba,\n\nTarif Kitabım hesabımın ve tüm verilerimin silinmesini talep ediyorum.\n\nHesap e-postası: {email}\n",
    },
    preview: {
      prep: "Hazırlık: {count} dk",
      cook: "Pişirme: {count} dk",
      ingredients: "Malzemeler",
      noIngredients: "Malzeme eklenmemiş.",
      instructions: "Hazırlanışı",
      noInstructions: "Hazırlanış adımı eklenmemiş.",
      notes: "Notlar",
      save: "Kaydet",
      saved: "Kaydedildi",
    },
  },
};

export default auth;
