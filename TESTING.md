# LegalSahay -- Testing Guide

## 1. Running Backend Tests

### Prerequisites
- Node.js 20+ installed
- MongoDB running (local or Atlas)
- Environment variables configured in `server/.env`

### Run Tests

```bash
cd server
npm test
```

This runs the Jest test suite covering:
- Authentication endpoints (register, login, refresh token)
- Chat/conversation endpoints
- User profile endpoints
- Input validation and error handling
- Rate limiting behavior

### Run Tests in Watch Mode

```bash
cd server
npm run test:watch
```

### Check Coverage

```bash
cd server
npm run test:coverage
```

---

## 2. Testing on Expo Go

### iOS

1. Install **Expo Go** from the App Store.
2. Ensure your iPhone and development machine are on the **same WiFi network**.
3. Update `API_BASE_URL` in `app/utils/constants.ts` to your machine's local IP:
   ```typescript
   export const API_BASE_URL = 'http://192.168.X.X:5000/api';
   ```
4. Start the backend:
   ```bash
   cd server && npm run dev
   ```
5. Start Expo:
   ```bash
   cd app && npx expo start
   ```
6. Open the Camera app on your iPhone and point it at the QR code. Tap the Expo notification that appears.

### Android

1. Install **Expo Go** from the Google Play Store.
2. Ensure your Android device and development machine are on the **same WiFi network**.
3. Update `API_BASE_URL` as described above.
4. Start backend and Expo as described above.
5. Open Expo Go on your Android device and tap **Scan QR code**, then scan the terminal QR code.

### Troubleshooting Expo Go

- **"Network request failed"**: Verify the IP address in `API_BASE_URL` is correct and the backend is running. Check that your firewall allows connections on port 5000.
- **QR code not scanning**: Press `s` in the Expo terminal to switch to Expo Go mode if using development build mode.
- **Metro bundler errors**: Try `npx expo start --clear` to clear the cache.

---

## 3. Manual Test Checklist

### 3.1 Registration Flow

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Valid registration | Enter a valid name, 10-digit phone number, password (8+ chars) and tap Register | Account created, redirected to onboarding |
| 2 | Duplicate phone number | Register with a phone number that already exists | Error message: "Phone number already registered" |
| 3 | Invalid phone number | Enter fewer than 10 digits or non-numeric characters | Validation error shown below the phone field |
| 4 | Short password | Enter a password with fewer than 8 characters | Validation error: "Password must be at least 8 characters" |
| 5 | Empty fields | Leave one or more required fields blank and tap Register | Validation errors appear for each empty required field |
| 6 | Navigate to login | Tap "Already have an account? Login" link | Navigates to login screen |

### 3.2 Login Flow

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Correct credentials | Enter registered phone and password, tap Login | Logged in, redirected to chat or onboarding (if not completed) |
| 2 | Wrong password | Enter correct phone but wrong password | Error: "Invalid credentials" |
| 3 | Non-existent user | Enter a phone number that is not registered | Error: "Invalid credentials" or "User not found" |
| 4 | Empty fields | Leave phone or password blank | Validation error shown |
| 5 | Navigate to register | Tap "Don't have an account? Register" link | Navigates to registration screen |

### 3.3 Onboarding (3 Steps)

#### Step 1: State & District Selection
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Select state | Tap state picker, search for a state, select it | State shown in picker, district picker appears |
| 2 | Select district (predefined) | Select Delhi/Maharashtra/etc., pick a district | District shown in picker |
| 3 | Enter district (free text) | Select a state without predefined districts (e.g., Goa) | Free text input appears for district |
| 4 | Search filtering | Type in the search box in the state modal | List filters to matching states |
| 5 | Proceed to next step | Select state and district, tap Next/Continue | Moves to step 2 |

#### Step 2: Problem Type Selection
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Select problem type | Tap one of the problem type cards | Card highlights with primary color, white text |
| 2 | Change selection | Tap a different card | Previous deselects, new one highlights |
| 3 | Add description | Type in the optional description field | Text entered, multiline works |
| 4 | Proceed without description | Select type only, tap Next | Moves to step 3 (description is optional) |

#### Step 3: Language Preference
| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Select English | Tap English card | Card highlights, check icon appears |
| 2 | Select Hindi | Tap Hindi card | Card highlights with Hindi text |
| 3 | Select Hinglish | Tap Hinglish card | Card highlights |
| 4 | Complete onboarding | Select language, tap Finish/Get Started | Onboarding completes, redirected to main chat |

### 3.4 Chat

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Send first message | Type a question and tap send | Message appears in right-aligned blue bubble; AI response streams in left-aligned gray bubble |
| 2 | Suggested questions | On new conversation, verify suggested questions appear | Tappable chips shown based on problem type |
| 3 | Tap suggested question | Tap one of the suggested question chips | Question sent as message, AI responds |
| 4 | Streaming response | Send a message and observe AI response | Text appears incrementally with typing indicator, then blinking cursor during stream |
| 5 | Markdown rendering | Ask a question that produces lists/bold text | Bold text renders bold; numbered and bullet lists render properly |
| 6 | Long message | Send a very long message (500+ characters) | Message wraps properly within bubble, max width 80% |
| 7 | Empty send blocked | Try to tap send with empty input | Send button is disabled/grayed out |
| 8 | Multiple messages | Send 5+ messages in sequence | All messages render correctly with proper alignment |
| 9 | Scroll behavior | Send enough messages to exceed screen height | Chat scrolls to latest message automatically |
| 10 | Timestamp display | Verify timestamps below message bubbles | Time shown in HH:MM format |

