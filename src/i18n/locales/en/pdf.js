// PDF export: page UI and generated PDF documents.
const plural = (count, one, many) => (Number(count) === 1 ? one : many);

const pdf = {
  export: {
    title: "Export",
    subtitle:
      "Download your weekly plan and recipe book as beautiful, print-ready PDFs.",
    download: "Download PDF",
    preparing: "Preparing…",
    preview: "Preview",
    error: "Couldn't create the PDF. Please try again.",
    plan: {
      title: "Weekly Plan",
      subtitle:
        "A landscape A4 plan table plus a combined shopping list",
      statMeals: ({ count }) => plural(count, "meal", "meals"),
      statDays: ({ count }) => plural(count, "day", "days"),
      statIngredients: ({ count }) => plural(count, "ingredient", "ingredients"),
      summaryAria: "Weekly plan overview",
      slotTooltip: ({ meal, count }) =>
        `${meal}: ${count} ${plural(count, "meal", "meals")}`,
      empty: "Your plan is empty. Add a few meals to your week first.",
      goToPlan: "Go to plan",
    },
    book: {
      title: "Recipe Book",
      subtitle:
        "Cover, table of contents and one page per recipe — auto-fitted",
      titleLabel: "Book title",
      search: "Search recipes",
      sortLabel: "Sort by",
      sortAz: "A–Z",
      sortType: "Meal type",
      includeDefaults: "Include built-in recipes",
      selected: ({ selected, total }) =>
        `${selected} of ${total} ${plural(total, "recipe", "recipes")} selected`,
      pageEstimate: ({ count }) =>
        ` · about ${count} ${plural(count, "page", "pages")}`,
      selectAll: "Select all",
      selectNone: "Select none",
      empty:
        "Your recipe book is empty. Add your own recipes or include the built-in ones.",
      goToRecipes: "Go to recipes",
      noMatch: "No recipes match “{query}”.",
      longRecipe: "Long recipe · ~{count} pages",
      personal: "My recipe",
      placing: ({ count }) =>
        `Laying out ${count} ${plural(count, "recipe", "recipes")}…`,
    },
  },
  doc: {
    defaultBookTitle: "My Recipe Book",
    untitledRecipe: "Untitled recipe",
    untitledMeal: "Untitled meal",
    recipeBookmark: "Recipe",
    subject: "Recipe book",
    creator: "Weekly Meal Planner",
    minutes: "{count} min",
    servingsValue: "{count}",
    cover: {
      kicker: "A personal recipe collection",
      tagline: "Favorites from my kitchen, shared with the people I love",
      preparedBy: "Compiled by",
      recipeCount: ({ count }) => `${count} ${plural(count, "recipe", "recipes")}`,
    },
    toc: {
      title: "Contents",
      continued: "Contents (continued)",
    },
    recipe: {
      prep: "Prep",
      cook: "Cook",
      servings: "Serves",
      difficulty: "Difficulty",
      ingredients: "Ingredients",
      method: "Method",
      notes: "Notes",
      noIngredients: "No ingredients added.",
      noSteps: "No steps added.",
      mealKicker: {
        breakfast: "Breakfast",
        lunch: "Lunch",
        dinner: "Dinner",
      },
    },
    plan: {
      title: "Weekly Meal Plan",
      kicker: "This week's menu",
      statMeals: ({ count }) => plural(count, "Meal", "Meals"),
      statDays: "Days",
      statIngredients: ({ count }) =>
        plural(count, "Ingredient", "Ingredients"),
      total: "Total",
      shoppingTitle: "Shopping List",
      shoppingKicker: "What you need this week",
      continued: "Continued",
      shoppingEmpty:
        "No recipes found for the planned meals. As you add recipes to your meals, their ingredients are collected here automatically.",
      footer: "Weekly Meal Plan · {date}",
    },
  },
  files: {
    cookbook: "my-recipe-book",
    plan: "weekly-meal-plan",
    preview: "preview",
    recipe: "recipe",
    shareTitle: "Share PDF",
  },
};

export default pdf;
