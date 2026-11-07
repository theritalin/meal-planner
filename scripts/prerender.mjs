#!/usr/bin/env node
/**
 * Derleme sonrası statik HTML üretici (prerender).
 *
 * `react-scripts build` sonrasında çalışır ("build" betiği) ve herkese açık her
 * içerik sayfası için build/<yol>/index.html yazar. Böylece JavaScript
 * çalıştırmayan arama motoru / yapay zekâ tarayıcıları ve AdSense incelemesi
 * gerçek içeriği (tarif, rehber) doğrudan HTML'de görür. React yüklenince
 * #root içeriği uygulamayla değiştirilir.
 *
 * Veri: src/content/recipes.json, src/content/guides.json (tek kaynak).
 * Şablon: build/index.html (CRA çıktısı; betik/stil etiketleri korunur).
 *
 * Çıktılar:
 *   build/tarifler/index.html, build/tarifler/<slug>/index.html,
 *   build/rehberler/index.html, build/rehberler/<slug>/index.html,
 *   build/hakkimizda/index.html, build/index.html (öne çıkan tarifler eklenir),
 *   build/sitemap.xml, build/llms.txt
 *
 * Kullanım:
 *   node scripts/prerender.mjs                 # build/ içine yazar
 *   node scripts/prerender.mjs --build-dir X   # başka bir dizin
 *   node scripts/prerender.mjs --write-public  # ayrıca public/sitemap.xml ve
 *                                              # public/llms.txt'yi veriden günceller
 *
 * Bağımlılık yok (yalnızca Node yerleşik modülleri).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SITE = "https://haftalikyemek.space";
export const SITE_NAME = "Tarif Kitabım";
export const CONTACT_EMAIL = "bsckbilgi@gmail.com";
export const OG_IMAGE = `${SITE}/og-image.png`;

export const CATEGORY_LABELS = {
  corba: "Çorbalar",
  "ana-yemek": "Ana Yemekler",
  zeytinyagli: "Zeytinyağlılar",
  sebze: "Sebze Yemekleri",
  kahvalti: "Kahvaltılıklar",
  salata: "Salatalar",
  "hamur-isi": "Hamur İşleri",
  "pilav-makarna": "Pilav ve Makarnalar",
  tatli: "Tatlılar",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);
const DIFFICULTY_LABELS = { easy: "Kolay", medium: "Orta", hard: "Zor" };
const MEAL_LABELS = { breakfast: "Kahvaltı", lunch: "Öğle yemeği", dinner: "Akşam yemeği" };

/* -------------------------------------------------------------------------- */
/* Yardımcılar                                                                */
/* -------------------------------------------------------------------------- */

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeXml = escapeHtml;

