// scripts/prerender.mjs (derleme sonrası statik HTML üretici) testlerini
// `npm test` içinde çalıştırır. Testlerin kendisi: scripts/prerender.test.mjs
import { spawnSync } from "child_process";
import path from "path";

test("scripts/prerender.test.mjs geçer", () => {
  const file = path.join(__dirname, "../../scripts/prerender.test.mjs");
  const res = spawnSync(process.execPath, ["--test", file], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(`${res.stdout}\n${res.stderr}`);
}, 30000);
