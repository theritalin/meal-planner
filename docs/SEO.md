# SEO / GEO / AEO — arama motorları ve yapay zekâ asistanları

Amaç: Google, Bing ve ChatGPT / Gemini / Perplexity / Claude / Copilot gibi
yapay zekâ asistanlarının siteyi bulup kullanıcıya önermesi ve gelen ziyaretleri ölçmek.

## Kodda yapılanlar

| Dosya | Ne işe yarar |
| --- | --- |
| `public/index.html` | Başlık, açıklama, canonical, Open Graph / Twitter kartı, **JSON-LD** (WebApplication, WebSite, FAQPage) ve JavaScript çalıştırmayan botlar için **statik içerik** (özellikler + SSS). Çoğu yapay zekâ tarayıcısı JS çalıştırmaz; bu içerik onların gördüğü sayfadır. |
| `public/robots.txt` | Tüm arama motorları ve yapay zekâ botları (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…) açıkça izinli; `/profile/` hariç. |
| `public/sitemap.xml` | Herkese açık sayfalar. |
| `public/llms.txt` | Yapay zekâ modelleri için sitenin Markdown özeti + SSS ("bu uygulamayı hangi sorularda önerebilirsiniz"). |
| `public/og-image.png` | Paylaşım görseli (1200×630). |
| `src/content/faq.js` | SSS'nin tek kaynağı; giriş sayfasında görünür. `src/content/seoSync.test.js` index.html ve llms.txt ile aynı kaldığını denetler. |
| Vercel Web Analytics | `index.html` içinde çerezsiz analitik betiği; yönlendiren siteleri (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com…) gösterir. |

## Sizin yapmanız gerekenler

1. **Vercel Analytics'i açın:** Vercel → proje → *Analytics* → *Enable*. Yapay zekâdan gelen
   ziyaretler *Referrers* bölümünde görünür (ChatGPT bağlantıları ayrıca `utm_source=chatgpt.com` ekler).
2. **Google Search Console:** https://search.google.com/search-console → mülk ekleyin
   (URL öneki) → doğrulayın → *Site haritaları* bölümüne `sitemap.xml` gönderin.
   Google AI Overviews / Gemini bu dizini kullanır.
3. **Bing Webmaster Tools:** https://www.bing.com/webmasters → siteyi ekleyin (Search Console'dan
   içe aktarabilirsiniz) → sitemap gönderin. **ChatGPT arama ve Copilot Bing dizinini kullanır**;
   bu adım yapay zekâ görünürlüğü için önemlidir. IndexNow'u da açabilirsiniz.
4. **Kendi alan adı:** `*.vercel.app` yerine kendi alan adınızı aldığınızda şu dosyalardaki
   `https://haftalikyemek.vercel.app` adresini değiştirin: `public/index.html`, `public/robots.txt`,
   `public/sitemap.xml`, `public/llms.txt`.
5. **Bahsedilme (en etkili GEO adımı):** Yapay zekâ asistanları, başka sitelerde adı geçen
   uygulamaları önerir. Uygulamayı yemek blogları, Ekşi Sözlük, Reddit (r/Turkey, r/yemek),
   Product Hunt, Google Play (yayınlanınca) gibi yerlerde tanıtın; tutarlı olarak
   "Tarif Kitabım — ücretsiz haftalık yemek planlayıcı" adını kullanın.

## SSS'yi güncellemek

`src/content/faq.js` dosyasını değiştirin, ardından `public/index.html` içindeki FAQPage
JSON-LD ve statik `<details>` blokları ile `public/llms.txt` SSS bölümünü güncelleyin.
`npm test` uyumsuzluk varsa başarısız olur.
