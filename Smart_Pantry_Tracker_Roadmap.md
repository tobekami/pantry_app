# 🚀 The Smart Pantry Tracker: Rebuild Roadmap \& Architecture

This document serves as the comprehensive, robust roadmap for the **Smart Pantry Tracker** rebuild. It merges the existing codebase with the new high-fidelity aesthetic goals and Gemini-powered AI features.

\---

## 🏗️ Technical Stack

* **Frontend:** Next.js (App Router), React
* **Styling:** Material UI (MUI), Tailwind CSS (Translated to MUI sx)
* **Typography:** Google Sans (Variable Font)
* **Backend/Database:** Firebase (Auth, Firestore)
* **AI Provider:** Google Gemini API (Replacing TensorFlow.js)

\---

## ✅ Phase 1: The Foundation (Consistency \& Style)

**Goal:** Stabilize the UI so every new page looks professional automatically.
**Status:** `COMPLETED`

* **Establish the "Sage Green" Theme:**

  * Updated `app/provider.tsx` to enforce the global palette.
  * Primary: Sage Green (`#6A9C78`), Background: Off-White (`#F5FAFF`), Surface: Pure White.
* **Typography Integration:**

  * Configured local variable fonts for `Google Sans`.
* **Fix Layout \& Spacing:**

  * Replaced hardcoded inline styles with structured `Container` wrappers and consistent MUI `sx` layouts.

\---

## ✅ Phase 2: The Visual Redesign

**Goal:** Implement the new high-fidelity aesthetic using the established UI design prompts.
**Status:** `COMPLETED`

* **Landing Page (`app/page.tsx`):**

  * Modern SaaS layout: Navbar → Split Hero Section → Feature Cards.
  * Implemented "Wavy" organic backgrounds and 3D food illustrations.
* **Authentication (`app/login/page.tsx`):**

  * Centered glass-morphism card on a blurred "Vegetable Watercolor" background.
  * Clean "Sign in with Google" pill button.
* **Pantry Dashboard (`app/pantry/page.tsx`):**

  * Overhauled the list into a rich, editorial table view.
  * **Features:** \* Dynamic ingredient images (via Spoonacular CDN fallback to initial-letter avatars).

    * Visual shelf-life progress bars.
    * Pill-shaped quantity adjusters.
    * Frosted-glass sticky header with profile drop-down.

\---

## ✅ Phase 3: Core AI Features (Input \& Profile)

**Goal:** Capture user data and intelligently intake food.
**Status:** `COMPLETED`

* **Kitchen Dashboard / Dietary Profile (`app/dashboard/page.tsx`):** `\[COMPLETED]`

  * Multi-input wizard for user preferences.
  * Captures: Primary Goals (e.g., Weight Loss), Standard Diets (e.g., Vegan, Keto), and Custom Restrictions (e.g., "Cilantro", "Peanut Allergy").
  * Data synced securely to Firestore `users/{uid}` collection.
* **AI Receipt Scanner / The "Entry Agent" (`app/pantry/detect/page.tsx`):** `\[COMPLETED]`

  * **Upgrade:** Replaced the legacy TensorFlow.js client-side camera with server-side Gemini Flash integration.
  * **Flow:** Snap Photo → Gemini Extracts JSON → "Confirm Items" Form → Save to Firestore.
  * **Target Prompt:** *"Extract food items, quantity, and approximate expiry date. Ignore non-food items and taxes."*

\---

## ⏳ Phase 4: Advanced Recipe Intelligence (The "Nutritionist")

**Goal:** Redesign the recipe page and modals and Implement AI-driven analysis and warnings based on the user's Kitchen Dashboard profile.
**Status:** `PENDING`

* **The "Dietary Guard" (Pantry Level):**

  * **Logic:** When viewing or adding an item, cross-reference against `user.preferences`.
  * **Example:** User is "Vegan." Item is "Honey." → AI flags as `violation: true`.
  * **UI:** Display a red ⚠️ Dietary Flag icon next to violating items in the pantry list.
* **Recipe Analysis \& Warning System (Recipe Level):**

  * **Logic:** When "View Recipe" is clicked, pass `\[Recipe Ingredients] + \[User Preferences]` to Gemini.
  * **Output:** Status (🟢 Good / 🟡 Caution / 🔴 Avoid) with a reason (e.g., "This recipe uses heavy cream, which conflicts with your 'Dairy-Free' goal.").
  * **UI:** Render a "Smart Health Card" inside the recipe modal.
* **AI Recipe Modification (The "Fixer"):**

  * **Feature:** If a recipe status is 🟡 or 🔴, provide a "Make it Fit" button.
  * **AI Action:** Rewrite the ingredient list to swap conflicting items (e.g., Heavy Cream → Coconut Milk).
  * **UI:** Display the newly modified, diet-compliant recipe.

\---

## 📋 Next Execution Steps

1. **Bridge Phase 3 \& 4:** Implement the Dietary Guard logic inside `app/pantry/page.tsx` to read the user's dashboard preferences and flag items.
2. **Recipe Intelligence:** Connect the recipe generation UI to Gemini to finalize the "Nutritionist" logic.

