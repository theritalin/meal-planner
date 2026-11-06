// Ad alanları: her biri ayrı dosyada (ilgili bölüm kendi dosyasını düzenler).
import common from "./common";
import shell from "./shell";
import planner from "./planner";
import recipes from "./recipes";
import pdf from "./pdf";
import auth from "./auth";
import legal from "./legal";
import ads from "./ads";

const dict = { common, shell, planner, recipes, pdf, auth, legal, ads };
export default dict;
