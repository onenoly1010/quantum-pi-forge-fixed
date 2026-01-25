Quantum Pi Forge — Mobile Preview (Expo + SDK 55)

This folder contains a minimal draft mobile app to preview Pi SDK integration.

How to use (draft):
1. Install dependencies (if developing mobile):
   - `npm install` at repo root
   - `npx expo install expo-status-bar expo-haptics react-native-gesture-handler` (as needed)
2. Run in Expo (if you scaffold an app): `npx expo start`

Notes:
- `mobile/hooks/pi-sdk.ts` provides lightweight mock hooks for local development. Replace with the real Pi SDK hooks (`usePiConnection`, `usePiPurchase`) once you add the SDK.
- `App.tsx` demonstrates QueryClientProvider, Zustand store usage, and a small `PiConnect` demo component.
- This is a draft — adapt routes and navigation to Expo Router v4 when ready.

If you want, I can scaffold a full Expo app in `mobile/` with `package.json`, `app.json`, and dev scripts. Say if you want me to scaffold now.