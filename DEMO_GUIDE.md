# Complete Demo & Submission Guide
## Hedera Hello Future Apex 2026 — Sustainability Track

> **This guide covers every remaining action to complete your submission.**
> Follow steps in order. Total time needed: ~45 minutes.

---

## PART A — Vercel Deployment (Live Demo URL) — 10 min

### Step 1: Vercel is already open in your browser
Vercel new project page is open. You will see 4 environment variable fields pre-filled:
- `HEDERA_OPERATOR_ID`
- `HEDERA_OPERATOR_KEY`
- `AUDIT_TOPIC_ID`
- `REC_TOKEN_ID`

### Step 2: Fill in the values

| Variable | Value |
|----------|-------|
| `HEDERA_OPERATOR_ID` | `0.0.6255927` |
| `HEDERA_OPERATOR_KEY` | *(your testnet private key from .env file)* |
| `AUDIT_TOPIC_ID` | `0.0.7964262` |
| `REC_TOKEN_ID` | `0.0.7964264` |

### Step 3: Click Deploy
- Vercel will build and deploy in ~60 seconds.
- You will get a URL like: `https://hedera-hydropower-mrv.vercel.app`

### Step 4: Test your deployment
Open these URLs in browser — all must work:
```
https://YOUR-VERCEL-URL.vercel.app/           → HTML dashboard
https://YOUR-VERCEL-URL.vercel.app/api/demo   → JSON pipeline output
https://YOUR-VERCEL-URL.vercel.app/api/status → JSON system status
```

### Step 5: Add URL to HACKATHON.md
Edit `HACKATHON.md` and replace:
```
*(Deploy and add URL before Mar 23 — see deployment section below)*
```
With:
```
https://YOUR-VERCEL-URL.vercel.app
```

---

## PART B — GitHub Actions Secrets — 5 min

Your CI workflow needs these secrets to run live Hedera tests.

### Step 1: Go to repo secrets
Open: https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/settings/secrets/actions

### Step 2: Click "New repository secret" and add each:

| Secret name | Value |
|-------------|-------|
| `HEDERA_OPERATOR_ID` | `0.0.6255927` |
| `HEDERA_OPERATOR_KEY` | *(your testnet private key)* |
| `AUDIT_TOPIC_ID` | `0.0.7964262` |
| `REC_TOKEN_ID` | `0.0.7964264` |
| `EF_GRID` | `0.8` |

### Step 3: Re-run CI
Go to: https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv/actions
Click the latest workflow run → click "Re-run all jobs".
Wait for the green ✅ badge.

---

## PART C — Record Demo Video — 30 min

### What you need
- OBS Studio (free) OR Windows built-in Xbox Game Bar (Win+G) OR Loom (free browser extension)
- Your terminal / PowerShell
- A YouTube account (upload as Unlisted)

### Setup before recording
```powershell
# In your project folder:
cd C:\path\to\hedera-hydropower-mrv
npm install

# Make sure .env has your credentials:
# HEDERA_OPERATOR_ID=0.0.6255927
# HEDERA_OPERATOR_KEY=your_private_key_here
# AUDIT_TOPIC_ID=0.0.7964262
# REC_TOKEN_ID=0.0.7964264
# EF_GRID=0.8
```

---

## VIDEO SCRIPT (Word-for-Word)

### [0:00 – 0:30] Opening — say this:
> "Hi, I'm Bikram Biswas from Balurghat, West Bengal, India.
> This is Hedera Hydropower MRV — an on-chain Measurement, Reporting and
> Verification system for run-of-river hydropower plants,
> built for the Hedera Hello Future Apex Hackathon 2026, Sustainability Track.
> I'll show you the complete pipeline in about 10 minutes."

**Show on screen:** GitHub repo homepage at
https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv

---

### [0:30 – 1:30] Problem — say this:
> "The voluntary carbon market is worth $50 billion and growing.
> But hydropower carbon credits rely on Excel spreadsheets and manual field audits.
> There is no cryptographic audit trail — a corrupt operator can inflate readings,
> issue phantom RECs, and carbon registries cannot independently verify the data.
> This project solves that with Hedera."

**Show on screen:** `VALIDATION.md` in the repo — scroll to the Market Research section.

---

