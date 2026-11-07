# Green Park Village HOA Resident App

The resident app is built with Expo SDK 58, Expo Router, and React Native. It
connects to the same Express/MongoDB API used by the HOA admin website.

## Run locally

1. Install the locked dependencies with `npm ci`.
2. Set `EXPO_PUBLIC_API_URL` to the server's `/api` base URL in the local mobile
   environment. Use the machine's LAN address when testing on a physical phone.
3. Start the app with `npx expo start`.

The Expo ImagePicker permission allows residents to attach concern photos and
receipts, and to add a profile photo. The server validates uploaded content and
size before storing it in MongoDB.

## Resident features

- **Home:** Published community announcements with likes, comments, photos, and
  notification access.
- **Concerns:** Resident submissions with photos, status history, and HOA notes.
- **Payments:** Actual dues balances and history; submitted payments remain
  pending until an administrator verifies them.
- **Reservations:** Facility requests using admin-configured operating hours,
  available hourly slots, and the server's booking conflict checks.
- **Profile:** Resident details and a securely scoped profile photo.

Announcements, facility photos, and profile photos are served from the shared
MongoDB-backed API. Admins moderate announcement comments and configure facility
photos and booking hours in the admin website.

## Checks

From `mobile/`, run:

```sh
npx tsc --noEmit
npx expo lint
npx expo-doctor
```