### 3.5 Conversation History

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | List conversations | Navigate to history tab | All previous conversations listed with titles and timestamps |
| 2 | Open old conversation | Tap a conversation in the list | Full conversation loads with all previous messages |
| 3 | Continue conversation | Open old conversation, send a new message | New message added, AI responds in context |
| 4 | Delete conversation | Swipe or tap delete on a conversation | Conversation removed from list |
| 5 | Empty state | Verify history screen with no conversations | Friendly empty state message shown |

### 3.6 Profile

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | View profile | Navigate to profile tab | Name, phone, location, problem type, language displayed |
| 2 | Edit name | Tap edit, change name, save | Name updated successfully |
| 3 | Edit location | Change state/district, save | Location updated |
| 4 | Edit language | Change language preference, save | Language preference updated |
| 5 | Logout | Tap logout button | Logged out, redirected to login screen |
| 6 | Confirm logout | Verify logout shows confirmation dialog | Confirmation dialog appears before logging out |

### 3.7 Token Refresh

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Auto refresh | Stay logged in for 15+ minutes (access token TTL), then perform an action | App automatically refreshes the token; action succeeds without re-login |
| 2 | Expired refresh token | Wait until refresh token expires (or manually clear it) | App redirects to login screen |
| 3 | Concurrent requests | Trigger multiple API calls simultaneously after token expires | Only one refresh request fires; all pending calls resolve after refresh |

### 3.8 Offline Behavior

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Disable network | Turn off WiFi/mobile data, then try to send a message | Error message: "No internet connection" or "Network error" |
| 2 | Disable during chat | Start a chat, then disable network mid-stream | Graceful error shown; partial response preserved if any |
| 3 | Re-enable network | Turn network back on after error | App recovers; next message sends successfully |
| 4 | Login offline | Try to log in with no network | Clear error message about network connectivity |

### 3.9 Rate Limiting

| # | Test Case | Steps | Expected Result |
|---|-----------|-------|-----------------|
| 1 | Exceed message limit | Send more than 20 messages within 1 minute | Error message about rate limiting; retry-after information shown |
| 2 | Recovery after limit | Wait for the rate limit window to pass, then send again | Message sends successfully |

---

## 4. Common Issues and Fixes

### "Network request failed" on Expo Go
- **Cause**: `API_BASE_URL` is set to `localhost`, which on a physical device refers to the device itself, not your computer.
- **Fix**: Change `API_BASE_URL` to your computer's local IP (e.g., `http://192.168.1.100:5000/api`). Find your IP with `ipconfig` (Windows) or `ifconfig` (macOS/Linux).

### "Unable to resolve module" errors
- **Cause**: Missing dependency or incorrect import path.
- **Fix**: Run `npx expo install` to install all required peer dependencies. Then restart Metro with `npx expo start --clear`.

### Chat messages not streaming
- **Cause**: Backend may not be sending Server-Sent Events correctly, or the client is not reading the stream.
- **Fix**: Verify the backend `/api/chat/send` endpoint returns `Content-Type: text/event-stream`. Check the client code handles the `EventSource` or fetch stream properly.

### Keyboard covers input on iOS
- **Cause**: `KeyboardAvoidingView` not configured properly.
- **Fix**: Ensure `KeyboardAvoidingView` wraps the chat screen with `behavior="padding"` on iOS and `keyboardVerticalOffset` set to the header height.

### State/District picker not showing options
- **Cause**: Constants file may not be imported correctly.
- **Fix**: Verify `INDIAN_STATES` and `DISTRICTS` are properly exported from `app/utils/constants.ts` and imported in `StateDistrictPicker.tsx`.

### "Text strings must be rendered within a <Text> component"
- **Cause**: Stray whitespace or conditional rendering issue in JSX.
- **Fix**: Ensure all string literals and expressions that render text are wrapped in `<Text>` components. Check conditional renders use `{condition ? <Component /> : null}` instead of `{condition && <Component />}` where the condition might be `0` or `""`.

### Android back button closes app instead of navigating back
- **Cause**: Expo Router or React Navigation not handling back press.
- **Fix**: Ensure `expo-router` is configured properly in `app.json` and that stack navigators are used where back navigation is expected.

### JWT token issues after server restart
- **Cause**: Server restart may change the JWT secret if it was auto-generated.
- **Fix**: Set a fixed `JWT_SECRET` and `JWT_REFRESH_SECRET` in the `.env` file. If tokens are invalid after restart, log out and log back in.

### MongoDB connection errors
- **Cause**: MongoDB Atlas IP whitelist, wrong connection string, or network issues.
- **Fix**: Add your current IP to the MongoDB Atlas Network Access whitelist. Verify the connection string in `.env` includes the correct username, password, and database name.

### Expo build fails with EAS
- **Cause**: Native dependencies or Expo SDK version mismatch.
- **Fix**: Run `npx expo-doctor` to check for issues. Ensure all packages are compatible with your Expo SDK version using `npx expo install --check`.