/** Dakikayı ISO-8601 süresine çevirir: 90 → "PT1H30M". */
export const isoDuration = (minutes) => {
  const total = Math.max(0, Math.round(Number(minutes) || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (!h && !m) return "PT0M";
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}`;
};

/** JSON-LD'yi <script> içine güvenle gömer (</script> kaçışı). */
const jsonLdScript = (data) =>
  `<script type="application/ld+json">${JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")}</script>`;

const abs = (p) => `${SITE}${p}`;
export const recipePath = (slug) => `/tarifler/${slug}`;
export const guidePath = (slug) => `/rehberler/${slug}`;

const ingredientText = (ing) =>
  [ing.amount, ing.unit, ing.name].map((x) => String(x ?? "").trim()).filter(Boolean).join(" ");

const formatMinutes = (m) => {
  const total = Math.round(Number(m) || 0);
  const h = Math.floor(total / 60);
  const r = total % 60;
  if (h && r) return `${h} sa ${r} dk`;
  if (h) return `${h} sa`;
  return `${r} dk`;
};

const formatDateTr = (iso) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

const truncate = (s, n = 160) => {
  const t = String(s ?? "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1).replace(/\s+\S*$/, "")}…`;
};

/* -------------------------------------------------------------------------- */
/* Şablon işlemleri                                                           */
/* -------------------------------------------------------------------------- */

const replaceOrThrow = (html, re, replacement, what) => {
  if (!re.test(html)) throw new Error(`prerender: şablonda bulunamadı: ${what}`);
  return html.replace(re, replacement);
};

const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`<meta\\s+${attr}="${key.replace(/[:.]/g, "\\$&")}"\\s+content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(value)}"/>`;
  return re.test(html) ? html.replace(re, tag) : html.replace(/<\/head>/i, `${tag}</head>`);
};

/**
 * Şablonun başlık/meta/canonical/JSON-LD ve #root içeriğini değiştirir.
 * @param {string} template build/index.html
 * @param {{path:string,title:string,description:string,keywords?:string,ogType?:string,jsonLd:object[],body:string}} page
 */
export const renderPage = (template, page) => {
  const url = abs(page.path === "/" ? "/" : page.path);
  let html = template;
  html = replaceOrThrow(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(page.title)}</title>`, "<title>");
  html = setMeta(html, "name", "description", page.description);
  if (page.keywords) html = setMeta(html, "name", "keywords", page.keywords);
  html = replaceOrThrow(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(url)}"/>`,
    "canonical"
  );
  html = setMeta(html, "property", "og:type", page.ogType || "website");
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:title", page.title);
  html = setMeta(html, "property", "og:description", page.description);
  html = setMeta(html, "name", "twitter:title", page.title);
  html = setMeta(html, "name", "twitter:description", page.description);

  // Ana sayfanın JSON-LD'si (WebApplication + FAQPage) alt sayfalara ait değil:
  // yapılandırılmış veri sayfadaki içerikle eşleşmeli. Tümünü kaldırıp sayfanınkini ekle.
  html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");
  html = html.replace(/<\/head>/i, `${jsonLdScript(page.jsonLd)}</head>`);

  const start = html.indexOf('<div id="root">');
  const bodyEnd = html.lastIndexOf("</body>");
  if (start < 0 || bodyEnd < 0) throw new Error('prerender: şablonda <div id="root"> bulunamadı');
  const rootClose = html.lastIndexOf("</div>", bodyEnd);
  if (rootClose < start) throw new Error("prerender: #root kapanış etiketi bulunamadı");
  return `${html.slice(0, start)}<div id="root">${page.body}${html.slice(rootClose)}`;
};

/* -------------------------------------------------------------------------- */
/* Ortak sayfa parçaları                                                      */
/* -------------------------------------------------------------------------- */

const header = () =>
  `<header class="seo-header"><a class="seo-brand" href="/">${SITE_NAME}</a>` +
  `<nav aria-label="Ana menü"><a href="/tarifler">Tarifler</a><a href="/rehberler">Rehberler</a>` +
  `<a href="/hakkimizda">Hakkımızda</a><a href="/login">Giriş yap</a></nav></header>`;

const footer = () =>
  `<footer class="seo-footer"><p><a href="/">Ana sayfa</a> · <a href="/tarifler">Tarifler</a> · ` +
  `<a href="/rehberler">Rehberler</a> · <a href="/hakkimizda">Hakkımızda</a> · ` +
  `<a href="/privacy">Gizlilik Politikası</a></p>` +
  `<p>${SITE_NAME} — ücretsiz haftalık yemek planlayıcı ve tarif kitabı. İletişim: ` +
  `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p></footer>`;

const layout = (crumbs, main) =>
  `<div class="seo-static">${header()}${breadcrumbHtml(crumbs)}<main>${main}</main>${footer()}</div>`;

const breadcrumbHtml = (crumbs) => {
  if (!crumbs || crumbs.length < 2) return "";
  const items = crumbs
    .map((c, i) =>
      i === crumbs.length - 1
        ? `<li aria-current="page">${escapeHtml(c.name)}</li>`
        : `<li><a href="${escapeHtml(c.path)}">${escapeHtml(c.name)}</a></li>`
    )
    .join("");
  return `<nav class="seo-breadcrumb" aria-label="Sayfa yolu"><ol>${items}</ol></nav>`;
};

const breadcrumbLd = (crumbs) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: abs(c.path),
  })),
});

