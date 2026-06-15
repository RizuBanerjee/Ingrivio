# Ingrivio

A premium AI-powered Indian nutrition, recipe, and meal-planning mobile app built with Expo (React Native). Features include AI food scanning, recipe generation, calorie/macro tracking, bilingual chat, and customizable themes.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required secrets: `GEMINI_API_KEY`, `OPENAI_API_KEY` (for AI features), `FIREBASE_*` (stored in shared env vars)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo ~54 (React Native 0.81), React Router, react-native-reanimated, expo-linear-gradient
- API: Express 5 + `@google/genai` SDK (Gemini 2.5-flash)
- DB: PostgreSQL + Drizzle ORM
- Auth: Firebase Auth (Email/Password) via web SDK
- Cloud: Firebase Firestore (sync), Google Analytics (events)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/app/` — Expo Router screens (file-based routing)
- `artifacts/mobile/app/(tabs)/` — Main tab screens: home, scan, recipes, chat, profile
- `artifacts/mobile/app/auth.tsx` — Auth screen (login/register)
- `artifacts/mobile/app/recipe/[id].tsx` — Recipe detail screen
- `artifacts/mobile/contexts/` — AppContext, ThemeContext, LanguageContext, FirebaseAuthContext
- `artifacts/mobile/firebase/` — Firebase config, auth, Firestore, analytics
- `artifacts/mobile/constants/themes.ts` — 8-theme system with gradient definitions
- `artifacts/mobile/constants/strings.ts` — i18n strings (EN + Hindi)
- `artifacts/mobile/components/` — CalorieRing, MacroBars, RecipeCard, etc.
- `artifacts/mobile/services/ai.ts` — AI API calls to backend
- `artifacts/api-server/src/routes/ai.ts` — Express AI routes using Gemini
- `lib/api-spec/openapi.yaml` — API contract (OpenAPI spec)

## Architecture decisions

- Use Firebase Web SDK (not native iOS/Android SDK) for Expo Go compatibility — avoids native configuration complexity
- Firestore sync is opportunistic: user data syncs to cloud when logged in, local AsyncStorage remains source of truth
- `expo-secure-store` installed for future credential storage (not used yet)
- **Never** name files `auth.ts`, `firestore.ts`, or `analytics.ts` in `firebase/` — they shadow the `firebase/*` module imports and create circular TS2303 errors
- Use `@google/genai` SDK instead of `@google/generative-ai` — better API surface for Gemini
- Use `fetch` from `expo/fetch` for streaming (not `XMLHttpRequest`)
- 8 themes in `THEMES` record keyed by `ThemeId` — `useColors()` returns `theme.colors + radius` for convenience
- `KeyboardAvoidingView` from `react-native-keyboard-controller` used in chat
- Inverted `FlatList` for chat messages (handles auto-scroll automatically)
- `Unsplash` image URLs for recipe cards (no API key needed, stable URLs by category)

## Product

- AI-powered food scanning: detect ingredients or analyze nutrition from any food photo
- Recipe generation: generate Indian recipes from scanned ingredients with real photos
- Nutrition chat: bilingual AI chat for nutrition advice in English or Hindi
- Calorie & macro tracking: daily log with calorie ring, macro bars, water tracking
- Meal planning: log food by meal type (breakfast/lunch/dinner/snack)
- Themes: 8 customizable themes (dark purple, midnight, aurora, ember, forest, light, pure dark, pure light)
- Languages: English and Hindi
- Firebase Auth: sign up/sign in with email + password, password reset
- Firebase Firestore sync: profile, daily logs, recipes synced to cloud when logged in
- Google Analytics: auto-tracked events (food scanned, recipe generated, login, signup)

## User preferences

- Premium AI-powered Indian nutrition focus
- Dark purple theme is default
- English is default language
- Guest mode supported (no auth required to use the app)

## Gotchas

- **Never install `firebase/auth` or `firebase/firestore` as filenames** — they shadow the npm packages and cause TS2303 circular reference errors
- **Gemini free tier**: 20 requests/day max per user — 503 "high demand" errors are expected at peak times
- Expo dev server may need restart after installing new dependencies (especially Firebase)
- Web-only CSS warnings (`transform-origin`, `pointerEvents`) are benign — they don't affect functionality
- `expo-secure-store` version warning: `56.0.4` installed vs expected `~15.0.8` — this is harmless

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- `artifacts/mobile/firebase/` is the source of truth for Firebase SDK configuration
- `artifacts/mobile/contexts/FirebaseAuthContext.tsx` wraps `AppProvider` for auth state + sync
