const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.argv[2];
const out = process.argv[3];
const types = {
  ".js": "text/javascript", ".css": "text/css", ".ttf": "font/ttf",
  ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json",
};
const srv = http
  .createServer((q, r) => {
    let p = path.join(root, decodeURIComponent(q.url.split("?")[0]));
    if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(root, "index.html");
    r.setHeader("Content-Type", types[path.extname(p)] || "text/html");
    r.end(fs.readFileSync(p));
  })
  .listen(5071);

const FONTCSS = `
@font-face{font-family:Inter;src:url(/fonts/Inter-Regular.ttf);font-weight:400}
@font-face{font-family:Inter;src:url(/fonts/Inter-Medium.ttf);font-weight:500}
@font-face{font-family:Inter;src:url(/fonts/Inter-SemiBold.ttf);font-weight:600}
@font-face{font-family:Inter;src:url(/fonts/Inter-Bold.ttf);font-weight:700}
@font-face{font-family:"Playfair Display";src:url(/fonts/PlayfairDisplay-Bold.ttf);font-weight:600 900}
@font-face{font-family:"Playfair Display";src:url(/fonts/PlayfairDisplay-Regular.ttf);font-weight:400}
::-webkit-scrollbar{display:none}`;

(async () => {
  const { chromium } = require("playwright");
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
  });
  await ctx.route(/fonts\.googleapis|fonts\.gstatic|googlesyndication|_vercel/, (r) => r.abort());
  const pg = await ctx.newPage();
  const errs = [];
  pg.on("pageerror", (e) => errs.push(e.message));
  const shot = async (url, name, prep) => {
    await pg.goto("http://localhost:5071" + url);
    await pg.addStyleTag({ content: FONTCSS });
    await pg.waitForTimeout(2500);
    if (prep) await prep();
    await pg.waitForTimeout(700);
    await pg.screenshot({ path: path.join(out, name + ".png") });
  };
  const only = process.argv[4] ? process.argv[4].split(",") : null;
  const want = (n) => !only || only.includes(n);

  if (want("planner")) await shot("/", "planner");
  if (want("recipes")) await shot("/recipes", "recipes");
  if (want("detail"))
    await shot("/recipes/r-mercimek", "detail", async () => {
      const cb = await pg.$$("input[type=checkbox]");
      for (const c of cb.slice(0, 3)) {
        try { await c.click(); } catch (e) {}
      }
      await pg.evaluate(() => window.scrollTo(0, 0));
    });
  if (want("export"))
    await shot("/export", "export", async () => {
      await pg.evaluate(() => {
        const h = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].find((e) =>
          /Tarif Kitab/.test(e.textContent)
        );
        if (h) { h.scrollIntoView({ block: "start" }); window.scrollBy(0, -80); }
      });
    });
  if (want("profile")) await shot("/profile/demo-user", "profile");
  if (want("planner-add"))
    await shot("/", "planner-add", async () => {
      for (const x of await pg.$$("button")) {
        const t = (await x.innerText()).trim();
        if (/^Ekle$/.test(t)) { await x.click(); break; }
      }
      await pg.waitForTimeout(800);
    });
  console.log("errors", errs);
  await b.close();
  srv.close();
})();
