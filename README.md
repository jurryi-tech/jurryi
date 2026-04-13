# Jurryi -- AI-Powered Legal Assistant for India

Jurryi is a cross-platform mobile application that provides personalized, AI-powered legal guidance to Indian citizens. Built with React Native (Expo) and Node.js, it leverages Claude AI to deliver jurisdiction-aware legal information based on the user's location, language preference, and legal issue type.

## Features (Stage 1)

- **Registration & Onboarding**: Phone-based registration with personalized onboarding (location, legal issue type, language preference)
- **AI Chat**: Real-time streaming chat with Claude AI, personalized to user's jurisdiction and legal issue
- **User Profile**: View and edit profile information

## Tech Stack

### Mobile App
- React Native with Expo (SDK 52+)
- TypeScript (strict mode)
- Expo Router (file-based navigation)
- React Native Paper (Material Design 3)
- Zustand for state management

### Backend
- Node.js 20+ with Express.js, TypeScript
- MongoDB Atlas with Mongoose
- JWT authentication (access + refresh tokens)
- @anthropic-ai/sdk for Claude API (direct integration, no LangChain)
- Tavily API for real-time legal search

## Prerequisites

- Node.js 20+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key
- Tavily API key
- Expo Go app on your phone (for testing)

## Setup

### Backend

1. Navigate to server directory:
   ```bash
   cd server
   npm install
   ```

2. Create environment file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` with your actual credentials:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string for JWT signing
   - `JWT_REFRESH_SECRET`: A different strong random string
   - `ANTHROPIC_API_KEY`: Your Anthropic API key
   - `TAVILY_API_KEY`: Your Tavily API key

4. Start the development server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### Mobile App

1. Navigate to app directory:
   ```bash
   cd app
   npm install
   ```

2. Update API URL in `utils/constants.ts`:
   - For local development: `http://<your-local-ip>:5000/api`
   - For deployed backend: your production URL

3. Start Expo:
   ```bash
   npx expo start
   ```

4. Scan the QR code with:
   - **iOS**: Camera app -> tap the Expo notification
   - **Android**: Expo Go app -> scan QR code

## Testing on Real Devices

1. Ensure your phone and computer are on the same WiFi network
2. Update `API_BASE_URL` in `app/utils/constants.ts` to use your computer's local IP (e.g., `http://192.168.1.100:5000/api`)
3. Start the backend server
4. Start Expo and scan the QR code with Expo Go

## Running Tests

```bash
cd server
npm test
```

## Deployment

### Backend (Railway/Render)
1. Push server code to a Git repository
2. Connect to Railway or Render
3. Set environment variables
4. Deploy -- the service will run `npm run build && npm start`

### Mobile App (EAS Build)
1. Install EAS CLI: `npm install -g eas-cli`
2. Login: `eas login`
3. Configure: `eas build:configure`
4. Build: `eas build --platform all`
5. Submit to stores: `eas submit`

## Project Structure

```
server/                     # Express.js backend
  src/
    config/                 # Database and environment config
    middleware/             # Auth, rate limiting, error handling
    models/                # Mongoose models (User, Conversation, Message)
    routes/                # API route handlers
    services/              # Claude AI, Tavily, context builder
    utils/                 # System prompt, Indian law constants
    index.ts               # Express app entry point
  test/                    # Jest test suites
app/                        # React Native (Expo) mobile app
  app/                     # Expo Router screens
    (auth)/                # Login, Register, Onboarding
    (main)/                # Chat, History, Profile (tab navigator)
  components/              # Reusable UI components
  services/                # API service layer
  stores/                  # Zustand state management
  utils/                   # Constants and helpers
README.md
```
