# SEO / GEO / AEO — arama motorları ve yapay zekâ asistanları

Amaç: Google, Bing ve ChatGPT / Gemini / Perplexity / Claude / Copilot gibi
yapay zekâ asistanlarının siteyi bulup kullanıcıya önermesi ve gelen ziyaretleri ölçmek.

## Kodda yapılanlar

| Dosya | Ne işe yarar |
| --- | --- |
| `public/index.html` | Başlık, açıklama, canonical, Open Graph / Twitter kartı, **JSON-LD** (WebApplication, WebSite, FAQPage) ve JavaScript çalıştırmayan botlar için **statik içerik** (özellikler + SSS). Çoğu yapay zekâ tarayıcısı JS çalıştırmaz; bu içerik onların gördüğü sayfadır. |
| `scripts/prerender.mjs` | Derleme sonrası (`npm run build` = `react-scripts build && node scripts/prerender.mjs`) her herkese açık sayfa için statik HTML üretir — aşağıya bakın. |
| `src/content/recipes.json`, `src/content/guides.json` | Herkese açık tarif ve rehber içeriğinin tek kaynağı (React sayfaları ve prerender aynı veriyi kullanır). |
| `public/robots.txt` | Tüm arama motorları ve yapay zekâ botları (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…) açıkça izinli; `/profile/` hariç. |
| `public/sitemap.xml` | Herkese açık sayfalar (tüm tarif ve rehber URL'leri). Derlemede `build/sitemap.xml` veriden yeniden üretilir. |
| `public/llms.txt` | Yapay zekâ modelleri için sitenin Markdown özeti + SSS ("bu uygulamayı hangi sorularda önerebilirsiniz"). |
| `public/og-image.png` | Paylaşım görseli (1200×630). |
| `src/content/faq.js` | SSS'nin tek kaynağı; giriş sayfasında görünür. `src/content/seoSync.test.js` index.html ve llms.txt ile aynı kaldığını denetler. |
| Vercel Web Analytics | `index.html` içinde çerezsiz analitik betiği; yönlendiren siteleri (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com…) gösterir. |

## Herkese açık içerik sayfaları ve prerender

Herkese açık sayfalar: `/` (oturum açmamış ziyaretçi), `/tarifler`, `/tarifler/<slug>`,
`/rehberler`, `/rehberler/<slug>`, `/hakkimizda`. Uygulama bir SPA olduğundan, bu sayfaların
içeriği JavaScript çalıştırmayan tarayıcılara (çoğu yapay zekâ botu, AdSense incelemesi)
`scripts/prerender.mjs` ile üretilen statik HTML olarak sunulur:

- `build/index.html` şablon alınır; her sayfa için `build/<yol>/index.html` yazılır.
- Başlık, açıklama, canonical (`https://haftalikyemek.space/<yol>`, sonda `/` yok), Open Graph /
  Twitter etiketleri sayfaya göre değiştirilir; ana sayfanın JSON-LD'si (WebApplication, FAQPage)
  alt sayfalardan kaldırılır ve yerine **Recipe** (tarif), **Article** (rehber),
  **CollectionPage + ItemList** (listeler), **AboutPage** ve **BreadcrumbList** eklenir.
- `#root` içine gerçek içerik (başlık, giriş, malzemeler, adımlar, püf noktaları, ilgili
  bağlantılar, menü ve alt bilgi) yazılır; görünüm `public/index.html`'deki `.seo-static` CSS'iyle.
  React yüklenince bu içerik uygulamayla değiştirilir.
- Kök `build/index.html` statik bloğuna öne çıkan 6 tarif ve rehber bağlantıları eklenir (SSS korunur).
- `build/sitemap.xml` ve `build/llms.txt` (tarif koleksiyonu + rehberler bölümü) veriden üretilir.
- Vercel: `vercel.json` içinde `"trailingSlash": false`. Vercel önce dosya sistemine bakar;
  `/tarifler/x` isteği `build/tarifler/x/index.html`'e karşılık gelir, `/tarifler/x/` 308 ile
  `/tarifler/x`'e yönlenir. Dosyası olmayan yollar SPA için `index.html`'e yeniden yazılır.

Tarif/rehber ekledikten sonra `public/` dosyalarını güncel tutmak için:

```
npm run build && node scripts/prerender.mjs --write-public   # public/sitemap.xml + public/llms.txt
node --test scripts/prerender.test.mjs                         # prerender testleri (npm test de çalıştırır)
```

## Sizin yapmanız gerekenler

1. **Vercel Analytics'i açın:** Vercel → proje → *Analytics* → *Enable*. Yapay zekâdan gelen
   ziyaretler *Referrers* bölümünde görünür (ChatGPT bağlantıları ayrıca `utm_source=chatgpt.com` ekler).
2. **Google Search Console:** https://search.google.com/search-console → mülk ekleyin
   (URL öneki) → doğrulayın → *Site haritaları* bölümüne `sitemap.xml` gönderin.
   Google AI Overviews / Gemini bu dizini kullanır.
3. **Bing Webmaster Tools:** https://www.bing.com/webmasters → siteyi ekleyin (Search Console'dan
   içe aktarabilirsiniz) → sitemap gönderin. **ChatGPT arama ve Copilot Bing dizinini kullanır**;
   bu adım yapay zekâ görünürlüğü için önemlidir. IndexNow'u da açabilirsiniz.
4. **Alan adı:** Asıl adres `https://haftalikyemek.space` (www'suz). Adres değişirse şu
   dosyalardaki adresi güncelleyin: `public/index.html`, `public/robots.txt`,
   `public/sitemap.xml`, `public/llms.txt`, `scripts/prerender.mjs` (`SITE`).
   Ayrıca Google'ın [Zengin Sonuçlar Testi](https://search.google.com/test/rich-results) ile
   bir tarif URL'sinin Recipe verisini doğrulayın.
5. **Bahsedilme (en etkili GEO adımı):** Yapay zekâ asistanları, başka sitelerde adı geçen
   uygulamaları önerir. Uygulamayı yemek blogları, Ekşi Sözlük, Reddit (r/Turkey, r/yemek),
   Product Hunt, Google Play (yayınlanınca) gibi yerlerde tanıtın; tutarlı olarak
   "Tarif Kitabım — ücretsiz haftalık yemek planlayıcı" adını kullanın.

## SSS'yi güncellemek

`src/content/faq.js` dosyasını değiştirin, ardından `public/index.html` içindeki FAQPage
JSON-LD ve statik `<details>` blokları ile `public/llms.txt` SSS bölümünü güncelleyin.
`npm test` uyumsuzluk varsa başarısız olur.
