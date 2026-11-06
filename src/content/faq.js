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

// İngilizce SSS (yalnızca uygulama içinde; SEO dosyaları Türkçe SSS'yi kullanır).
export const FAQ_EN = [
  {
    q: "What is Tarif Kitabım (Recipe Book)?",
    a: "Tarif Kitabım is a free web app for planning your weekly meals and keeping all your own recipes in one place. You can turn your recipes into a PDF recipe book, with each recipe on its own page.",
  },
  {
    q: "Is it free?",
    a: "Yes. Tarif Kitabım is completely free and supported by ads. All you need is a Google account to sign in.",
  },
  {
    q: "How do I plan my meals for the week?",
    a: "After signing in, open the Planner and drag meals into the breakfast, lunch and dinner slots (on your phone, tap to add them). You can also fill the whole week automatically with a single tap on the Random button.",
  },
  {
    q: "How do I download my recipe book as a PDF?",
    a: "On the PDF page, pick the recipes you want in your book, give it a name and tap Download PDF. You'll get an A4 PDF with a cover, a clickable table of contents and one page per recipe.",
  },
  {
    q: "Does each recipe fit on a single page?",
    a: "Yes, whenever possible. For longer recipes the font size and layout are reduced automatically or switched to a single column; only very long recipes spill over onto a second page.",
  },
  {
    q: "Can I create a shopping list?",
    a: "Yes. When you download your weekly plan as a PDF, the ingredients of the planned recipes are combined into a shopping list with the quantities added up.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. The app works great on phones and can be added to your home screen from the browser. An Android app is also on the way.",
  },
  {
    q: "Where are my recipes stored?",
    a: "Your recipes and plans are stored on Google Firebase, linked to your Google account, so you can access them from any device. See the Privacy Policy for details.",
  },
];

/** Dile göre SSS listesi (varsayılan Türkçe). */
export const getFaq = (lang) => (lang === "en" ? FAQ_EN : FAQ);

export default FAQ;
