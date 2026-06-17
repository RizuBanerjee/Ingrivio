# Ingrivio Setup & Deployment Guide

## Overview

Ingrivio is a premium AI-powered Indian nutrition, recipe, and meal-planning mobile app built with Expo (React Native). It features AI food scanning, recipe generation, calorie/macro tracking, bilingual chat, and customizable themes.

## Prerequisites

- **Node.js** 24+ (recommended via nvm)
- **pnpm** 9+ (install via `npm install -g pnpm`)
- **PostgreSQL** 14+ (local or cloud instance)
- **Firebase** project (free tier works)
- **Google Cloud** project (for Gemini API access)
- **Expo** account (for mobile development via Expo Go)

## Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/your-repo/ingrivio.git
cd ingrivio
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database (required for API server)
DATABASE_URL=postgresql://user:password@localhost:5432/ingrivio

# AI API Keys
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key

# Firebase (required for auth and sync)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id

# Google Analytics (optional)
GA_TRACKING_ID=your-ga-tracking-id

# API Server
PORT=5000
BASE_PATH=/api
```

> **Note:** Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/app/apikey). The free tier allows 20 requests/day per user.

### 4. Set Up the Database

```bash
# Push schema to PostgreSQL (dev only)
pnpm --filter @workspace/db run push

# Or run migrations
pnpm --filter @workspace/db run migrate
```

### 5. Generate API Types

```bash
# Generate React Query hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

### 6. Start the Development Servers

```bash
# Terminal 1: Start the API server
pnpm --filter @workspace/api-server run dev

# Terminal 2: Start the Expo mobile app
pnpm --filter @workspace/mobile run dev
```

The Expo dev server will show a QR code. Scan it with the **Expo Go** app on your phone to run the app.

## Project Structure

```
ingrivio/
├── artifacts/
│   ├── mobile/           # Expo mobile app
│   │   ├── app/           # Expo Router screens
│   │   ├── components/    # UI components (CalorieRing, MacroBars, RecipeCard)
│   │   ├── contexts/      # AppContext, ThemeContext, LanguageContext
│   │   ├── services/      # AI API calls, notifications
│   │   ├── firebase/      # Firebase config, auth, Firestore
│   │   ├── constants/     # Themes, i18n strings
│   │   └── assets/        # Images, logos
│   ├── api-server/       # Express API backend
│   └── mockup-sandbox/   # UI component preview server
├── lib/
│   ├── api-spec/         # OpenAPI spec + generated code
│   ├── db/               # Drizzle ORM schema
│   ├── shared/           # Shared utilities
│   └── ui/               # Shared UI components
├── pnpm-workspace.yaml   # Workspace configuration
├── package.json          # Root orchestration
└── .env                  # Environment variables
```

## Git Workflow

### Pushing to GitHub

```bash
# Initialize git (if not already)
git init

# Add remote (replace with your repo)
git remote add origin https://github.com/your-username/ingrivio.git

# Commit your changes
git add .
git commit -m "feat: initial commit"

# Push to GitHub
git branch -M main
git push -u origin main

# For subsequent pushes
git add .
git commit -m "feat: your changes"
git push
```

### Pulling Latest Changes

```bash
git pull origin main
pnpm install
```

## Common Commands

```bash
# Typecheck all packages
pnpm run typecheck

# Build all packages
pnpm run build

# Regenerate API types
pnpm --filter @workspace/api-spec run codegen

# Push DB schema
pnpm --filter @workspace/db run push

# Run mobile app
pnpm --filter @workspace/mobile run dev

# Run API server
pnpm --filter @workspace/api-server run dev

# Run component preview
pnpm --filter @workspace/mockup-sandbox run dev
```

## Deployment

### Option 1: Replit (Recommended)

1. Import your GitHub repo into Replit
2. The Replit environment will auto-detect the pnpm workspace
3. Set up environment variables in Replit Secrets
4. Use the Replit deployment feature to go live

### Option 2: Self-Hosted

**API Server:**
```bash
# Build the API server
pnpm --filter @workspace/api-server run build

# Run the production server
pnpm --filter @workspace/api-server start
```

**Mobile App:**
```bash
# Build for production
pnpm --filter @workspace/mobile expo build

# Or use EAS (Expo Application Services)
eas build --platform ios
```

### Option 3: Docker (Advanced)

```dockerfile
# Dockerfile
FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter @workspace/api-server run build
EXPOSE 5000
CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
```

```bash
docker build -t ingrivio-api .
docker run -p 5000:5000 --env-file .env ingrivio-api
```

## Mobile Download

### For Development (Expo Go)

1. Install **Expo Go** from the App Store / Play Store
2. Run `pnpm --filter @workspace/mobile run dev`
3. Scan the QR code with your phone

### For Production (APK / IPA)

Use Expo Application Services (EAS):

```bash
# Install EAS CLI
npm install -g eas-cli

# Build APK (Android)
eas build --platform android

# Build IPA (iOS)
eas build --platform ios

# Or build both
eas build --platform all
```

The builds will be available in your EAS dashboard. Download the APK/IPA and distribute via:
- Android: Share the APK file directly
- iOS: TestFlight for distribution

## Troubleshooting

### Database Connection

If you get connection errors:
```bash
# Check PostgreSQL is running
psql -d ingrivio -c "\dt"

# Verify connection string format
# Correct: postgresql://user:password@host:port/dbname
```

### Firebase Auth

If auth fails:
1. Check `FIREBASE_*` env vars are correct
2. Verify Firebase project settings match
3. Enable Email/Password provider in Firebase Console

### AI API Limits

Gemini free tier = 20 requests/day. If you see "high demand" errors:
- Wait a few minutes
- Or upgrade to a paid plan

### TypeScript Errors

```bash
# Run the full typecheck
pnpm run typecheck

# Check specific package
pnpm --filter @workspace/mobile run typecheck
```

### Missing Dependencies

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Tech Stack

- **Mobile**: Expo ~54, React Native 0.81, React Router, Reanimated
- **Backend**: Express 5, `@google/genai` SDK (Gemini 2.5-flash)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Firebase Auth (Email/Password) via web SDK
- **Cloud**: Firebase Firestore, Google Analytics
- **Validation**: Zod v4, drizzle-zod
- **API**: OpenAPI-first, Orval codegen
- **Build**: esbuild (CJS), pnpm workspaces

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the OpenAPI spec at `lib/api-spec/openapi.yaml`
- Check the Firebase config at `artifacts/mobile/firebase/`
