// Public pages (home, recipes, guides, about).
const publicNs = {
  nav: {
    home: "Home",
    recipes: "Recipes",
    guides: "Guides",
    about: "About",
    login: "Sign in",
    start: "Start for free",
    privacy: "Privacy Policy",
    menu: "Open menu",
    closeMenu: "Close menu",
    publicRecipes: "Recipe collection",
  },
  footer: {
    tagline: "Weekly meal planner, personal recipe book and tested home recipes.",
    explore: "Explore",
    info: "Info",
    contact: "Contact",
    rights: "All rights reserved.",
  },
  categories: {
    corba: "Soups",
    anaYemek: "Main dishes",
    zeytinyagli: "Olive oil dishes",
    sebze: "Vegetable dishes",
    kahvalti: "Breakfast",
    salata: "Salads",
    hamurIsi: "Pastries & breads",
    pilavMakarna: "Rice & pasta",
    tatli: "Desserts",
    other: "Other",
  },
  home: {
    metaTitle: "Weekly meal plans and home recipes",
    metaDescription:
      "Plan your weekly meals, keep your recipes in one place and discover tested Turkish home recipes. Free and mobile friendly.",
    eyebrow: "Free weekly meal planner",
    title: "A weekly answer to “What should I cook today?”",
    subtitle:
      "With Tarif Kitabım you can plan the week's menu in minutes, keep all your own recipes in one place and turn them into a printable PDF recipe book.",
    cta: "Start for free",
    browse: "Browse recipes",
    featuresTitle: "Order in the kitchen, variety at the table",
    features: {
      planner: {
        title: "Weekly planner",
        text: "Drag and drop meals into breakfast, lunch and dinner slots, or fill the whole week automatically with one tap.",
      },
      recipes: {
        title: "Personal recipe book",
        text: "Save your own recipes with ingredients, steps and notes, and add the ready-made recipes you like to your book.",
      },
      pdf: {
        title: "PDF recipe book",
        text: "Turn selected recipes into a PDF with a cover and table of contents, and get a shopping list from your weekly plan.",
      },
    },
    featuredTitle: "Featured recipes",
    featuredSubtitle: "Home-cooked dishes tested in our kitchen, explained step by step.",
    allRecipes: "All recipes",
    guidesTitle: "Guides",
    guidesSubtitle: "Practical articles on meal planning, shopping and storage.",
    allGuides: "All guides",
    faqTitle: "Frequently asked questions",
    faqMore: "See more on the sign-in page",
    ctaTitle: "Ready to plan your week?",
    ctaText:
      "Sign in with your Google account in seconds; your plans and recipes follow you on every device.",
  },
  recipeList: {
    metaTitle: "Recipes",
    metaDescription:
      "Tested home recipes from soups to desserts: ingredients, step-by-step instructions, cooking times and tips.",
    title: "Home recipes",
    intro:
      "Recipes tested in our kitchen to inspire your weekly menu. Each recipe comes with an ingredient list, step-by-step instructions, prep and cooking times and tips. Save any recipe you like to your own recipe book with a single tap.",
    searchLabel: "Search recipes",
    searchPlaceholder: "Recipe name, ingredient…",
    filterLabel: "Category",
    all: "All",
    count: ({ count }) => `${count} ${count === 1 ? "recipe" : "recipes"}`,
    empty: "No recipes match your search.",
    clear: "Clear filters",
  },
  recipe: {
    breadcrumb: "Breadcrumb",
    prep: "Prep",
    cook: "Cook",
    total: "Total",
    servings: "Servings",
    difficulty: "Difficulty",
    calories: "Calories (per serving)",
    ingredients: "Ingredients",
    instructions: "Instructions",
    tips: "Tips",
    related: "Similar recipes",
    save: "Save to my recipe book",
    saving: "Saving…",
    saved: "Saved to your recipe book.",
    alreadySaved: "In your recipe book",
    saveError: "Could not save the recipe. Please try again.",
    loginHint: "Sign in for free to save it.",
    openBook: "Open my recipe book",
    notFoundTitle: "Recipe not found",
    notFoundText:
      "The recipe you are looking for may have been removed or moved. Have a look at our other recipes.",
    backToList: "Back to all recipes",
    openAria: ({ name }) => `Open the ${name} recipe`,
  },
  guideList: {
    metaTitle: "Guides",
    metaDescription:
      "Guides on weekly meal planning, smart grocery shopping, food storage and a tidy kitchen.",
    title: "Kitchen guides",
    intro:
      "Practical guides that make everyday life easier, from preparing a weekly menu and a shopping list to using up leftovers and organising your kitchen.",
    read: "Read the guide",
    empty: "No guides yet.",
  },
  guide: {
    readingTime: ({ count }) => `${count} min read`,
    updated: ({ date }) => `Updated: ${date}`,
    tip: "Tip",
    relatedRecipes: "Recipes related to this guide",
    otherGuides: "Other guides",
    notFoundTitle: "Guide not found",
    notFoundText: "The guide you are looking for may have been removed or moved.",
    backToList: "Back to all guides",
  },
  about: {
    metaTitle: "About us",
    metaDescription:
      "Learn who makes Tarif Kitabım and why, our content policy and how to contact us.",
    title: "About us",
    lead: "Tarif Kitabım is a project by a small team that loves home cooking and wants to make weekly meal planning easier.",
    whoTitle: "Who are we?",
    whoText:
      "Tired of asking “what should we cook tonight?” every evening and losing recipes in notebook margins and phone notes, we first built this app for ourselves. Today we offer it for free to anyone who wants to keep their weekly plans and recipes in one place.",
    appTitle: "What does the app do?",
    appItems: [
      "Builds a weekly meal plan with breakfast, lunch and dinner, and can fill the week automatically.",
      "Stores your own recipes with ingredients, steps and notes, and lets you add ready-made recipes to your book.",
      "Creates a printable PDF recipe book from selected recipes and a shopping list from your weekly plan.",
      "Works on phones, tablets and computers; your data syncs across devices with your Google account.",
    ],
    policyTitle: "Our content policy",
    policyText:
      "The recipes and guides published on this site are original and are not copied from other sites. Recipes are tested in a home kitchen, and their quantities and times are based on real cooking. Calorie values are approximate per serving and are not medical or dietary advice. If you spot a mistake, just write to us; we review and update our content regularly.",
    adsTitle: "Ads and privacy",
    adsText:
      "Tarif Kitabım is free and supported by ads. You can find out how we process your data on the Privacy Policy page.",
    contactTitle: "Contact",
    contactText: "For suggestions, bug reports or collaboration, email us at:",
    linksTitle: "Explore",
  },
};

export default publicNs;
