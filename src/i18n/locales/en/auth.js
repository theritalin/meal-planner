const auth = {
  login: {
    tagline: "Plan your week, keep your recipes, share them as PDFs",
    features: {
      planner: {
        title: "Planner",
        text: "Plan the week's meals in minutes with drag and drop.",
      },
      recipes: {
        title: "Recipe Book",
        text: "Keep your own recipes and favorites in one place.",
      },
      pdf: {
        title: "PDF",
        text: "Download your plan or recipe book as a PDF and share it.",
      },
    },
    google: "Sign in with Google",
    signingIn: "Signing in…",
    footer:
      "Sign in to keep your plans and recipes available on all your devices.",
    privacy: "Privacy Policy",
    faqTitle: "Frequently Asked Questions",
    errors: {
      popupClosed:
        "The sign-in window was closed. Tap the button to try again.",
      popupBlocked:
        "Your browser blocked the sign-in window. Allow pop-ups and try again.",
      network:
        "Couldn't connect to the internet. Check your connection and try again.",
      unauthorizedDomain:
        "This domain ({host}) isn't authorized in Firebase. Add it under Firebase Console > Authentication > Settings > Authorized domains.",
      invalidApiKey:
        "The Firebase API key is missing or invalid. Check the environment variables (REACT_APP_FIREBASE_*).",
      operationNotAllowed:
        "Google sign-in isn't enabled in Firebase. Enable Google under Firebase Console > Authentication > Sign-in method.",
      generic: "Something went wrong signing in with Google. Please try again.",
    },
  },
  signOut: "Sign out",
  unnamedUser: "Unnamed user",
  user: "User",
  you: " (you)",
  search: {
    placeholder: "Search users…",
    ariaLabel: "Search users",
    searching: "Searching…",
    minChars: ({ count }) => `Type at least ${count} letters`,
    noResults: "No users found",
  },
  profile: {
    loading: "Loading",
    notFound: {
      title: "User not found",
      text: "The profile you're looking for may have been deleted or never existed.",
      home: "Back to home",
    },
    tabsLabel: "Profile tabs",
    tabs: {
      recipes: "Recipes ({count})",
      saved: "Saved ({count})",
    },
    empty: {
      ownRecipes: "You haven't added any recipes of your own yet.",
      goToRecipes: "Go to Recipe Book",
      othersRecipes: "{name} hasn't shared any recipes yet.",
      thisUser: "This user",
      saved: "You haven't saved any recipes yet.",
    },
    unsave: "Remove",
    snackbar: {
      followed: "Following",
      unfollowed: "Unfollowed",
      followError: "Something went wrong while updating follow status",
      profileUpdated: "Profile updated",
      profileUpdateError: "Couldn't update your profile",
      recipeSaved: "Recipe added to your saved recipes",
      recipeSaveError: "Couldn't save the recipe",
      recipeUnsaved: "Recipe removed from your saved recipes",
      recipeUnsaveError: "Couldn't remove the recipe",
    },
    header: {
      edit: "Edit profile",
      follow: "Follow",
      unfollow: "Unfollow",
      noAbout:
        'You haven\'t said anything about yourself yet. Use "Edit profile" to add a short bio.',
      showList: "Show {label} list",
    },
    stats: {
      recipes: "Recipes",
      saved: "Saved",
      followers: "Followers",
      following: "Following",
    },
    followList: {
      followers: "Followers",
      following: "Following",
      empty: "No one here yet.",
    },
    edit: {
      title: "Edit profile",
      name: "Display name",
      nameRequired: "Name can't be empty",
      about: "About me",
      aboutPlaceholder: "What do you love most in the kitchen?",
      cancel: "Cancel",
      save: "Save",
    },
    account: {
      title: "Account",
      privacy: "Privacy Policy",
      language: "Language / Dil",
      deleteTitle: "Delete my account",
      deleteBefore:
        "To permanently delete your account and all your data (recipes, plans, saved recipes), email",
      deleteAfter:
        "from the email address linked to your account. Your request will be processed within 30 days.",
      mailSubject: "Account deletion request",
      mailBody:
        "Hello,\n\nI request the deletion of my Recipe Book account and all of my data.\n\nAccount email: {email}\n",
    },
    preview: {
      prep: "Prep: {count} min",
      cook: "Cook: {count} min",
      ingredients: "Ingredients",
      noIngredients: "No ingredients added.",
      instructions: "Instructions",
      noInstructions: "No steps added.",
      notes: "Notes",
      save: "Save",
      saved: "Saved",
    },
  },
};

export default auth;
