# Jurryi — Play Console Data Safety Form Answers

Fill in the **Data safety** section of the Play Console exactly as below. Derived from [server/src/models/User.ts](server/src/models/User.ts), [server/src/models/Message.ts](server/src/models/Message.ts), and [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

## Security practices

| Question | Answer |
|---|---|
| Is data encrypted in transit? | **Yes** (HTTPS everywhere — Cloud Run enforces TLS) |
| Can users request data deletion? | **Yes** — in-app account deletion + email to contact@jurryi.com |
| Committed to Play's Families Policy? | **No** (app is 18+) |
| Independent security review? | **No** |

## Data collection & sharing — declare each type

For every row: **Collected = Yes**, **Shared = No** (no third-party commercial sharing per [PRIVACY_POLICY.md#8](PRIVACY_POLICY.md)). Anthropic/Tavily are processors, not recipients — Play treats them as "sharing with service providers," which is **not** declared as sharing.

### Personal info
| Type | Collected | Processing | Required/Optional | Purpose |
|---|---|---|---|---|
| Name | Yes | Not processed ephemerally | Required | Account functionality |
| Email address | Yes | Not processed ephemerally | Optional | Account functionality, Communications |
| Phone number | Yes | Not processed ephemerally | Required | Account functionality |
| Other info (age, gender, occupation, income category) | Yes | Not processed ephemerally | Optional | App functionality (personalizing legal guidance) |

### Location
| Type | Collected | Required/Optional | Purpose |
|---|---|---|---|
| Approximate location (state + district, user-entered) | Yes | Required | App functionality (jurisdiction-specific legal guidance) |

Note: declare as **Approximate** not Precise — we don't read GPS.

### Financial info
| Type | Collected | Required/Optional | Purpose |
|---|---|---|---|
| Other financial info (income category bucket: BPL/lower/middle/upper) | Yes | Optional | App functionality (eligibility hints for free legal aid — NALSA/DLSA) |

### Messages
| Type | Collected | Required/Optional | Purpose |
|---|---|---|---|
| Other in-app messages (user↔AI chat content) | Yes | Required | App functionality |

⚠️ Chat contains sensitive legal descriptions. Disclose this clearly in the privacy policy (already done). Do NOT check "SMS or MMS" — this is in-app only.

### App activity
| Type | Collected | Required/Optional | Purpose |
|---|---|---|---|
| Other user-generated content (problem description, conversation titles) | Yes | Required | App functionality |
| App interactions | No | — | — |

### Device or other IDs
| Type | Collected | Required/Optional | Purpose |
|---|---|---|---|
| Device or other IDs | **No** — we don't track advertising ID or device fingerprint | — | — |

If you later add analytics (Firebase Analytics, etc.), revisit this.

### NOT collected (answer "No"):
- Contacts / Calendar / Files & docs / Photos or videos / Audio / Health & fitness
- Web browsing / Installed apps / Purchases / Credit card info / Precise location
- Race/ethnicity, political/religious beliefs, sexual orientation
- Crash logs / Diagnostics (Expo doesn't ship them by default; revisit if you add Sentry)

## Data deletion endpoint

Play Console asks for a URL where users can request deletion without logging into the app:
- **URL to provide**: `https://jurryi-tech.github.io/jurryi/#data-deletion` (you should add a small section to [docs/index.html](docs/index.html) explaining the email route), OR
- **Simpler**: `mailto:contact@jurryi.com` — Play accepts a contact email as a deletion route.

## Review
After filling, Play Console will show a preview. Cross-check against the public [Privacy Policy](https://jurryi-tech.github.io/jurryi/) — any mismatch between Data Safety form and policy text is a common rejection reason.
