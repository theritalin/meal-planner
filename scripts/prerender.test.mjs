// node --test scripts/prerender.test.mjs
// prerender.mjs'i geçici bir build dizininde küçük bir şablonla çalıştırır.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  generate,
  isoDuration,
  escapeHtml,
  buildLlms,
  renderPage,
  recipePage,
} from "./prerender.mjs";

const TEMPLATE = `<!doctype html><html lang="tr"><head><meta charset="utf-8"/>
<title>Ana</title>
<meta
  name="description"
  content="ana açıklama"
/>
<link rel="canonical" href="https://haftalikyemek.space/" />
<meta property="og:type" content="website"/><meta property="og:url" content="https://haftalikyemek.space/"/>
<meta property="og:title" content="x"/><meta property="og:description" content="x"/>
<meta name="twitter:title" content="x"/><meta name="twitter:description" content="x"/>
<script type="application/ld+json">[{"@type":"FAQPage"}]</script>
<script defer="defer" src="/static/js/main.js"></script></head>
<body><div id="root"><main class="seo-static"><h1>Tarif Kitabım</h1><h2>Sık Sorulan Sorular</h2><details><summary>Soru?</summary><p>Cevap</p></details></main></div></body></html>`;

const RECIPES = [
  {
    slug: "mercimek-corbasi",
    name: "Mercimek Çorbası",
    category: "corba",
    mealType: "lunch",
    description: "Klasik <kırmızı> mercimek & limon",
    intro: "Giriş metni.",
    prepTime: 10,
    cookTime: 80,
    servings: 4,
    difficulty: "easy",
    calories: 250,
    ingredients: [{ amount: "1", unit: "su bardağı", name: "kırmızı mercimek" }],
    instructions: ["Yıkayın.", "Pişirin </script>."],
    tips: ["İpucu."],
    tags: ["çorba", "vejetaryen"],
  },
  {
    slug: "ezogelin-corbasi",
    name: "Ezogelin Çorbası",
    category: "corba",
    mealType: "dinner",
    description: "Bulgurlu çorba.",
    prepTime: 10,
    cookTime: 30,
    servings: 4,
    difficulty: "easy",
    calories: 220,
    ingredients: [{ amount: "1", unit: "", name: "bulgur" }],
    instructions: ["Pişirin."],
    tags: [],
  },
];
const GUIDES = [
  {
    slug: "haftalik-plan",
    title: "Haftalık Plan",
    description: "Rehber açıklaması",
    readingMinutes: 5,
    updated: "2026-11-01",
    blocks: [
      { type: "p", text: "Paragraf" },
      { type: "h2", text: "Başlık" },
      { type: "ul", items: ["a", "b"] },
      { type: "ol", items: ["c"] },
      { type: "tip", text: "İpucu" },
    ],
    relatedRecipes: ["mercimek-corbasi", "yok"],
  },
];

const ldBlocks = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
    const v = JSON.parse(m[1]);
    return Array.isArray(v) ? v : [v];
  });

const run = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "prerender-"));
  fs.writeFileSync(path.join(dir, "index.html"), TEMPLATE);
  const res = generate({
    buildDir: dir,
    template: TEMPLATE,
    recipes: RECIPES,
    guides: GUIDES,
    llmsBase: "# Site\n\n## Sık sorulan sorular\n\n### Soru?\n\nCevap\n\n## Bağlantılar\n\n- x\n",
    date: "2026-11-07",
  });
  return { dir, res, read: (p) => fs.readFileSync(path.join(dir, p), "utf8") };
};