### [1:30 – 2:30] Architecture — say this:
> "Here is how the system works:
> Step 1 — each sensor device registers a W3C DID on Hedera.
> Step 2 — the plant deploys an HREC token on Hedera Token Service.
> Step 3 — every telemetry reading goes through the AI Guardian,
>   which runs physics-based anomaly detection using the ACM0002 UNFCCC methodology.
> Step 4 — the result — approved, flagged, or rejected — is anchored to Hedera HCS.
>   This is permanent. It cannot be deleted.
> Step 5 — only AI-approved readings trigger HREC token minting.
> Step 6 — any auditor, regulator, or carbon registry can verify the entire history
>   on HashScan without trusting anyone."

**Show on screen:** `README.md` — the Architecture section or the How It Works table.

---

### [2:30 – 5:00] Live Demo — run this in terminal:
```powershell
npm run demo
```

**While it runs, say:**
> "I'm running the live demo now.
> Step 1 — device DID is registered. Every turbine gets a cryptographic identity.
> Step 2 — HREC token — this is the Hydropower Renewable Energy Certificate.
>   One token equals one verified megawatt-hour.
> Step 3 — I'm submitting a normal reading. Flow rate 12.5 cubic metres per second,
>   head 45.2 metres, efficiency 88 percent.
>   The AI Guardian computes expected power output using the ACM0002 formula —
>   rho times g times Q times H times eta — that gives 4.87 megawatts.
>   The reported output matches. Trust score: 94 percent. Status: APPROVED.
>   This is now anchored to Hedera HCS — permanently."

**Pause. Point at the TX ID. Say:**
> "There is the Hedera transaction ID. I'll open HashScan now."

**Open in browser:**
```
https://hashscan.io/testnet/topic/0.0.7964262
```

**Say:**
> "You can see the message on HashScan right now. Independently verifiable by anyone."

**Back to terminal. Say:**
> "Step 4 — fraud attempt. Same device, same conditions —
>   but the operator has inflated power output to 9.5 megawatts.
>   Physics says maximum is 4.87. The AI Guardian detects this.
>   Trust score: 45 percent. Status: REJECTED.
>   But notice — the rejection is ALSO anchored to Hedera HCS.
>   The fraud attempt is preserved on-chain forever.
>   A carbon registry auditor can see not just approvals, but every rejected fraud attempt too."

**Say:**
> "Step 5 — HREC tokens are minted only for the approved reading.
>   4.87 tokens, representing 4.87 verified megawatt-hours.
>   At a grid emission factor of 0.8 tonnes per MWh, that is 3.9 tCO2 credits.
>   Cryptographically verified. Independently auditable."

---

### [5:00 – 6:30] Live Vercel Dashboard — say this:
> "Now let me show you the live dashboard deployed on Vercel."

**Open in browser:** `https://YOUR-VERCEL-URL.vercel.app`

**Say:**
> "This is the live demo dashboard. You can see the system stats —
>   234 tests passing, less than 5 milliseconds per verification.
>   Here are the live Hedera Testnet transaction IDs — click any of them
>   and you can verify on HashScan right now."

**Click the HashScan links. Say:**
> "This is the approved transaction. This is the rejected fraud transaction.
>   Both are permanent. Both are on Hedera."

**Click "Run Demo (JSON)" button. Say:**
> "This API endpoint runs the full MRV pipeline and returns structured JSON.
>   Every step — DID, token, telemetry verification, fraud rejection, REC minting —
>   all in one API call. This is what a carbon registry integration would consume."

---

### [6:30 – 7:30] Tests & CI — say this:
> "Let me show you the test coverage."

**Run in terminal:**
```powershell
npm test
```

**While tests run, say:**
> "234 automated tests across 9 test suites.
>   The physics engine, the AI Guardian trust scoring, the Hedera HCS and HTS integration,
>   the ACM0002 calculations, the full end-to-end pipeline — all tested.
>   Every commit triggers this CI suite on GitHub Actions."

---

### [7:30 – 8:30] Scale & Impact — say this:
> "What does this mean at scale?
>   There are 50,000 run-of-river hydropower plants globally.
>   Each plant onboarded creates one new Hedera account, one HCS topic, one HTS token.
>   At 500 plants with hourly readings — 4.38 million HCS transactions per year.
>   At full global scale — 2.6 billion HCS transactions per year.
>   Every verified carbon credit is anchored on Hedera.
>   Carbon registries like Verra and Gold Standard would list Hedera transaction IDs
>   as audit proof in their reports — giving Hedera direct exposure to the
>   50-billion-dollar voluntary carbon market."