const organization = () => ({
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE}/`,
  email: CONTACT_EMAIL,
  logo: { "@type": "ImageObject", url: `${SITE}/icon-512.png` },
});

const HOME = { name: "Ana sayfa", path: "/" };
const RECIPES = { name: "Tarifler", path: "/tarifler" };
const GUIDES = { name: "Rehberler", path: "/rehberler" };

const recipeLink = (r) =>
  `<li><a href="${recipePath(r.slug)}">${escapeHtml(r.name)}</a> — ${escapeHtml(r.description)}</li>`;
const guideLink = (g) =>
  `<li><a href="${guidePath(g.slug)}">${escapeHtml(g.title)}</a> — ${escapeHtml(g.description)}</li>`;

const groupByCategory = (recipes) => {
  const groups = new Map();
  for (const r of recipes) {
    if (!groups.has(r.category)) groups.set(r.category, []);
    groups.get(r.category).push(r);
  }
  const rank = (c) => (CATEGORY_ORDER.includes(c) ? CATEGORY_ORDER.indexOf(c) : CATEGORY_ORDER.length);
  return [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));
};

/* -------------------------------------------------------------------------- */
/* Sayfalar                                                                   */
/* -------------------------------------------------------------------------- */

export const recipePage = (recipe, { recipes, guides }) => {
  const crumbs = [HOME, RECIPES, { name: recipe.name, path: recipePath(recipe.slug) }];
  const total = (Number(recipe.prepTime) || 0) + (Number(recipe.cookTime) || 0);
  const category = CATEGORY_LABELS[recipe.category] || recipe.category;
  const related = recipes
    .filter((r) => r.slug !== recipe.slug && r.category === recipe.category)
    .slice(0, 4);
  const relatedGuides = guides.filter((g) => (g.relatedRecipes || []).includes(recipe.slug)).slice(0, 3);
  const tags = recipe.tags || [];

  const meta = [
    ["Kategori", category],
    ["Öğün", MEAL_LABELS[recipe.mealType]],
    ["Hazırlık", formatMinutes(recipe.prepTime)],
    ["Pişirme", formatMinutes(recipe.cookTime)],
    ["Toplam", formatMinutes(total)],
    ["Porsiyon", recipe.servings ? `${recipe.servings} kişilik` : ""],
    ["Zorluk", DIFFICULTY_LABELS[recipe.difficulty]],
    ["Kalori", recipe.calories ? `yaklaşık ${recipe.calories} kcal / porsiyon` : ""],
  ].filter(([, v]) => v);

  const main =
    `<article><h1>${escapeHtml(recipe.name)}</h1>` +
    `<p class="seo-lead">${escapeHtml(recipe.description)}</p>` +
    `<ul class="seo-meta">${meta.map(([k, v]) => `<li><strong>${k}:</strong> ${escapeHtml(v)}</li>`).join("")}</ul>` +
    (recipe.intro ? `<p>${escapeHtml(recipe.intro)}</p>` : "") +
    `<h2>Malzemeler</h2><ul>${(recipe.ingredients || [])
      .map((i) => `<li>${escapeHtml(ingredientText(i))}</li>`)
      .join("")}</ul>` +
    `<h2>Hazırlanışı</h2><ol>${(recipe.instructions || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>` +
    ((recipe.tips || []).length
      ? `<h2>Püf noktaları</h2><ul>${recipe.tips.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>`
      : "") +
    (tags.length ? `<p class="seo-tags">Etiketler: ${tags.map(escapeHtml).join(", ")}</p>` : "") +
    `<p><a href="/login">Bu tarifi tarif kitabına kaydet ve haftalık planına ekle</a></p></article>` +
    (related.length ? `<h2>Benzer tarifler</h2><ul>${related.map(recipeLink).join("")}</ul>` : "") +
    (relatedGuides.length ? `<h2>İlgili rehberler</h2><ul>${relatedGuides.map(guideLink).join("")}</ul>` : "") +
    `<p><a href="/tarifler">← Tüm tarifler</a></p>`;

  const recipeLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.description,
    url: abs(recipePath(recipe.slug)),
    image: [OG_IMAGE],
    author: organization(),
    publisher: organization(),
    inLanguage: "tr-TR",
    recipeCategory: category,
    recipeCuisine: "Türk",
    keywords: tags.join(", "),
    recipeYield: recipe.servings ? `${recipe.servings} porsiyon` : undefined,
    prepTime: isoDuration(recipe.prepTime),
    cookTime: isoDuration(recipe.cookTime),
    totalTime: isoDuration(total),
    recipeIngredient: (recipe.ingredients || []).map(ingredientText),
    recipeInstructions: (recipe.instructions || []).map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
    nutrition: recipe.calories
      ? { "@type": "NutritionInformation", calories: `${recipe.calories} kcal` }
      : undefined,
  };

  return {
    path: recipePath(recipe.slug),
    title: `${recipe.name} Tarifi — ${SITE_NAME}`,
    description: truncate(recipe.description),
    keywords: [recipe.name, `${recipe.name} tarifi`, ...tags].join(", "),
    ogType: "article",
    jsonLd: [recipeLd, breadcrumbLd(crumbs)],
    body: layout(crumbs, main),
  };
};

const blockHtml = (b) => {
  switch (b.type) {
    case "h2":
      return `<h2>${escapeHtml(b.text)}</h2>`;
    case "h3":
      return `<h3>${escapeHtml(b.text)}</h3>`;
    case "ul":
      return `<ul>${(b.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
    case "ol":
      return `<ol>${(b.items || []).map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
    case "tip":
      return `<aside class="seo-tip"><strong>İpucu:</strong> ${escapeHtml(b.text)}</aside>`;
    case "p":
    default:
      return b.text ? `<p>${escapeHtml(b.text)}</p>` : "";
  }
};

export const guidePage = (guide, { recipes, date }) => {
  const crumbs = [HOME, GUIDES, { name: guide.title, path: guidePath(guide.slug) }];
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const related = (guide.relatedRecipes || []).map((s) => bySlug.get(s)).filter(Boolean);
  const updated = guide.updated || date;

  const main =
    `<article><h1>${escapeHtml(guide.title)}</h1>` +
    `<p class="seo-lead">${escapeHtml(guide.description)}</p>` +
    `<p class="seo-byline">${SITE_NAME} · Güncelleme: <time datetime="${escapeHtml(updated)}">${escapeHtml(
      formatDateTr(updated)
    )}</time>${guide.readingMinutes ? ` · ${escapeHtml(guide.readingMinutes)} dk okuma` : ""}</p>` +
    (guide.blocks || []).map(blockHtml).join("") +
    `</article>` +
    (related.length ? `<h2>Bu rehberdeki tarifler</h2><ul>${related.map(recipeLink).join("")}</ul>` : "") +
    `<p><a href="/rehberler">← Tüm rehberler</a></p>`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    url: abs(guidePath(guide.slug)),
    mainEntityOfPage: abs(guidePath(guide.slug)),
    image: [OG_IMAGE],
    inLanguage: "tr-TR",
    datePublished: updated,
    dateModified: updated,
    author: organization(),
    publisher: organization(),
  };

  return {
    path: guidePath(guide.slug),
    title: `${guide.title} — ${SITE_NAME}`,
    description: truncate(guide.description),
    ogType: "article",
    jsonLd: [articleLd, breadcrumbLd(crumbs)],
    body: layout(crumbs, main),
  };
};

const itemListLd = (items) => ({
  "@type": "ItemList",
  numberOfItems: items.length,
  itemListElement: items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: abs(it.path),
    name: it.name,
  })),
});

export const recipeListPage = ({ recipes }) => {
  const crumbs = [HOME, RECIPES];
  const groups = groupByCategory(recipes);
  const main =
    `<h1>Tarifler</h1>` +
    `<p class="seo-lead">Haftalık menünüzü kolaylaştıracak, adım adım anlatılmış ${recipes.length} ev yemeği tarifi: ` +
    `çorbalardan ana yemeklere, zeytinyağlılardan tatlılara. Her tarifte malzemeler, hazırlanış, süre, ` +
    `porsiyon ve püf noktaları yer alır.</p>` +
    (groups.length > 1
      ? `<nav class="seo-toc" aria-label="Kategoriler"><ul>${groups
          .map(([c, list]) => `<li><a href="#${escapeHtml(c)}">${escapeHtml(CATEGORY_LABELS[c] || c)}</a> (${list.length})</li>`)
          .join("")}</ul></nav>`
      : "") +
    groups
      .map(
        ([c, list]) =>
          `<section id="${escapeHtml(c)}"><h2>${escapeHtml(CATEGORY_LABELS[c] || c)}</h2><ul>${list
            .map(recipeLink)
            .join("")}</ul></section>`
      )
      .join("");
  const title = `Tarifler — Kolay Ev Yemekleri | ${SITE_NAME}`;
  const description = truncate(
    `Malzemeleri, adım adım hazırlanışı ve püf noktalarıyla ${recipes.length} Türk mutfağı tarifi. Çorba, ana yemek, zeytinyağlı, salata ve tatlı tarifleri.`
  );
  return {
    path: "/tarifler",
    title,
    description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Tarifler",
        description,
        url: abs("/tarifler"),
        inLanguage: "tr-TR",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE}/` },
        mainEntity: itemListLd(recipes.map((r) => ({ path: recipePath(r.slug), name: r.name }))),
      },
      breadcrumbLd(crumbs),
    ],
    body: layout(crumbs, main),
  };
};

export const guideListPage = ({ guides }) => {
  const crumbs = [HOME, GUIDES];
  const main =
    `<h1>Rehberler</h1>` +
    `<p class="seo-lead">Haftalık yemek planı hazırlama, alışveriş listesi, bütçe dostu menü ve mutfakta ` +
    `zaman kazandıran pratik bilgiler.</p>` +
    `<ul>${guides.map(guideLink).join("")}</ul>`;
  const description = truncate(
    "Haftalık yemek planlama, alışveriş listesi ve mutfak düzeni üzerine pratik rehberler."
  );
  return {
    path: "/rehberler",
    title: `Rehberler — Yemek Planlama ve Mutfak İpuçları | ${SITE_NAME}`,
    description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Rehberler",
        description,
        url: abs("/rehberler"),
        inLanguage: "tr-TR",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${SITE}/` },
        mainEntity: itemListLd(guides.map((g) => ({ path: guidePath(g.slug), name: g.title }))),
      },
      breadcrumbLd(crumbs),
    ],
    body: layout(crumbs, main),
  };
};

export const aboutPage = ({ recipes, guides }) => {
  const crumbs = [HOME, { name: "Hakkımızda", path: "/hakkimizda" }];
  const description =
    "Tarif Kitabım; Türkçe tarifler, yemek planlama rehberleri ve ücretsiz haftalık yemek planlayıcı sunan bağımsız bir projedir.";
  const main =
    `<h1>Hakkımızda</h1>` +
    `<p class="seo-lead">${escapeHtml(description)}</p>` +
    `<p>${SITE_NAME}, "bu hafta ne pişirsem?" sorusunu kolaylaştırmak için hazırlandı. Sitede ` +
    `${recipes.length} ev yemeği tarifi ve ${guides.length} yemek planlama rehberi herkese açıktır; tarifler ` +
    `evde denenerek, ölçüleri ve süreleri net olacak şekilde yazılır.</p>` +
    `<p>Ücretsiz hesap açan kullanıcılar kendi tariflerini saklayabilir, kahvaltı, öğle ve akşam için haftalık ` +
    `menü hazırlayabilir, alışveriş listesi oluşturabilir ve tarif kitabını her tarif tek sayfa olacak şekilde ` +
    `PDF olarak indirebilir. Site reklamlarla desteklenir.</p>` +
    `<h2>İletişim</h2><p>Öneri, hata bildirimi ve iş birliği için: <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>` +
    `<p>Kişisel verilerin nasıl işlendiği <a href="/privacy">Gizlilik Politikası</a> sayfasında açıklanmıştır.</p>`;
  return {
    path: "/hakkimizda",
    title: `Hakkımızda — ${SITE_NAME}`,
    description,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        name: "Hakkımızda",
        description,
        url: abs("/hakkimizda"),
        inLanguage: "tr-TR",
        about: organization(),
      },
      breadcrumbLd(crumbs),
    ],
    body: layout(crumbs, main),
  };
};

/** Öne çıkan tarifler: her kategoriden bir tane, toplam `n`. */
export const featuredRecipes = (recipes, n = 6) => {
  const picked = [];
  for (const [, list] of groupByCategory(recipes)) {
    if (picked.length >= n) break;
    picked.push(list[0]);
  }
  for (const r of recipes) {
    if (picked.length >= n) break;
    if (!picked.includes(r)) picked.push(r);
  }
  return picked;
};

/**
 * Kök build/index.html'in statik bloğuna tarif/rehber bağlantıları ekler.
 * Mevcut SSS (<details>) işaretlemesi korunur.
 */
export const enhanceHome = (template, { recipes, guides }) => {
  const featured = featuredRecipes(recipes, 6);
  const section =
    `<section class="seo-home-links"><h2>Öne çıkan tarifler</h2><ul>${featured.map(recipeLink).join("")}</ul>` +
    `<p><a href="/tarifler">Tüm tarifler (${recipes.length})</a></p>` +
    (guides.length
      ? `<h2>Yemek planlama rehberleri</h2><ul>${guides.slice(0, 4).map(guideLink).join("")}</ul>` +
        `<p><a href="/rehberler">Tüm rehberler</a> · <a href="/hakkimizda">Hakkımızda</a></p>`
      : "") +
    `</section>`;
  const faq = template.indexOf("<h2>Sık Sorulan Sorular</h2>");
  if (faq >= 0) return template.slice(0, faq) + section + template.slice(faq);
  const mainEnd = template.indexOf("</main>");
  if (mainEnd < 0) throw new Error("prerender: kök sayfada statik blok bulunamadı");
  return template.slice(0, mainEnd) + section + template.slice(mainEnd);
};

/* -------------------------------------------------------------------------- */
/* sitemap.xml ve llms.txt                                                    */
/* -------------------------------------------------------------------------- */

export const buildSitemap = ({ recipes, guides, date }) => {
  const latestGuide = guides.map((g) => g.updated).filter(Boolean).sort().pop() || date;
  const urls = [
    ["/", date, "weekly", "1.0"],
    ["/tarifler", date, "weekly", "0.9"],
    ...recipes.map((r) => [recipePath(r.slug), date, "monthly", "0.8"]),
    ["/rehberler", latestGuide, "weekly", "0.8"],
    ...guides.map((g) => [guidePath(g.slug), g.updated || date, "monthly", "0.7"]),
    ["/hakkimizda", date, "yearly", "0.5"],
    ["/privacy", date, "yearly", "0.3"],
  ];
  const body = urls
    .map(
      ([p, lastmod, freq, prio]) =>
        `  <url><loc>${escapeXml(abs(p === "/" ? "/" : p))}</loc><lastmod>${lastmod}</lastmod>` +
        `<changefreq>${freq}</changefreq><priority>${prio}</priority></url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
};

const LLMS_START = "<!-- içerik:başla (scripts/prerender.mjs üretir; elle düzenlemeyin) -->";
const LLMS_END = "<!-- içerik:bitir -->";

/**
 * llms.txt'ye tarif koleksiyonu ve rehber listesini ekler (SSS bölümüne dokunmaz).
 * İşaretler arasındaki eski bölüm varsa değiştirilir; yoksa "## Bağlantılar"dan önce eklenir.
 */
export const buildLlms = (base, { recipes, guides }) => {
  const lines = [LLMS_START, "", "## Tarif koleksiyonu", ""];
  lines.push(
    `Malzemeleri, adım adım hazırlanışı, süreleri ve püf noktalarıyla ${recipes.length} Türkçe ev yemeği tarifi: ${abs("/tarifler")}`,
    ""
  );
  for (const [c, list] of groupByCategory(recipes)) {
    lines.push(`### ${CATEGORY_LABELS[c] || c}`, "");
    for (const r of list) lines.push(`- [${r.name}](${abs(recipePath(r.slug))}): ${r.description}`);
    lines.push("");
  }
  lines.push("## Rehberler", "", `Yemek planlama ve mutfak rehberleri: ${abs("/rehberler")}`, "");
  for (const g of guides) lines.push(`- [${g.title}](${abs(guidePath(g.slug))}): ${g.description}`);
  lines.push("", LLMS_END, "");
  const section = lines.join("\n");

  const s = base.indexOf(LLMS_START);
  const e = base.indexOf(LLMS_END);
  if (s >= 0 && e > s) {
    let after = base.slice(e + LLMS_END.length);
    after = after.replace(/^\n+/, "");
    return base.slice(0, s) + section + "\n" + after;
  }
  const links = base.indexOf("## Bağlantılar");
  if (links >= 0) return base.slice(0, links) + section + "\n" + base.slice(links);
  return `${base.replace(/\n*$/, "\n\n")}${section}`;
};

/* -------------------------------------------------------------------------- */
/* Üretim                                                                     */
/* -------------------------------------------------------------------------- */

const writeFile = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

const validate = (recipes, guides) => {
  const seen = new Set();
  for (const r of recipes) {
    if (!r.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r.slug)) throw new Error(`prerender: geçersiz tarif slug: ${r.slug}`);
    if (seen.has(`r:${r.slug}`)) throw new Error(`prerender: yinelenen tarif slug: ${r.slug}`);
    seen.add(`r:${r.slug}`);
    if (!r.name) throw new Error(`prerender: adı olmayan tarif: ${r.slug}`);
  }
  for (const g of guides) {
    if (!g.slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(g.slug)) throw new Error(`prerender: geçersiz rehber slug: ${g.slug}`);
    if (seen.has(`g:${g.slug}`)) throw new Error(`prerender: yinelenen rehber slug: ${g.slug}`);
    seen.add(`g:${g.slug}`);
    if (!g.title) throw new Error(`prerender: başlığı olmayan rehber: ${g.slug}`);
  }
};

/**
 * Tüm sayfaları üretir ve buildDir'e yazar.
 * @returns {{ files: string[], sitemap: string, llms: string|null }}
 */
export const generate = ({ buildDir, template, recipes, guides, llmsBase = null, date }) => {
  validate(recipes, guides);
  const ctx = { recipes, guides, date };
  const pages = [
    recipeListPage(ctx),
    ...recipes.map((r) => recipePage(r, ctx)),
    guideListPage(ctx),
    ...guides.map((g) => guidePage(g, ctx)),
    aboutPage(ctx),
  ];
  const files = [];
  for (const page of pages) {
    const file = path.join(buildDir, ...page.path.split("/").filter(Boolean), "index.html");
    writeFile(file, renderPage(template, page));
    files.push(file);
  }
  const home = path.join(buildDir, "index.html");
  writeFile(home, enhanceHome(template, ctx));
  files.push(home);

  const sitemap = buildSitemap(ctx);
  writeFile(path.join(buildDir, "sitemap.xml"), sitemap);
  files.push(path.join(buildDir, "sitemap.xml"));

  let llms = null;
  if (llmsBase != null) {
    llms = buildLlms(llmsBase, ctx);
    writeFile(path.join(buildDir, "llms.txt"), llms);
    files.push(path.join(buildDir, "llms.txt"));
  }
  return { files, sitemap, llms, pages };
};

const main = () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const args = process.argv.slice(2);
  const dirIdx = args.indexOf("--build-dir");
  const buildDir = path.resolve(dirIdx >= 0 ? args[dirIdx + 1] : path.join(root, "build"));
  const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));

  const templateFile = path.join(buildDir, "index.html");
  if (!fs.existsSync(templateFile)) {
    console.error(`prerender: ${templateFile} yok — önce "react-scripts build" çalıştırın.`);
    process.exit(1);
  }
  const template = fs.readFileSync(templateFile, "utf8");
  const recipes = readJson("src/content/recipes.json");
  const guides = readJson("src/content/guides.json");
  const llmsPublic = path.join(root, "public", "llms.txt");
  const llmsBase = fs.existsSync(llmsPublic) ? fs.readFileSync(llmsPublic, "utf8") : null;
  const date = process.env.PRERENDER_DATE || new Date().toISOString().slice(0, 10);

  const { files, sitemap, llms } = generate({ buildDir, template, recipes, guides, llmsBase, date });
  console.log(
    `prerender: ${files.length} dosya yazıldı (${recipes.length} tarif, ${guides.length} rehber) → ${path.relative(root, buildDir) || "."}`
  );

  if (args.includes("--write-public")) {
    fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sitemap);
    if (llms) fs.writeFileSync(llmsPublic, llms);
    console.log("prerender: public/sitemap.xml ve public/llms.txt güncellendi");
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
