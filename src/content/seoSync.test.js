// public/index.html ve public/llms.txt içindeki SSS'nin src/content/faq.js ile
// aynı kalmasını denetler (AEO: yapılandırılmış veri sayfadaki içerikle eşleşmeli).
import fs from "fs";
import path from "path";
import FAQ from "./faq";

const pub = (f) => fs.readFileSync(path.join(__dirname, "../../public", f), "utf8");

test("index.html FAQPage JSON-LD faq.js ile aynı", () => {
  const html = pub("index.html");
  const json = html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1];
  const blocks = JSON.parse(json);
  const faqPage = blocks.find((b) => b["@type"] === "FAQPage");
  expect(faqPage.mainEntity.map((q) => [q.name, q.acceptedAnswer.text])).toEqual(
    FAQ.map((f) => [f.q, f.a])
  );
});

test("llms.txt ve statik HTML tüm soruları içeriyor", () => {
  const llms = pub("llms.txt");
  const html = pub("index.html");
  FAQ.forEach(({ q }) => {
    expect(llms).toContain(`### ${q}`);
    expect(html).toContain(`<summary>${q}</summary>`);
  });
});
