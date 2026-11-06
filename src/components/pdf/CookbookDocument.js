// "Tarif Kitabım" PDF'i: kapak, içindekiler ve her tarif için bir sayfa.
//
// Her tarif, fitRecipe.computeRecipeLayout ile seçilen ölçek/düzende çizilir;
// böylece tarif mümkün olduğunca tek A4 sayfaya sığar. Çok uzun tariflerde
// sayfa taşar (wrap) ve içindekiler tahmini sayfa sayısına göre numaralanır.

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Link,
  StyleSheet,
} from "@react-pdf/renderer";
import {
  FONT_SANS,
  FONT_SERIF,
  PDF_COLORS as C,
  ensurePdfFonts,
  upperFor,
} from "./pdfFonts";
import {
  PAGE,
  CONTENT_WIDTH,
  TOC,
  metricsFor,
  planCookbook,
  computeRecipeLayout,
  recipeLabels,
} from "./fitRecipe";
import { getLang, localeOf, translate } from "../../i18n/core";

const formatLongDate = (date, lang) =>
  (date instanceof Date ? date : new Date(date || Date.now())).toLocaleDateString(
    localeOf(lang),
    { day: "numeric", month: "long", year: "numeric" }
  );

const minutes = (v, lang) => {
  const n = Number(v);
  return n > 0 ? translate(lang, "pdf.doc.minutes", { count: n }) : "—";
};

const stepsOf = (recipe) =>
  (recipe?.instructions || [])
    .map((s) => (typeof s === "string" ? s : s?.text || ""))
    .filter((s) => s.trim());

const splitIngredient = (ing) => {
  if (!ing) return null;
  if (typeof ing === "string") return { qty: "", name: ing };
  const qty = [ing.amount, ing.unit].filter(Boolean).join(" ");
  if (!qty && !ing.name) return null;
  return { qty, name: ing.name || "" };
};

const pad2 = (n) => String(n).padStart(2, "0");

// ---------------------------------------------------------------------------
// Sabit (ölçekten bağımsız) stiller
// ---------------------------------------------------------------------------
const base = StyleSheet.create({
  page: {
    paddingTop: PAGE.marginTop,
    paddingBottom: PAGE.marginBottom,
    paddingHorizontal: PAGE.marginX,
    fontFamily: FONT_SANS,
    color: C.body,
    backgroundColor: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    left: PAGE.marginX,
    right: PAGE.marginX,
    bottom: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    paddingTop: 7,
  },
  footerTitle: {
    fontFamily: FONT_SERIF,
    fontStyle: "italic",
    fontSize: 8.5,
    color: C.muted,
  },
  footerPage: {
    fontSize: 8,
    color: C.muted,
    letterSpacing: 1,
  },

  // ---- Kapak ----
  coverPage: {
    padding: 0,
    fontFamily: FONT_SANS,
    backgroundColor: C.cream,
  },
  coverFrame: {
    position: "absolute",
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderWidth: 0.75,
    borderColor: C.accent,
  },
  coverFrameInner: {
    position: "absolute",
    top: 35,
    left: 35,
    right: 35,
    bottom: 35,
    borderWidth: 0.3,
    borderColor: C.accent,
  },
  coverBody: {
    flexGrow: 1,
    paddingHorizontal: 80,
    paddingTop: 230,
    alignItems: "center",
  },
  coverKicker: {
    fontSize: 8.5,
    fontWeight: 600,
    letterSpacing: 3,
    color: C.accent,
    marginBottom: 26,
  },
  coverTitle: {
    fontFamily: FONT_SERIF,
    fontWeight: 700,
    fontSize: 46,
    lineHeight: 1.12,
    color: C.ink,
    textAlign: "center",
  },
  ornament: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 26,
  },
  ornamentLine: { width: 56, height: 0.75, backgroundColor: C.accent },
  ornamentDiamond: {
    width: 6,
    height: 6,
    marginHorizontal: 10,
    backgroundColor: C.accent,
    transform: "rotate(45deg)",
  },
  coverSubtitle: {
    fontFamily: FONT_SERIF,
    fontStyle: "italic",
    fontSize: 14,
    color: C.body,
    textAlign: "center",
  },
  coverAuthorLabel: {
    marginTop: 34,
    fontSize: 7.5,
    letterSpacing: 2.5,
    color: C.muted,
  },
  coverAuthor: {
    marginTop: 6,
    fontFamily: FONT_SERIF,
    fontSize: 18,
    color: C.ink,
  },
  coverBottom: {
    position: "absolute",
    left: 80,
    right: 80,
    bottom: 78,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    paddingTop: 10,
  },
  coverMeta: { fontSize: 8.5, color: C.muted, letterSpacing: 1 },

  // ---- İçindekiler ----
  tocKicker: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 2.5,
    color: C.accent,
    marginBottom: 8,
  },
  tocTitle: {
    fontFamily: FONT_SERIF,
    fontWeight: 700,
    fontSize: 30,
    color: C.ink,
  },
  tocRuleShort: {
    width: 40,
    height: 1.5,
    backgroundColor: C.accent,
    marginTop: 14,
    marginBottom: 26,
  },
  tocContinued: {
    fontFamily: FONT_SERIF,
    fontStyle: "italic",
    fontSize: 12,
    color: C.muted,
    marginBottom: 18,
  },
  tocRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 23.5,
    textDecoration: "none",
  },
  tocIndex: {
    width: 28,
    fontSize: 8,
    fontWeight: 600,
    color: C.accent,
    letterSpacing: 0.5,
    paddingBottom: 2,
  },
  tocName: {
    fontFamily: FONT_SERIF,
    fontSize: 12,
    color: C.ink,
    maxWidth: CONTENT_WIDTH - 28 - 60,
  },
  tocMealType: {
    fontSize: 7,
    color: C.muted,
    letterSpacing: 1,
    marginLeft: 8,
    paddingBottom: 2.5,
  },
  tocLeader: {
    flexGrow: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: C.rule,
    borderBottomStyle: "dotted",
    marginHorizontal: 8,
    marginBottom: 4,
  },
  tocPage: {
    fontSize: 9.5,
    color: C.body,
    width: 22,
    textAlign: "right",
    paddingBottom: 1.5,
  },
});

