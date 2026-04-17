# Jurryi — Play Store Launch Runbook

Ordered step-by-step. Everything below the **code-side status** section must be done by you — they require credentials, payments, or account signups that can't be scripted.

## Code-side status (done)
- [x] Expo SDK 52 compatible, `expo-doctor` passes
- [x] Android build config: `com.jurryi.app`, v1.0.0, versionCode 1, AAB output
- [x] Kotlin/Compose build issue resolved (`newArchEnabled: false`)
- [x] Backend live on Cloud Run (`jurryi-api-1042325455608.asia-south1.run.app`)
- [x] Firestore in production
- [x] Privacy Policy + Terms at `https://jurryi-tech.github.io/jurryi/` (add `#terms` for TOS anchor)
- [x] Store listing drafted in [app/store-listing.md](app/store-listing.md) — URL corrected
- [x] Permissions minimal (`INTERNET` only)
- [x] Data Safety answers in [DATA_SAFETY.md](DATA_SAFETY.md)

## Pre-launch, YOU must do

### 1. Revoke the exposed GitHub PAT ⚠️
- Open https://github.com/settings/tokens
- Find the token starting `ghp_yrkK3LO...` and **Revoke**
- This is still valid until revoked — do this today.

### 2. Verify email addresses actually receive mail
Single address used everywhere public-facing: `contact@jurryi.com`.

Confirm this mailbox actually receives mail (MX records set, forwarding configured, or mailbox exists). Play Console **will verify** the contact email by sending a test message. Developer account itself uses `udditkantsinha@gmail.com`.

### 3. Verify Pages site resolves to 200
```bash
curl -I https://jurryi-tech.github.io/jurryi/
```
Should be `HTTP/2 200`. If still 404 after ~15 min, push any commit to `main` to re-trigger the build, or toggle Pages off/on in repo Settings → Pages.

### 4. Create Google Play Developer account ($25 one-time)
- https://play.google.com/console/signup
- Choose **Organization** account (not personal) if Jurryi is a company
- Identity verification with government ID takes ~48 hours

### 5. Create a Google Cloud service account for `eas submit`
Expo's guide: https://docs.expo.dev/submit/android/#creating-a-google-service-account-key

Short version:
1. Google Cloud Console → create/select the project that owns your Play Console
2. APIs & Services → enable **Google Play Android Developer API**
3. IAM → Service accounts → **Create service account** (name: `eas-submit`)
4. Keys tab → **Add key** → JSON → download
5. Save as `app/google-service-account.json` (already git-ignored? verify before committing anything)
6. In Play Console → Setup → API access → **Link** this service account, grant **Release manager** role

### 6. Capture store assets
Listed in [app/store-listing.md](app/store-listing.md) and Play requirements:
- **8 screenshots** (min 2, max 8), phone size 1080×1920 or similar
- **Feature graphic** 1024×500 JPG/PNG — NOT in `app/assets/`, must be created
- **High-res icon** 512×512 PNG — your existing `app/assets/icon.png` is 1024×1024, resize or let Play auto-scale

Fastest way to get screenshots:
```bash
cd app
eas build --profile preview --platform android  # produces APK
# install on a real device, run, screenshot with Vol Down + Power
```

### 7. Run the production build
```bash
cd app
eas login                             # one-time
eas build --profile production --platform android
```
- Takes ~15 min
- Outputs a signed `.aab`
- First build will ask about app signing key — let EAS manage it (default)

### 8. Create the app in Play Console
- Dashboard → **Create app**
  - App name: Jurryi
  - Default language: English (India)
  - App or game: App
  - Free or paid: Free
- Fill **Main store listing** from [app/store-listing.md](app/store-listing.md)
  - Upload screenshots, feature graphic, icon
- **Policy → Privacy policy**: `https://jurryi-tech.github.io/jurryi/`
- **Policy → App access**: Provide test login credentials (Play reviewers need a working account) — use a registered phone + password
- **Policy → Content rating**: complete questionnaire (legal/reference, no violence, no sensitive content → Everyone)
- **Policy → Data safety**: fill using [DATA_SAFETY.md](DATA_SAFETY.md)
- **Policy → Target audience**: 18+
- **Policy → News app**: No
- **Policy → Ads**: No ads (verify this matches reality; if you later add any, update)
- **Policy → Government apps**: No (this is legal *information*, not an official govt app — be explicit)

### 9. Submit the AAB
```bash
cd app
eas submit --profile production --platform android
```
This uploads to the **internal** track (per [eas.json](app/eas.json)). Internal testing releases are visible only to testers you add, and skip review — fastest way to validate the submission pipeline end-to-end.

### 10. Promote to Production
In Play Console → Release → Production → **Create new release** → promote the internal build → fill release notes → **Send for review**.

Review typically takes 3–7 days for a new app. First-time Play developers often face an additional closed testing requirement (20 testers for 14 days before production). Check current Play policy; if it applies, start closed testing immediately after step 9.

## Post-launch
- [ ] Monitor Play Console → Quality → Android vitals for ANRs/crashes
- [ ] Set up Cloud Run alerts for 5xx rate
- [ ] Firestore rules audit (make sure no read-all rules leaked)
- [ ] Add an "Account deletion" screen in-app (Play requires this to be in-app, not just email-based)

## Known gotchas
- **Trademark name**: "Jurryi" should be clear, but search https://www.trademarkindia.gov.in/ and Play Store before launching to avoid rejection on name collision.
- **Legal disclaimer**: Play may flag legal-advice apps. Your disclaimer in [app/store-listing.md:43](app/store-listing.md) ("information, not legal advice") is the key mitigator — keep it prominent in the app too.
- **First Indian developer submissions** sometimes need extra verification. Keep your government ID photos handy.
