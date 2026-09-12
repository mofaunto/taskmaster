# TaskMaster

A task tracker for field technicians: create and plan daily work, attach photos and documents, pin jobs on a map, get reminded before a job is due, and keep working offline — everything syncs with a mock REST server once the network is back.

**Candidate code: `SA-RN-1511`**

**APK download:** https://drive.google.com/file/d/1FsKVwD688b_rOe6AJqTSVgzkxpHZrh4S/view?usp=sharing

## Features

- **Tasks** — title, description, due date & time, address, optional map pin, attachments, status (New / In Progress / Completed / Cancelled). Required fields are validated with inline messages; a task can't be saved incomplete or with a due date in the past.
- **List** — sort by date added, due date or status; search by title; filter by status; overdue tasks are highlighted; clear empty states.
- **Detail** — everything about a task, status actions (Start / Complete / Cancel / Reopen), edit, delete with confirmation, and the task's own history.
- **Attachments** — camera, gallery, or any file (PDF etc.). Files are copied into the app's storage so they survive restarts; a file that has gone missing shows as "unavailable" instead of breaking the screen. Tap to open with another app.
- **Reminders** — a local notification 30 minutes before the due time (see [Notifications](#notifications) for the short-notice fallback). _Demo mode_ in Settings fires the same notification 30 seconds after saving, for the video.
- **Map** — every task with a pin appears as a marker coloured by status; the callout opens the task. Picking a location lets you tap a place or any point, use your GPS position, and auto-fills the address (reverse geocoding, no API key).
- **History** — creation, edits, status changes, attachment changes, deletions and sync runs, each with a timestamp, grouped by day. Persists across restarts.
- **Offline & sync** — everything works offline. Changes are pushed to json-server when the connection returns (or via _Sync now_), with a per-task status: _Pending sync_, _Synced_, _Sync failed_. Last-write-wins conflict resolution.
- **Light / dark theme** — System / Light / Dark toggle in Settings.
- Unit tests for validation, sorting, filtering, the reminder rule, etc.

## Tech stack

| Choice                                                                               | Why                                                                                                                                                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expo SDK 57** (React Native 0.86), **TypeScript**                                  | Expo gives the native modules (notifications, maps, pickers, file system) with config plugins and a cloud build, so there is no Android toolchain to set up locally. |
| **expo-router**                                                                      | File-based navigation: four tabs plus a stack for the task screens.                                                                                                  |
| **zustand 5** + `persist`                                                            | Small, no boilerplate, and its persist middleware gives local storage almost for free. Three stores: tasks, history, settings.                                       |
| **AsyncStorage**                                                                     | Simple key-value storage, it is enough for a few hundred tasks and log entries. I would use SQLite if the requirements were more extensive, requiring advanced DB    |
| **react-native-maps**                                                                | Standard map component, uses Google Maps on Android.                                                                                                                 |
| **expo-notifications**                                                               | Local scheduled notifications.                                                                                                                                       |
| **expo-file-system / image-picker / document-picker / sharing / location / network** | The Expo modules for each native capability.                                                                                                                         |
| **json-server 0.17**                                                                 | Zero-config mock REST API                                                                                                                                            |
| Plain React Native components + `StyleSheet`                                         | No UI library. A small set of reusable components (`Button`, `TextField`, `Section`, badges, …) themed through one `colors` object.                                  |
| **jest-expo**                                                                        | Tests for the pure logic in `src/utils`.                                                                                                                             |

## Getting started

### Prerequisites

- Node 20+ and npm
- An Android phone, or an emulator
- An [Expo account](https://expo.dev) for building the app (free)
- A Google Maps API key for Android (Google Cloud Console → _Maps SDK for Android_). Only needed for a real build; free.

### 1. Install

```bash
git clone <repo-url>
cd <repo-folder>
npm install
cp .env.example .env
```

Edit `.env`:

```
GOOGLE_MAPS_API_KEY=your-android-maps-key
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-ip>:3000
```

### 2. Run the mock server

```bash
npm run server
```

This starts json-server on `0.0.0.0:3000` with `server/db.json`. Use your computer's **LAN IP** in the app, not `localhost` — the phone has to reach your computer over Wi-Fi. Find it with `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows). Both devices must be on the same network, and a VPN on the computer can block the connection.

Endpoints: `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id`.

### 3. Run the app

The app **does not run in Expo Go**: `expo-notifications` 57 throws on import inside Expo Go on Android (push notification support was removed from Expo Go in SDK 53). Use a development build instead:

```bash
npx eas-cli login
npx eas-cli build -p android --profile development
```

Install the resulting APK on the phone, then:

```bash
npx expo start
```

Open the **TaskMaster** app on the phone and connect to the Metro server (same Wi-Fi). Hot reload works as usual. A new development build is only needed when native dependencies or `app.config.ts` change.

### 4. Tests and type-check

```bash
npm test
npm run typecheck
```

## Building the APK

```bash
npx eas-cli build -p android --profile preview
```

EAS Build produces an installable APK and prints a download link. The Google Maps key is read from `.env` at build time (`.easignore` keeps `.env` in the upload; it is never committed).

Two things about the release build worth knowing:

- Because the mock server is plain `http://`, the app enables `usesCleartextTraffic` on Android through `expo-build-properties` (see `app.config.ts`). Release builds block cleartext requests otherwise, which would make sync fail on Android 9+.
- The `preview` profile uses the same package id as the development build, so installing it replaces the development build on the phone.

## Project structure

```
src/
  app/                 expo-router screens
    (tabs)/            Tasks, Map, History, Settings
    task/new.tsx       create form
    task/[id]/         detail and edit
  components/          reusable UI (TaskForm, TaskCard, AttachmentList, LocationPicker, …)
  store/               zustand stores: taskStore, historyStore, settingsStore
  storage/             the single AsyncStorage adapter used by the stores
  services/            side effects: api, sync, notifications, attachments, location
  hooks/               useTheme, useNetworkSync
  utils/               pure functions (validation, sorting, merge, reminder rule, …) + tests
  types/               Task, Attachment, HistoryEntry, …
  constants/           colors, status labels, app constants (candidate code, reminder timings)
server/db.json         json-server data with sample tasks
```

Screens only talk to stores and services. Stores own the data and the history log; services own the native APIs and the network.

## Architecture

### State and storage

Three zustand stores, each persisted to AsyncStorage through `src/storage/appStorage.ts`:

- `taskStore` — the tasks plus `deletedIds` (deletions waiting to be sent to the server). Every action (`addTask`, `updateTask`, `setStatus`, `deleteTask`, `addAttachment`, `removeAttachment`) writes a history entry, bumps `updatedAt`, marks the task `pending`, and keeps the task's reminder in sync.
- `historyStore` — the log, newest first, capped at 200 entries.
- `settingsStore` — theme, demo mode, server URL, last sync time.

The app waits for the stores to load before showing the UI (the splash screen stays up), so there is no flash of empty data or wrong theme.

### Sync

`src/services/sync.ts`, triggered on app start, whenever `expo-network` reports the connection coming back, and by the _Sync now_ buttons:

1. `GET /tasks` from the server.
2. Merge with the local tasks (`src/utils/mergeTasks.ts`, **last-write-wins by `updatedAt`**): the newer copy of a task wins, a tie keeps the local one, server-only tasks are added, tasks deleted on the device are skipped.
3. Push every task the device won that is still `pending` or `failed` — `POST` if the server doesn't have the id yet, `PUT` otherwise.
4. Send a `DELETE` for each queued deletion (a 404 counts as done).
5. Store the result: each task becomes `synced` or `failed`; one summary line is written to History ("Synced: 2 sent, 1 received" or "Sync failed: …").

If the server can't be reached at all, pending tasks are marked _Sync failed_ so the problem is visible on the list; they are retried on the next sync. The device-only fields (`syncStatus`, `notificationId`) are never sent to the server.

### Notifications

`src/services/notifications.ts` schedules one local notification per open task, on an Android channel with high importance. The timing rule lives in `src/utils/reminderDelay.ts` and is unit-tested:

- normally the reminder fires **30 minutes before** the due time;
- if the due time is **less than 30 minutes away** (or the reminder moment is within the next minute), the reminder is scheduled **60 seconds from now** instead, and the form shows a note saying so — the task is still saved;
- a task that is already due gets no reminder (the form doesn't allow a past due date on creation anyway);
- **Demo mode** (Settings) fires the reminder **30 seconds after saving**, regardless of the due time, so the flow can be shown without waiting.

Reminders are re-scheduled when a task's due date or status changes, cancelled when it is completed, cancelled or deleted, and updated when a newer version arrives from the server. Tapping a notification opens the task. Permission is requested the first time a task is saved; if it is refused the task is still saved and an alert explains that reminders are off. Settings shows the permission state with an _Enable_ button.

### Map and location

`react-native-maps` (Google Maps on Android; the key comes from `.env` through the `react-native-maps` config plugin in `app.config.ts`). The Map tab shows a marker for every task that has a pin, coloured by status; the callout opens the task. The location picker (`src/components/LocationPicker.tsx`) is a full-screen modal: tap a place or any point, drag the pin, or use the device position (`expo-location`). When a pin is confirmed, the address field is filled with the place name and/or the reverse-geocoded street address — Android's built-in geocoder, no key required. The address remains a plain text field and can always be typed by hand.

### Attachments

`src/services/attachments.ts` wraps `expo-image-picker` (camera, gallery) and `expo-document-picker` (any file). Every picked file is copied into `<documents>/attachments/` because the pickers return cache paths the OS may delete. The task stores metadata only (`id`, `uri`, `name`, `mimeType`, `size`, `kind`). Before rendering, the file's existence is checked, so a missing file shows an "unavailable" placeholder. Removing an attachment or deleting a task also deletes the files.

### Theme

`useTheme()` combines the setting (System / Light / Dark) with the phone's scheme and returns one of two `colors` objects from `src/constants/theme.ts`. The navigation header and tab bar are themed through expo-router's `ThemeProvider` with the same colours.

## Known limitations and trade-offs

- **Conflicts are last-write-wins.** If the same task is edited on two devices while offline, the later `updatedAt` wins and the other edit is lost. Good enough for a mock backend; a real one would need versions or per-field merging.
- **Deletions only travel from the phone to the server.** A task removed from `db.json` is not removed from the phone. This is deliberate: it makes restarting json-server with a fresh `db.json` safe instead of silently wiping the phone's tasks.
- **Attachment files stay on the device.** Only their metadata goes to the server, so an attachment added on one phone shows as "unavailable" on another.
- **Expo Go is not supported** (see above); a development build is required.
- **The address is free text.** Reverse geocoding fills it in, but nothing validates that the text matches the pin.
- **History is capped at 200 entries** to keep storage small.
- no IOS.

## AI / tooling disclosure

I used Claude Code as an assistant, especially for translating my Web React skills into native mobile counterparts. I also used the plan mode for module breakdowns,generating first drafts of components and services and checking libraries to achieve the goal of the assignment. All design decisions (state management, sync strategy, storage, notification rules) were made by me, and I reviewed, adjusted and committed every change myself.

---

Candidate code: **SA-RN-1511**