// ---------------------------------------------------------------------------
// Ölçeğe bağlı stiller (önbellekli)
// ---------------------------------------------------------------------------
const scaledCache = new Map();

const scaledStyles = (scale) => {
  if (scaledCache.has(scale)) return scaledCache.get(scale);
  const m = metricsFor(scale);
  const s = StyleSheet.create({
    kicker: {
      fontSize: m.kickerSize,
      fontWeight: 600,
      letterSpacing: 2.2 * scale,
      color: C.accent,
      marginBottom: m.kickerGap,
    },
    title: {
      fontFamily: FONT_SERIF,
      fontWeight: 700,
      fontSize: m.titleSize,
      lineHeight: m.titleLineHeight,
      color: C.ink,
      marginBottom: m.titleGap,
    },
    metaRow: {
      flexDirection: "row",
      borderTopWidth: 0.75,
      borderBottomWidth: 0.75,
      borderColor: C.ink,
      paddingVertical: m.metaPadY,
      marginBottom: m.metaGap,
    },
    metaCell: {
      flex: 1,
      paddingHorizontal: 10 * scale,
      borderLeftWidth: 0.5,
      borderLeftColor: C.rule,
    },
    metaCellFirst: { paddingLeft: 0, borderLeftWidth: 0 },
    metaLabel: {
      fontSize: m.metaLabelSize,
      fontWeight: 600,
      letterSpacing: 1.6 * scale,
      color: C.muted,
      marginBottom: 3,
    },
    metaValue: {
      fontFamily: FONT_SERIF,
      fontSize: m.metaValueSize,
      color: C.ink,
    },
    description: {
      fontFamily: FONT_SERIF,
      fontStyle: "italic",
      fontSize: m.descSize,
      lineHeight: m.descLineHeight,
      color: C.body,
      marginBottom: m.descGap,
    },
    columns: { flexDirection: "row", marginTop: m.bodyGap },
    left: {
      width: m.leftWidth,
      backgroundColor: C.cream,
      padding: m.leftPad,
      borderRadius: 3,
    },
    right: { width: m.rightWidth, marginLeft: m.gutter, paddingTop: m.leftPad },
    sectionTitle: {
      fontFamily: FONT_SERIF,
      fontWeight: 700,
      fontSize: m.sectionTitleSize,
      lineHeight: 1.3,
      color: C.ink,
    },
    sectionRule: {
      width: 24 * scale,
      height: 1.25,
      backgroundColor: C.accent,
      marginTop: 3 * scale,
      marginBottom: m.sectionTitleGap - 3 * scale - 1.25,
    },
    ingRow: { flexDirection: "row", marginBottom: m.ingGap },
    ingDot: {
      width: 3.2 * scale,
      height: 3.2 * scale,
      borderRadius: 1.6 * scale,
      backgroundColor: C.accent,
      marginTop: (m.ingSize * m.ingLineHeight) / 2 - 1.6 * scale,
      marginRight: m.ingBullet - 3.2 * scale,
    },
    ingText: {
      flex: 1,
      fontSize: m.ingSize,
      lineHeight: m.ingLineHeight,
      color: C.body,
    },
    ingQty: { fontWeight: 600, color: C.ink },
    stepRow: { flexDirection: "row", marginBottom: m.stepGap },
    stepNum: {
      width: m.stepNumWidth,
      fontFamily: FONT_SERIF,
      fontWeight: 700,
      fontSize: m.stepSize * 1.12,
      lineHeight: (m.stepSize * m.stepLineHeight) / (m.stepSize * 1.12),
      color: C.accent,
    },
    stepText: {
      flex: 1,
      fontSize: m.stepSize,
      lineHeight: m.stepLineHeight,
      color: C.body,
    },
    // tek sütun düzeni
    ingGrid: { flexDirection: "row" },
    ingHalf: { width: (CONTENT_WIDTH - m.gutter) / 2 },
    ingHalfRight: { marginLeft: m.gutter },
    singleSection: { marginTop: m.bodyGap },
    stepsSection: {
      marginTop: m.stepsGap,
      paddingTop: m.stepsGap,
      borderTopWidth: 0.5,
      borderTopColor: C.rule,
    },
    notes: {
      marginTop: m.notesGap,
      padding: m.notesPad,
      borderLeftWidth: 2,
      borderLeftColor: C.accent,
      backgroundColor: C.accentSoft,
    },
    notesTitle: {
      fontFamily: FONT_SERIF,
      fontWeight: 700,
      fontSize: m.sectionTitleSize * 0.85,
      lineHeight: 1.3,
      color: C.ink,
      marginBottom: 6 * scale,
    },
    notesText: {
      fontSize: m.notesSize,
      lineHeight: m.notesLineHeight,
      color: C.body,
    },
  });
  scaledCache.set(scale, s);
  return s;
};