**Show on screen:** `IMPACT.md` — scroll through the tables.

---

### [8:30 – 9:00] Closing — say this:
> "Hedera Hydropower MRV makes carbon credit fraud cryptographically impractical.
>   The code is open source, the tests are passing, the Hedera integration is live.
>   Thank you for watching.
>   Links to the repo, live demo, and all HashScan evidence are in the description."

---

## VIDEO DESCRIPTION (paste into YouTube)

```
Hedera Hydropower MRV — Apex Hackathon 2026 | Sustainability Track

Full demo of on-chain Measurement, Reporting & Verification for run-of-river hydropower.
Physics-based AI Guardian (ACM0002/UNFCCC) + Hedera HCS + Hedera Token Service.

🔗 GitHub Repo:
https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv

🔗 Live Demo Dashboard:
https://YOUR-VERCEL-URL.vercel.app

🔗 Approved TX on HashScan:
https://hashscan.io/testnet/transaction/0.0.6255927@1771367521.991650439

🔗 Fraud-Rejected TX on HashScan:
https://hashscan.io/testnet/transaction/0.0.6255927@1771367525.903417316

🔗 HREC Token:
https://hashscan.io/testnet/token/0.0.7964264

🔗 HCS Audit Topic:
https://hashscan.io/testnet/topic/0.0.7964262

🔗 Hackathon:
https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026
```

---

## PART D — After Recording

### Upload to YouTube
1. Go to https://studio.youtube.com
2. Click "Create" → "Upload video"
3. Select your recording file
4. Title: `Hedera Hydropower MRV — Apex Hackathon 2026 | Sustainability Track | Full Demo`
5. Description: paste the block above
6. Visibility: **Unlisted** (judges can access with link; not public)
7. Click "Save" — copy the video URL (e.g. `https://youtu.be/XXXXXXXXXX`)

### Update HACKATHON.md
Replace the Demo Video placeholder:
```
*(Record and add YouTube URL before Mar 23)*
```
With your actual URL:
```
https://youtu.be/XXXXXXXXXX
```

---

## PART E — Final Submission on StackUp

1. Go to: https://hackathon.stackup.dev/web/events/hedera-hello-future-apex-hackathon-2026
2. Click **Submit Project**
3. Fill in:

| Field | What to paste |
|-------|---------------|
| Project name | `Hedera Hydropower MRV` |
| Short description | *(copy the 100-word block from HACKATHON.md)* |
| Track | `Sustainability` |
| GitHub repo | `https://github.com/BikramBiswas786/https-github.com-BikramBiswas786-hedera-hydropower-mrv` |
| Demo video URL | `https://youtu.be/XXXXXXXXXX` |
| Live demo URL | `https://YOUR-VERCEL-URL.vercel.app` |
| Pitch deck | Upload PDF (export HACKATHON.md + README.md as PDF from browser) |

4. Click **Submit** — at least 1 hour before **23 March 2026, 11:59 PM ET**.

---

## PART F — Earn the $40 AMA Side Quest

1. Attend an AMA session (Feb 24–25, Mar 3, Mar 9, Mar 12)
2. Join with your **StackUp username** on ZEP
3. Submit a question via the AMA form (cut-off: 6 hours before session)
4. Consult at least one mentor during that session
5. Organizers verify and send $40 USDC

---

## Completion Tracker

| Task | Status |
|------|--------|
| `scripts/demo.js` created | ✅ Done |
| `api/index.js` Vercel endpoint | ✅ Done |
| `vercel.json` deployment config | ✅ Done |
| `IMPACT.md` (Success 20%) | ✅ Done |
| `VALIDATION.md` (Validation 15%) | ✅ Done |
| `HACKATHON.md` submission brief | ✅ Done |
| `README.md` full rewrite | ✅ Done |
| CI workflow `.github/workflows/test.yml` | ✅ Exists |
| GitHub Actions secrets | ⬜ You: 5 min (Part B above) |
| Vercel deployment | ⬜ You: browser open now (Part A above) |
| Demo video recorded + YouTube | ⬜ You: 30 min (Part C above) |
| HACKATHON.md updated with URLs | ⬜ You: after Parts A + C |
| StackUp submission submitted | ⬜ You: before Mar 23 11:59 PM ET |
| AMA side quest ($40) | ⬜ You: Feb 24–25 |
