// Google Play mağaza görsellerini üretir: telefon ekran görüntüleri, öne çıkan görsel, ikon.
const fs = require("fs");
const path = require("path");

const shots = process.argv[2];
const out = process.argv[3];
const pub = process.argv[4];
const d = (f) => "data:image/png;base64," + fs.readFileSync(path.join(shots, f)).toString("base64");
const svg = fs.readFileSync(path.join(pub, "icon.svg"), "utf8");
const svgUrl = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
const font = (f) => "data:font/ttf;base64," + fs.readFileSync(path.join(pub, "fonts", f)).toString("base64");

const FONTS = `
@font-face{font-family:Inter;src:url(${font("Inter-Regular.ttf")});font-weight:400}
@font-face{font-family:Inter;src:url(${font("Inter-SemiBold.ttf")});font-weight:600}
@font-face{font-family:Inter;src:url(${font("Inter-Bold.ttf")});font-weight:700}
@font-face{font-family:Playfair;src:url(${font("PlayfairDisplay-Bold.ttf")});font-weight:700}
html,body{margin:0;padding:0}
*{box-sizing:border-box}`;

const BG = [
  "linear-gradient(160deg,#FDE9DA 0%,#FBF7F2 55%,#EEF2E3 100%)",
  "linear-gradient(160deg,#FBF7F2 0%,#FDE9DA 60%,#F7D9C4 100%)",
  "linear-gradient(160deg,#EEF2E3 0%,#FBF7F2 55%,#FDE9DA 100%)",
];

const phone = (img, w) => `
  <div style="width:${w}px;border-radius:${w * 0.12}px;background:#1C1917;padding:${w * 0.025}px;
              box-shadow:0 40px 80px rgba(124,45,18,.28),0 8px 20px rgba(0,0,0,.12)">
    <img src="${img}" style="display:block;width:100%;border-radius:${w * 0.1}px">
  </div>`;

const screen = ({ title, sub, img, bg, content }) => `
<html><head><style>${FONTS}</style></head>
<body style="width:1080px;height:1920px;overflow:hidden;background:${bg};font-family:Inter;position:relative">
  <div style="position:absolute;top:110px;left:80px;right:80px;text-align:center">
    <div style="font-family:Playfair;font-weight:700;font-size:78px;line-height:1.1;color:#1C1917">${title}</div>
    <div style="margin-top:26px;font-size:38px;line-height:1.35;color:#57534E">${sub}</div>
  </div>
  <div style="position:absolute;top:480px;left:0;right:0;display:flex;justify-content:center">
    ${content || phone(img, 760)}
  </div>
</body></html>`;

const pdfContent = () => `
  <div style="position:relative;width:900px;height:1400px">
    <img src="${d("pdfpage-1.png")}" style="position:absolute;left:10px;top:90px;width:640px;transform:rotate(-6deg);
         box-shadow:0 30px 60px rgba(0,0,0,.18);border-radius:6px">
    <img src="${d("pdfpage-3.png")}" style="position:absolute;left:250px;top:20px;width:680px;transform:rotate(3deg);
         box-shadow:0 30px 70px rgba(0,0,0,.22);border-radius:6px">
    <div style="position:absolute;left:110px;top:1120px;background:#C2410C;color:#fff;font-weight:700;font-size:34px;
         padding:18px 34px;border-radius:999px;box-shadow:0 12px 30px rgba(194,65,12,.35)">📄 A4 · Türkçe karakter desteği</div>
  </div>`;

const SCREENS = [
  { name: "01-planlayici", title: "Haftalık menünü<br>dakikalar içinde planla", sub: "Kahvaltı, öğle ve akşam — tek ekranda", img: "planner.png" },
  { name: "02-tarif-pdf", title: "Tarif kitabını<br>PDF olarak indir", sub: "Kapak, içindekiler ve her tarif tek sayfa", content: pdfContent() },
  { name: "03-tarif-kitabim", title: "Tüm tariflerin<br>tek bir kitapta", sub: "Ara, filtrele, kaydet", img: "recipes.png" },
  { name: "04-tarif-detay", title: "Pişirirken<br>adım adım takip et", sub: "Malzemeleri işaretle, porsiyonu ayarla", img: "detail.png" },
  { name: "05-ogun-ekle", title: "Tek dokunuşla<br>öğün ekle", sub: "Ya da tüm haftayı rastgele doldur", img: "planner-add.png" },
  { name: "06-alisveris-listesi", title: "Alışveriş listen<br>hazır", sub: "Haftalık plan + birleştirilmiş malzemeler PDF'i", img: "export.png" },
  { name: "07-profil", title: "Tariflerini paylaş,<br>ilham al", sub: "Diğer kullanıcıları takip et", img: "profile.png" },
];

const FEATURE = `
<html><head><style>${FONTS}</style></head>
<body style="width:1024px;height:500px;overflow:hidden;font-family:Inter;position:relative;
  background:linear-gradient(120deg,#FBF7F2 0%,#FDE9DA 55%,#F3C9AC 100%)">
  <div style="position:absolute;left:64px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;width:520px">
    <div style="display:flex;align-items:center;gap:22px">
      <img src="${svgUrl}" style="width:96px;height:96px;filter:drop-shadow(0 10px 20px rgba(194,65,12,.3))">
      <div style="font-family:Playfair;font-weight:700;font-size:54px;color:#1C1917;line-height:1;white-space:nowrap">Tarif Kitabım</div>
    </div>
    <div style="margin-top:28px;font-size:30px;line-height:1.35;color:#44403C;font-weight:600">
      Haftalık menünü planla,<br>tarif kitabını PDF olarak indir.
    </div>
    <div style="margin-top:22px;font-size:20px;color:#C2410C;font-weight:700;letter-spacing:3px">ÜCRETSİZ · TÜRKÇE</div>
  </div>
  <div style="position:absolute;right:-30px;top:40px;transform:rotate(-8deg)">${phone(d("planner.png"), 230)}</div>
  <img src="${d("pdfpage-3.png")}" style="position:absolute;right:200px;top:90px;width:220px;transform:rotate(6deg);
       box-shadow:0 20px 40px rgba(0,0,0,.2);border-radius:4px">
</body></html>`;

const ICON = `
<html><head><style>html,body{margin:0}</style></head>
<body style="width:512px;height:512px;background:#C2410C">
  <img src="${svgUrl}" style="width:512px;height:512px;display:block">
</body></html>`;

(async () => {
  const { chromium } = require("playwright");
  const b = await chromium.launch();
  const render = async (html, w, h, file, type = "png") => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.setContent(html, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(out, file), type, ...(type === "jpeg" ? { quality: 92 } : {}) });
    await p.close();
  };
  for (const [i, s] of SCREENS.entries()) {
    await render(
      screen({ ...s, img: s.img && d(s.img), bg: BG[i % BG.length] }),
      1080, 1920, `telefon-${s.name}.png`
    );
  }
  await render(FEATURE, 1024, 500, "one-cikan-gorsel-1024x500.png");
  await render(ICON, 512, 512, "uygulama-ikonu-512.png");
  await b.close();
})();