// ---------------------------------------------------------------------------
// Parçalar
// ---------------------------------------------------------------------------
const Footer = ({ bookTitle }) => (
  <View style={base.footer} fixed>
    <Text style={base.footerTitle}>{bookTitle}</Text>
    <Text
      style={base.footerPage}
      render={({ pageNumber }) => String(pageNumber)}
    />
  </View>
);

const MetaRow = ({ recipe, s, lang }) => {
  const tr = (key, params) => translate(lang, key, params);
  const cells = [
    [tr("pdf.doc.recipe.prep"), minutes(recipe.prepTime, lang)],
    [tr("pdf.doc.recipe.cook"), minutes(recipe.cookTime, lang)],
    [
      tr("pdf.doc.recipe.servings"),
      Number(recipe.servings) > 0
        ? tr("pdf.doc.servingsValue", { count: recipe.servings })
        : "—",
    ],
    [
      tr("pdf.doc.recipe.difficulty"),
      ["easy", "medium", "hard"].includes(recipe.difficulty)
        ? tr(`common.difficulty.${recipe.difficulty}`)
        : "—",
    ],
  ];
  return (
    <View style={s.metaRow}>
      {cells.map(([label, value], i) => (
        <View key={label} style={[s.metaCell, i === 0 && s.metaCellFirst]}>
          <Text style={s.metaLabel}>{upperFor(label, lang)}</Text>
          <Text style={s.metaValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
};

const SectionTitle = ({ children, s }) => (
  <View>
    <Text style={s.sectionTitle}>{children}</Text>
    <View style={s.sectionRule} />
  </View>
);

const IngredientList = ({ items, s }) =>
  items.map((ing, i) => (
    <View key={i} style={s.ingRow} wrap={false}>
      <View style={s.ingDot} />
      <Text style={s.ingText}>
        {ing.qty ? <Text style={s.ingQty}>{ing.qty} </Text> : null}
        {ing.name}
      </Text>
    </View>
  ));

const StepList = ({ steps, s }) =>
  steps.map((step, i) => (
    <View key={i} style={s.stepRow} wrap={false}>
      <Text style={s.stepNum}>{i + 1}</Text>
      <Text style={s.stepText}>{step}</Text>
    </View>
  ));

const MEAL_TYPE_KEYS = ["breakfast", "lunch", "dinner"];

const kickerFor = (recipe, lang) =>
  [
    MEAL_TYPE_KEYS.includes(recipe.mealType)
      ? translate(lang, `pdf.doc.recipe.mealKicker.${recipe.mealType}`)
      : null,
    recipe.category,
  ]
    .filter(Boolean)
    .map((text) => upperFor(text, lang))
    .join("  ·  ");

/**
 * Tek bir tarif sayfası. `layout` verilmezse otomatik hesaplanır.
 */
export const RecipePage = ({
  recipe,
  layout,
  bookTitle,
  anchorId,
  lang = getLang(),
}) => {
  const tr = (key, params) => translate(lang, key, params);
  const labels = recipeLabels(lang);
  const fit = layout || computeRecipeLayout(recipe, lang);
  const s = scaledStyles(fit.scale);
  const ingredients = (recipe.ingredients || [])
    .map(splitIngredient)
    .filter(Boolean);
  const steps = stepsOf(recipe);
  const kicker = kickerFor(recipe, lang);
  const single = fit.layout === "single-column";
  const mid = Math.ceil(ingredients.length / 2);

  return (
    <Page
      size="A4"
      style={base.page}
      wrap
      bookmark={recipe.name || tr("pdf.doc.recipeBookmark")}
    >
      <View id={anchorId}>
        {kicker ? <Text style={s.kicker}>{kicker}</Text> : null}
        <Text style={s.title}>{recipe.name || labels.untitled}</Text>
      </View>
      <MetaRow recipe={recipe} s={s} lang={lang} />
      {recipe.description ? (
        <Text style={s.description}>{recipe.description}</Text>
      ) : null}

      {single ? (
        <>
          <View style={s.singleSection}>
            <SectionTitle s={s}>{tr("pdf.doc.recipe.ingredients")}</SectionTitle>
            <View style={s.ingGrid}>
              <View style={s.ingHalf}>
                <IngredientList items={ingredients.slice(0, mid)} s={s} />
              </View>
              <View style={[s.ingHalf, s.ingHalfRight]}>
                <IngredientList items={ingredients.slice(mid)} s={s} />
              </View>
            </View>
          </View>
          <View style={s.stepsSection}>
            <SectionTitle s={s}>{tr("pdf.doc.recipe.method")}</SectionTitle>
            <StepList steps={steps} s={s} />
          </View>
        </>
      ) : (
        <View style={s.columns}>
          <View style={s.left}>
            <SectionTitle s={s}>{tr("pdf.doc.recipe.ingredients")}</SectionTitle>
            {ingredients.length ? (
              <IngredientList items={ingredients} s={s} />
            ) : (
              <Text style={s.ingText}>{labels.noIngredients}</Text>
            )}
          </View>
          <View style={s.right}>
            <SectionTitle s={s}>{tr("pdf.doc.recipe.method")}</SectionTitle>
            {steps.length ? (
              <StepList steps={steps} s={s} />
            ) : (
              <Text style={s.stepText}>{labels.noSteps}</Text>
            )}
          </View>
        </View>
      )}

      {recipe.notes && String(recipe.notes).trim() ? (
        <View style={s.notes} wrap={false}>
          <Text style={s.notesTitle}>{tr("pdf.doc.recipe.notes")}</Text>
          <Text style={s.notesText}>{recipe.notes}</Text>
        </View>
      ) : null}

      <Footer bookTitle={bookTitle} />
    </Page>
  );
};

const CoverPage = ({ title, author, date, count, lang }) => (
  <Page size="A4" style={base.coverPage}>
    <View style={base.coverFrame} fixed />
    <View style={base.coverFrameInner} fixed />
    <View style={base.coverBody}>
      <Text style={base.coverKicker}>
        {upperFor(translate(lang, "pdf.doc.cover.kicker"), lang)}
      </Text>
      <Text style={base.coverTitle}>{title}</Text>
      <View style={base.ornament}>
        <View style={base.ornamentLine} />
        <View style={base.ornamentDiamond} />
        <View style={base.ornamentLine} />
      </View>
      <Text style={base.coverSubtitle}>
        {translate(lang, "pdf.doc.cover.tagline")}
      </Text>
      {author ? (
        <>
          <Text style={base.coverAuthorLabel}>
            {upperFor(translate(lang, "pdf.doc.cover.preparedBy"), lang)}
          </Text>
          <Text style={base.coverAuthor}>{author}</Text>
        </>
      ) : null}
    </View>
    <View style={base.coverBottom}>
      <Text style={base.coverMeta}>
        {upperFor(formatLongDate(date, lang), lang)}
      </Text>
      <Text style={base.coverMeta}>
        {upperFor(translate(lang, "pdf.doc.cover.recipeCount", { count }), lang)}
      </Text>
    </View>
  </Page>
);

const TocPages = ({ entries, tocPages, bookTitle, lang }) => {
  const chunks = [];
  let index = 0;
  for (let p = 0; p < tocPages; p += 1) {
    const size = p === 0 ? TOC.firstPageEntries : TOC.entriesPerPage;
    chunks.push(entries.slice(index, index + size));
    index += size;
  }
  let counter = 0;
  return chunks.map((chunk, p) => (
    <Page key={`toc-${p}`} size="A4" style={base.page}>
      {p === 0 ? (
        <View>
          <Text style={base.tocKicker}>{upperFor(bookTitle, lang)}</Text>
          <Text style={base.tocTitle}>{translate(lang, "pdf.doc.toc.title")}</Text>
          <View style={base.tocRuleShort} />
        </View>
      ) : (
        <Text style={base.tocContinued}>
          {translate(lang, "pdf.doc.toc.continued")}
        </Text>
      )}
      {chunk.map((entry) => {
        counter += 1;
        const type = MEAL_TYPE_KEYS.includes(entry.recipe.mealType)
          ? translate(lang, `common.mealTypes.${entry.recipe.mealType}`)
          : null;
        return (
          <Link
            key={`${entry.anchorId}`}
            src={`#${entry.anchorId}`}
            style={base.tocRow}
          >
            <Text style={base.tocIndex}>{pad2(counter)}</Text>
            <Text style={base.tocName} maxLines={1}>
              {entry.recipe.name || translate(lang, "pdf.doc.untitledRecipe")}
            </Text>
            {type ? (
              <Text style={base.tocMealType}>{upperFor(type, lang)}</Text>
            ) : null}
            <View style={base.tocLeader} />
            <Text style={base.tocPage}>{entry.startPage}</Text>
          </Link>
        );
      })}
      <Footer bookTitle={bookTitle} />
    </Page>
  ));
};

/**
 * Tarif kitabı PDF dokümanı.
 *
 * @param {object} props
 * @param {Array}  props.recipes  Tarif listesi (sıralı). İsteğe bağlı
 *                                `mealType` alanı başlık/İçindekiler'de gösterilir.
 * @param {string} [props.title]  varsayılan: dile göre "Tarif Kitabım" / "My Recipe Book"
 * @param {string} [props.author]
 * @param {Date}   [props.date]
 * @param {boolean} [props.cover=true]  Kapak sayfası
 * @param {boolean} [props.toc=true]    İçindekiler
 * @param {"tr"|"en"} [props.lang]      Belge dili (varsayılan: arayüz dili)
 */
const CookbookDocument = ({
  recipes = [],
  title,
  author,
  date,
  cover = true,
  toc = true,
  lang = getLang(),
}) => {
  ensurePdfFonts();
  const bookTitle = title || translate(lang, "pdf.doc.defaultBookTitle");
  const plan = planCookbook(recipes, { cover, toc, lang });
  const entries = plan.entries.map((e, i) => ({
    ...e,
    anchorId: `tarif-${i + 1}`,
  }));

  return (
    <Document
      title={bookTitle}
      author={author || undefined}
      subject={translate(lang, "pdf.doc.subject")}
      creator={translate(lang, "pdf.doc.creator")}
      producer={translate(lang, "pdf.doc.creator")}
      language={localeOf(lang)}
      pageMode={toc ? "useOutlines" : undefined}
    >
      {cover ? (
        <CoverPage
          title={bookTitle}
          author={author}
          date={date}
          count={recipes.length}
          lang={lang}
        />
      ) : null}
      {toc && plan.tocPages ? (
        <TocPages
          entries={entries}
          tocPages={plan.tocPages}
          bookTitle={bookTitle}
          lang={lang}
        />
      ) : null}
      {entries.map((entry) => (
        <RecipePage
          key={entry.anchorId}
          recipe={entry.recipe}
          layout={entry}
          bookTitle={bookTitle}
          anchorId={entry.anchorId}
          lang={lang}
        />
      ))}
    </Document>
  );
};

export default CookbookDocument;
