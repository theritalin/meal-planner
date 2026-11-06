// Haftalık plan PDF'i: yatay A4 plan tablosu + toplu alışveriş listesi.
// Saf bileşen: tüm veriler props ile gelir (context kullanmaz).

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import {
  FONT_SANS,
  FONT_SERIF,
  PDF_COLORS as C,
  ensurePdfFonts,
  upperFor,
} from "./pdfFonts";
import { buildShoppingList, summarizePlan } from "./shoppingList";
import { DAYS, MEAL_TYPES } from "../../constants";
import { getLang, localeOf, translate } from "../../i18n/core";

const MARGIN = 36;
const ROWS_PER_COLUMN = 15;
const COLUMNS = 3;

const MEAL_COLORS = {
  breakfast: C.breakfast,
  lunch: C.lunch,
  dinner: C.dinner,
};

const s = StyleSheet.create({
  page: {
    padding: MARGIN,
    paddingBottom: MARGIN + 18,
    fontFamily: FONT_SANS,
    color: C.body,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  kicker: {
    fontSize: 7,
    fontWeight: 600,
    letterSpacing: 2.2,
    color: C.accent,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONT_SERIF,
    fontWeight: 700,
    fontSize: 24,
    color: C.ink,
  },
  stats: { flexDirection: "row" },
  stat: { marginLeft: 22, alignItems: "flex-end" },
  statValue: { fontFamily: FONT_SERIF, fontSize: 15, color: C.ink },
  statLabel: {
    fontSize: 6.5,
    letterSpacing: 1.4,
    color: C.muted,
    marginTop: 1,
  },

  table: {
    borderTopWidth: 0.75,
    borderTopColor: C.ink,
    borderBottomWidth: 0.75,
    borderBottomColor: C.ink,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
  },
  rowLast: { borderBottomWidth: 0 },
  headCell: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderLeftWidth: 0.5,
    borderLeftColor: C.rule,
  },
  headText: {
    fontSize: 7.5,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: C.ink,
  },
  labelCell: {
    width: 74,
    paddingVertical: 8,
    paddingRight: 6,
  },
  labelRow: { flexDirection: "row", alignItems: "center" },
  labelDot: { width: 5, height: 5, borderRadius: 2.5, marginRight: 5 },
  labelText: {
    fontFamily: FONT_SERIF,
    fontWeight: 700,
    fontSize: 10.5,
    color: C.ink,
  },
  cell: {
    flex: 1,
    minHeight: 92,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderLeftWidth: 0.5,
    borderLeftColor: C.rule,
  },
  meal: { marginBottom: 6 },
  mealName: { fontSize: 8.5, lineHeight: 1.3, color: C.ink, fontWeight: 500 },
  mealMeta: { fontSize: 6.5, color: C.muted, marginTop: 1 },
  empty: { fontSize: 8, color: C.rule },
  totalsCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderLeftWidth: 0.5,
    borderLeftColor: C.rule,
  },
  totalsText: { fontSize: 7.5, color: C.muted },
  totalsLabel: {
    width: 74,
    paddingVertical: 6,
    fontSize: 6.5,
    letterSpacing: 1.2,
    color: C.muted,
  },

  footer: {
    position: "absolute",
    left: MARGIN,
    right: MARGIN,
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: C.rule,
    paddingTop: 6,
  },
  footerText: { fontSize: 7.5, color: C.muted },

  // alışveriş listesi
  columns: { flexDirection: "row" },
  column: { flex: 1, paddingRight: 18 },
  columnLast: { paddingRight: 0 },
  item: {
    flexDirection: "row",
    height: 27,
    borderBottomWidth: 0.5,
    borderBottomColor: C.rule,
    paddingTop: 5,
  },
  check: {
    width: 8,
    height: 8,
    borderWidth: 0.75,
    borderColor: C.muted,
    borderRadius: 1.5,
    marginTop: 1.5,
    marginRight: 8,
  },
  itemBody: { flex: 1 },
  itemTop: { flexDirection: "row", justifyContent: "space-between" },
  itemName: { flex: 1, fontSize: 9, fontWeight: 500, color: C.ink },
  itemQty: {
    maxWidth: 110,
    fontSize: 8.5,
    fontWeight: 600,
    color: C.accent,
    marginLeft: 6,
    textAlign: "right",
  },
  itemMeals: { fontSize: 6.5, color: C.muted, marginTop: 1.5 },
  note: {
    fontFamily: FONT_SERIF,
    fontStyle: "italic",
    fontSize: 11,
    color: C.muted,
    marginTop: 8,
  },
});

