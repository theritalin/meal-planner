// Sık sorulan sorular — giriş sayfasında gösterilir.
// AEO/GEO: Aynı soru-cevaplar public/index.html (FAQPage JSON-LD + statik
// içerik) ve public/llms.txt içinde de yer alır. Değiştirirseniz üçünü
// birlikte güncelleyin.
const FAQ = [
  {
    q: "Tarif Kitabım nedir?",
    a: "Tarif Kitabım, haftalık yemek planı hazırlamanızı ve kendi tariflerinizi tek yerde saklamanızı sağlayan ücretsiz bir web uygulamasıdır. Tariflerinizi her tarif tek sayfa olacak şekilde PDF tarif kitabına dönüştürebilirsiniz.",
  },
  {
    q: "Ücretsiz mi?",
    a: "Evet. Tarif Kitabım tamamen ücretsizdir; reklamlarla desteklenir. Google hesabınızla giriş yapmanız yeterlidir.",
  },
  {
    q: "Haftalık yemek planı nasıl hazırlanır?",
    a: "Giriş yaptıktan sonra Planlayıcı sayfasında yemekleri kahvaltı, öğle ve akşam öğünlerine sürükleyip bırakın (telefonda dokunarak ekleyin). İsterseniz Rastgele butonuyla tüm haftayı tek tıkla otomatik doldurabilirsiniz.",
  },
  {
    q: "Tarif kitabımı PDF olarak nasıl indiririm?",
    a: "PDF sayfasında kitaba eklemek istediğiniz tarifleri seçin, kitabınıza bir ad verin ve PDF İndir'e dokunun. Kapak, tıklanabilir içindekiler ve her tarif için bir sayfa içeren A4 bir PDF oluşturulur.",
  },
  {
    q: "Her tarif tek sayfaya sığıyor mu?",
    a: "Evet, mümkün olduğunca. Uzun tariflerde yazı boyutu ve düzen otomatik olarak küçültülür ya da tek sütuna geçilir; yalnızca çok uzun tarifler ikinci sayfaya taşar.",
  },
  {
    q: "Alışveriş listesi oluşturabilir miyim?",
    a: "Evet. Haftalık planınızı PDF olarak indirdiğinizde, plandaki tariflerin malzemeleri birleştirilerek miktarları toplanmış bir alışveriş listesi de oluşturulur.",
  },
  {
    q: "Telefonda kullanılabilir mi?",
    a: "Evet. Uygulama telefona uyumludur ve tarayıcıdan ana ekrana eklenebilir. Android uygulaması da hazırlanmaktadır.",
  },
  {
    q: "Tariflerim nerede saklanır?",
    a: "Tarifleriniz ve planlarınız Google hesabınıza bağlı olarak Google Firebase üzerinde saklanır; her cihazdan erişebilirsiniz. Ayrıntılar Gizlilik Politikası sayfasındadır.",
  },
];

export default FAQ;
