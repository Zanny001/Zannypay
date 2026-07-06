# Zannypay — A PalmPay-style Mobile Wallet (Demo/MVP)

A polished, fully working React Native (Expo) fintech app UI: wallet balance, bank transfers,
bill/airtime payments, transaction history, PIN login, and onboarding — all running on local
mock data via AsyncStorage. Zero cost to run. No backend required to try it out.

## ⚠️ Important: what this is and isn't

This is a **demo/MVP shell**, not a live money-moving app. It does not touch real bank rails.
"Sending money" and "funding wallet" simply update numbers stored on your device. This is
intentional and is the same pattern every real fintech starts with before integrating a
licensed payment processor.

To go from this to a real, legal product you would need, in rough order:

1. **A business entity** and, depending on your country, a money-transmitter/e-money license
   (or partner with someone who already holds one — this is how most fintech apps launch).
2. **A licensed payment gateway** as your rails — e.g. Paystack or Flutterwave (Nigeria/Africa),
   Stripe (US/EU). They handle card processing, bank transfers, and compliance; you integrate
   their SDK/API. Both offer free sandbox/test-mode accounts.
3. **KYC/AML** — identity verification (BVN/NIN checks in Nigeria, or ID verification services
   elsewhere) before letting users hold/move real balances.
4. **A real backend** — Supabase or Firebase (both have generous free tiers) to replace
   AsyncStorage: real user accounts, server-side balance checks (never trust the client with
   real money logic), and audit logs.
5. **Security hardening** — encrypted PIN storage (not plaintext as in this demo), rate-limiting,
   fraud monitoring, and a security audit before handling real funds.

Nothing here blocks you from launching a real product — it's just the standard path every
fintech takes. This repo gets you the entire front-end and UX polish for free, so your energy
and eventual budget go toward the compliance/backend pieces above.

## Tech stack (all free tiers)

- **Expo (React Native)** — cross-platform, no Mac needed, works great in Snack or on-device
  via Expo Go.
- **React Navigation** — stack + bottom tabs.
- **AsyncStorage** — local persistence (swap for Supabase/Firebase later).
- **expo-linear-gradient**, **@expo/vector-icons** — the visual polish.

## Running it — 3 ways, all free

### Option A: Expo Snack (fastest, zero install)
1. Go to https://snack.expo.dev
2. Create a new Snack, then delete its default files.
3. Recreate this folder structure inside Snack (upload each file's content — Snack supports
   multi-file projects and folders).
4. Add the dependencies listed in `package.json` via Snack's "Add dependency" search (it will
   auto-detect most from your imports).
5. Preview live on the Snack web player, or scan the QR with the **Expo Go** app on your phone.

### Option B: On your device via Userland + Expo Go (recommended for you)
1. Inside Userland (Ubuntu), install Node.js (v18+) and npm.
2. `npm install -g expo-cli` (or just use `npx expo`).
3. Copy this whole `zannypay` folder into your Userland filesystem.
4. `cd zannypay && npm install`
5. `npx expo start --tunnel` (tunnel mode works well from Userland since it avoids local
   network/firewall issues).
6. Install **Expo Go** from the Play Store on the same phone, scan the QR code shown in the
   terminal.

### Option C: Full local dev later (when you get a machine with more resources)
Same as Option B minus `--tunnel` — use `--lan` or plain `npx expo start` on the same Wi-Fi.

## Project structure

```
zannypay/
├── App.js                       # entry point
├── app.json                     # Expo config
├── package.json
├── src/
│   ├── context/WalletContext.js # all wallet/auth logic — swap AsyncStorage calls for API calls here
│   ├── navigation/AppNavigator.js
│   ├── screens/
│   │   ├── SplashScreen.js
│   │   ├── OnboardingScreen.js
│   │   ├── SignupScreen.js
│   │   ├── LoginScreen.js       # PIN pad
│   │   ├── DashboardScreen.js   # home/wallet
│   │   ├── TransferScreen.js
│   │   ├── BillsScreen.js       # airtime, data, electricity, TV, water, internet
│   │   ├── HistoryScreen.js
│   │   └── ProfileScreen.js
│   ├── components/              # Card, GradientButton, TransactionRow
│   ├── theme/colors.js          # single source of truth for brand colors
│   └── utils/                   # formatting + storage helpers
```

## What to change first when you're ready to go live

1. In `WalletContext.js`, replace the `saveJSON`/`loadJSON` calls with real API calls to your
   backend (Supabase/Firebase functions or your own Node server).
2. Replace the plaintext PIN check in `login()` with a server-side hashed-PIN or OTP check.
3. Wire `transferMoney` and `payBill` to your payment gateway's transfer/bills API instead of
   just subtracting from local state.
4. Add a real KYC step to `SignupScreen.js` before activating a wallet.

## Branding note

This is intentionally **not** branded as "PalmPay" (name/logo) to avoid trademark issues —
it's called "Zannypay" as a placeholder. Swap in your own name, logo, and color palette in
`src/theme/colors.js` and `app.json`.
