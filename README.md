# TaskMaster

Task tracker for field technicians: plan daily work, attach photos and documents, pin jobs on a map, get reminded before a job is due, and keep working with no signal — changes sync as soon as the connection is back.

Built for places where mobile coverage is unreliable, so the app is offline-first rather than offline-tolerant.

## Stack

|        |                                                                                                                 |
| ------ | --------------------------------------------------------------------------------------------------------------- |
| Mobile | Expo SDK 57 (React Native 0.86), TypeScript, expo-router                                                        |
| State  | zustand + AsyncStorage (offline-first, persisted)                                                               |
| Native | react-native-maps, expo-notifications, expo-location, expo-image-picker, expo-document-picker, expo-file-system |
| API    | NestJS 12, Drizzle ORM, Turso (libSQL)                                                                          |
| Shared | one TypeScript package of types and zod schemas used by both sides                                              |
| Tests  | jest-expo for the app's pure logic                                                                              |

UI is plain React Native components and `StyleSheet` — no UI library, just a small set of reusable themed components.

## Layout

```
apps/mobile      Expo app
apps/api         NestJS API (in progress)
packages/shared  types and schemas shared by both
```

## Running it

```bash
npm install
cp apps/mobile/.env.example apps/mobile/.env
npm run mobile
```

The app needs a development build rather than Expo Go, because `expo-notifications` cannot run inside Expo Go on Android:

```bash
cd apps/mobile
npx eas-cli build -p android --profile development
```

Put a Google Maps Android key in `apps/mobile/.env` for the map to render in a real build.

```bash
npm run typecheck
npm test
```