const Footer = ({ date, lang }) => (
  <View style={s.footer} fixed>
    <Text style={s.footerText}>
      {translate(lang, "pdf.doc.plan.footer", { date })}
    </Text>
    <Text
      style={s.footerText}
      render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
    />
  </View>
);

const Header = ({ kicker, title, children }) => (
  <View style={s.header}>
    <View>
      <Text style={s.kicker}>{kicker}</Text>
      <Text style={s.title}>{title}</Text>
    </View>
    {children}
  </View>
);

/** "Menemen, Çorba +3" biçiminde, tek satıra sığacak kısa yemek listesi. */
const mealsLine = (meals, maxChars = 58) => {
  const shown = [];
  let length = 0;
  for (const name of meals) {
    if (shown.length && length + name.length + 2 > maxChars) break;
    shown.push(name);
    length += name.length + 2;
  }
  const rest = meals.length - shown.length;
  const text = shown.join(", ");
  return rest > 0 ? `${text} +${rest}` : text;
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/**
 * @param {object} props
 * @param {object} props.weekPlan
 * @param {(mealId: string) => Array} [props.getRecipesForMeal]
 * @param {Array} [props.shoppingList] önceden hesaplanmış liste (verilmezse
 *        weekPlan + getRecipesForMeal ile hesaplanır)
 * @param {Date} [props.date]
 * @param {string} [props.author]
 * @param {"tr"|"en"} [props.lang] Belge dili (varsayılan: arayüz dili)
 */
const PlanDocument = ({
  weekPlan,
  getRecipesForMeal,
  shoppingList,
  date,
  author,
  lang = getLang(),
}) => {
  ensurePdfFonts();
  const tr = (key, params) => translate(lang, key, params);
  const up = (text) => upperFor(text, lang);
  const kcal = (count) => tr("common.kcal", { count });
  const dateText = (date || new Date()).toLocaleDateString(localeOf(lang), {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const list =
    shoppingList || buildShoppingList(weekPlan, getRecipesForMeal, lang);
  const summary = summarizePlan(weekPlan);
  const perPage = ROWS_PER_COLUMN * COLUMNS;
  const listPages = list.length ? chunk(list, perPage) : [[]];

  const dayCalories = DAYS.map((day) =>
    MEAL_TYPES.reduce(
      (sum, type) =>
        sum +
        (weekPlan?.[day]?.[type] || []).reduce(
          (acc, meal) => acc + (Number(meal?.calories) || 0),
          0
        ),
      0
    )
  );
  const hasCalories = dayCalories.some(Boolean);

  return (
    <Document
      title={tr("pdf.doc.plan.title")}
      author={author || undefined}
      creator={tr("pdf.doc.creator")}
      producer={tr("pdf.doc.creator")}
      language={localeOf(lang)}
    >
      <Page size="A4" orientation="landscape" style={s.page}>
        <Header
          kicker={up(tr("pdf.doc.plan.kicker"))}
          title={tr("pdf.doc.plan.title")}
        >
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.statValue}>{summary.mealCount}</Text>
              <Text style={s.statLabel}>
                {up(tr("pdf.doc.plan.statMeals", { count: summary.mealCount }))}
              </Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statValue}>{summary.activeDays}/7</Text>
              <Text style={s.statLabel}>{up(tr("pdf.doc.plan.statDays"))}</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statValue}>{list.length}</Text>
              <Text style={s.statLabel}>
                {up(tr("pdf.doc.plan.statIngredients", { count: list.length }))}
              </Text>
            </View>
          </View>
        </Header>

        <View style={s.table}>
          <View style={s.row}>
            <View style={s.labelCell} />
            {DAYS.map((day) => (
              <View key={day} style={s.headCell}>
                <Text style={s.headText}>{up(tr(`common.days.${day}`))}</Text>
              </View>
            ))}
          </View>
          {MEAL_TYPES.map((type, rowIndex) => (
            <View
              key={type}
              style={[
                s.row,
                !hasCalories && rowIndex === MEAL_TYPES.length - 1 && s.rowLast,
              ]}
              wrap={false}
            >
              <View style={s.labelCell}>
                <View style={s.labelRow}>
                  <View
                    style={[s.labelDot, { backgroundColor: MEAL_COLORS[type] }]}
                  />
                  <Text style={s.labelText}>{tr(`common.mealTypes.${type}`)}</Text>
                </View>
              </View>
              {DAYS.map((day) => {
                const meals = weekPlan?.[day]?.[type] || [];
                return (
                  <View key={day} style={s.cell}>
                    {meals.length ? (
                      meals.map((meal, i) => (
                        <View key={`${meal?.id || i}`} style={s.meal}>
                          <Text style={s.mealName}>
                            {meal?.name || tr("pdf.doc.untitledMeal")}
                          </Text>
                          {meal?.calories || meal?.prepTime ? (
                            <Text style={s.mealMeta}>
                              {[
                                meal.calories ? kcal(meal.calories) : null,
                                meal.prepTime
                                  ? tr("pdf.doc.minutes", {
                                      count: meal.prepTime,
                                    })
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </Text>
                          ) : null}
                        </View>
                      ))
                    ) : (
                      <Text style={s.empty}>—</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
          {hasCalories ? (
            <View style={[s.row, s.rowLast]}>
              <Text style={s.totalsLabel}>{up(tr("pdf.doc.plan.total"))}</Text>
              {DAYS.map((day, i) => (
                <View key={day} style={s.totalsCell}>
                  <Text style={s.totalsText}>
                    {dayCalories[i] ? kcal(dayCalories[i]) : "—"}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>
        <Footer date={dateText} lang={lang} />
      </Page>

      {listPages.map((pageItems, p) => {
        const cols = chunk(pageItems, ROWS_PER_COLUMN);
        return (
          <Page
            key={`list-${p}`}
            size="A4"
            orientation="landscape"
            style={s.page}
          >
            <Header
              kicker={up(
                tr(
                  p === 0
                    ? "pdf.doc.plan.shoppingKicker"
                    : "pdf.doc.plan.continued"
                )
              )}
              title={tr("pdf.doc.plan.shoppingTitle")}
            />
            {pageItems.length ? (
              <View style={s.columns}>
                {Array.from({ length: COLUMNS }).map((_, c) => (
                  <View
                    key={c}
                    style={[s.column, c === COLUMNS - 1 && s.columnLast]}
                  >
                    {(cols[c] || []).map((item) => (
                      <View key={item.key} style={s.item}>
                        <View style={s.check} />
                        <View style={s.itemBody}>
                          <View style={s.itemTop}>
                            <Text style={s.itemName} maxLines={1}>
                              {item.name}
                            </Text>
                            {item.quantities.length ? (
                              <Text style={s.itemQty} maxLines={1}>
                                {item.quantities.join(" + ")}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={s.itemMeals}>
                            {mealsLine(item.meals)}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : (
              <Text style={s.note}>
                {tr("pdf.doc.plan.shoppingEmpty")}
              </Text>
            )}
            <Footer date={dateText} lang={lang} />
          </Page>
        );
      })}
    </Document>
  );
};

export default PlanDocument;