test("isoDuration / escapeHtml", () => {
  assert.equal(isoDuration(90), "PT1H30M");
  assert.equal(isoDuration(60), "PT1H");
  assert.equal(isoDuration(15), "PT15M");
  assert.equal(isoDuration(0), "PT0M");
  assert.equal(escapeHtml(`<a href="x">&'`), "&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
});

test("tüm sayfa dosyaları yazılır", () => {
  const { read, dir } = run();
  for (const p of [
    "tarifler/index.html",
    "tarifler/mercimek-corbasi/index.html",
    "tarifler/ezogelin-corbasi/index.html",
    "rehberler/index.html",
    "rehberler/haftalik-plan/index.html",
    "hakkimizda/index.html",
    "sitemap.xml",
    "llms.txt",
  ]) {
    assert.ok(fs.existsSync(path.join(dir, p)), p);
  }
  // betik etiketi korunur
  assert.match(read("tarifler/mercimek-corbasi/index.html"), /static\/js\/main\.js/);
});

test("tarif sayfası: meta, içerik, Recipe + BreadcrumbList JSON-LD", () => {
  const { read } = run();
  const html = read("tarifler/mercimek-corbasi/index.html");
  assert.match(html, /<title>Mercimek Çorbası Tarifi — Tarif Kitabım<\/title>/);
  assert.match(html, /<link rel="canonical" href="https:\/\/haftalikyemek\.space\/tarifler\/mercimek-corbasi"\/>/);
  assert.match(html, /<meta name="description" content="Klasik &lt;kırmızı&gt; mercimek &amp; limon"\/>/);
  assert.match(html, /<meta property="og:type" content="article"\/>/);
  assert.match(html, /<h1>Mercimek Çorbası<\/h1>/);
  assert.match(html, /<li>1 su bardağı kırmızı mercimek<\/li>/);
  assert.match(html, /<li>Pişirin &lt;\/script&gt;\.<\/li>/);
  assert.match(html, /href="\/tarifler\/ezogelin-corbasi"/); // benzer tarif
  assert.match(html, /href="\/rehberler\/haftalik-plan"/); // ilgili rehber
  assert.ok(!html.includes("FAQPage"), "ana sayfa JSON-LD'si kaldırılmalı");
  assert.ok(!html.includes("Sık Sorulan Sorular"), "#root içeriği değişmeli");

  const blocks = ldBlocks(html);
  const recipe = blocks.find((b) => b["@type"] === "Recipe");
  assert.ok(recipe);
  assert.equal(recipe.name, "Mercimek Çorbası");
  assert.equal(recipe.prepTime, "PT10M");
  assert.equal(recipe.cookTime, "PT1H20M");
  assert.equal(recipe.totalTime, "PT1H30M");
  assert.equal(recipe.recipeCuisine, "Türk");
  assert.equal(recipe.recipeCategory, "Çorbalar");
  assert.equal(recipe.recipeYield, "4 porsiyon");
  assert.deepEqual(recipe.recipeIngredient, ["1 su bardağı kırmızı mercimek"]);
  assert.equal(recipe.recipeInstructions[1]["@type"], "HowToStep");
  assert.equal(recipe.recipeInstructions[1].text, "Pişirin </script>.");
  assert.equal(recipe.nutrition.calories, "250 kcal");
  assert.equal(recipe.author.name, "Tarif Kitabım");
  const crumbs = blocks.find((b) => b["@type"] === "BreadcrumbList");
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[2].item, "https://haftalikyemek.space/tarifler/mercimek-corbasi");
  // </script> kaçışı: ham metin JSON-LD içinde script'i kapatmamalı
  assert.equal((html.match(/<\/script>/g) || []).length, 2);
});

test("rehber ve liste sayfaları", () => {
  const { read } = run();
  const guide = read("rehberler/haftalik-plan/index.html");
  const article = ldBlocks(guide).find((b) => b["@type"] === "Article");
  assert.equal(article.headline, "Haftalık Plan");
  assert.equal(article.dateModified, "2026-11-01");
  assert.match(guide, /<aside class="seo-tip">/);
  assert.match(guide, /<ol><li>c<\/li><\/ol>/);
  assert.match(guide, /href="\/tarifler\/mercimek-corbasi"/);

  const list = read("tarifler/index.html");
  const coll = ldBlocks(list).find((b) => b["@type"] === "CollectionPage");
  assert.equal(coll.mainEntity["@type"], "ItemList");
  assert.equal(coll.mainEntity.itemListElement.length, 2);
  assert.match(list, /<h2>Çorbalar<\/h2>/);

  const about = read("hakkimizda/index.html");
  assert.match(about, /bsckbilgi@gmail\.com/);
});

test("kök sayfa: öne çıkan tarifler eklenir, SSS korunur", () => {
  const { read } = run();
  const home = read("index.html");
  assert.match(home, /href="\/tarifler\/mercimek-corbasi"/);
  assert.match(home, /href="\/rehberler"/);
  assert.match(home, /<summary>Soru\?<\/summary>/);
  assert.match(home, /FAQPage/);
  assert.ok(home.indexOf("Öne çıkan tarifler") < home.indexOf("Sık Sorulan Sorular"));
});

test("sitemap ve llms.txt", () => {
  const { read } = run();
  const sm = read("sitemap.xml");
  assert.match(sm, /<loc>https:\/\/haftalikyemek\.space\/tarifler\/mercimek-corbasi<\/loc>/);
  assert.match(sm, /<loc>https:\/\/haftalikyemek\.space\/rehberler\/haftalik-plan<\/loc><lastmod>2026-11-01<\/lastmod>/);
  assert.ok(!sm.includes("/login"));
  const llms = read("llms.txt");
  assert.match(llms, /### Soru\?/);
  assert.match(llms, /\[Mercimek Çorbası\]\(https:\/\/haftalikyemek\.space\/tarifler\/mercimek-corbasi\)/);
  assert.ok(llms.indexOf("## Tarif koleksiyonu") < llms.indexOf("## Bağlantılar"));
  // idempotent: tekrar üretmek bölümü çoğaltmaz
  const again = buildLlms(llms, { recipes: RECIPES, guides: GUIDES });
  assert.equal(again, llms);
});

test("şablonda <title> yoksa hata verir", () => {
  const page = recipePage(RECIPES[0], { recipes: RECIPES, guides: GUIDES });
  assert.throws(() => renderPage("<html><body></body></html>", page), /title/);
});
