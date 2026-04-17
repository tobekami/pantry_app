# Smart Pantry Tracker & AI Nutritionist 🍏

A Next.js application that completely transforms how you manage your kitchen inventory, discover recipes, and maintain diet compliance. Built with cutting-edge AI integrations to seamlessly track your pantry items globally, auto-detect ingredients via your device's camera, and serve as an intelligent culinary assistant.

## ✨ Key Features

- **Pantry Management**: Effortlessly track quantities, expiration dates, and types of ingredients stored in your kitchen ecosystem.
- **AI Camera Scanner**: Too lazy to type? Snap a picture of your food items to let the AI auto-detect and instantly categorize it.
- **Dynamic Recipe Engine**: Hooks into the Spoonacular API to instantly cross-reference what you currently have in your physical pantry against thousands of recipes. Includes a highly optimized `sessionStorage` caching mechanism to guarantee fast loading without server load.
- **The "Smart Nutritionist"**: Powered by Google's latest Gemini AI models! Define your primary dietary goals and stringent allergies. Before viewing a recipe, Gemini evaluates the entire ingredient list and gives it a `🟢 Cleared`, `🟡 Caution`, or `🔴 Avoid` rating.
- **"Make It Fit" Swaps**: If the AI nutritionist catches an ingredient that violates your diet (e.g., Heavy Cream for a Vegan), it calculates and displays customized 1:1 ingredient swap pairs dynamically in the UI.
- **Saved Cookbook**: Bookmark safe versions of AI-approved recipes directly to your personal Firestore collection.

## 🛠 Tech Stack

- **Frontend**: React 18, Next.js 14 (App Router), Material-UI (MUI v5)
- **Backend/DB**: Firebase Authentication, Google Cloud Firestore
- **AI Capabilities**: Google Gemini API (`gemini-3.1-flash-lite-preview`)
- **Third-Party APIs**: Spoonacular Recipe API

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/tobekami/pantry_app.git
cd pantry_app
npm install
```

### 2. Environment Variables
You will need to create a `.env.local` file in the root directory. Grab the keys from your heavily guarded vault:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_SPOONACULAR_API_KEY=your_spoonacular_key
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the physical result.

## 🔒 Security Data
This project securely integrates Cloud Firestore. Write operations for `/pantry` and `/saved_recipes` require secure Google Authentication checks implicitly handled by the backend Firebase rules.
