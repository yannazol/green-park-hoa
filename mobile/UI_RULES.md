# Mobile UI rules (Green Park HOA, folder: mobile/)

- Stack: Expo SDK 58, Expo Router, React Native, TypeScript. Use the '@/...' import alias.
- Structure: routes in src/app are thin (re-export a screen). Screens go in src/screens/Resident/. Reusable components go in src/components/ (kebab-case file names).
- COLORS: only from src/constants/theme.ts through useAppTheme() (c.bg, c.bgCard, c.bgMuted, c.text, c.textSecondary, c.primary, c.onPrimary, c.brand, c.brandLight, c.textInverse, c.border, c.divider, c.success*/warning*/danger*/info*). Never hardcode hex colors. Use radius and spacing from theme.ts. Everything must work in light and dark mode.
- STYLES: never inside component or screen files. Each one gets src/styles/<name>-styles.ts exporting a default function getXStyles(c: AppColors) that returns StyleSheet.create({...}). Components only reference s.name. Pattern examples: src/components/button.tsx and src/styles/account-styles.ts.
- Reuse existing components: Button, Input, Badge, OptionPicker. Do not recreate them.
- No Inter font on mobile yet. Use the default font.
- Use the authenticated API client in src/services/api.ts. Resident data, concerns, dues, payment submissions, reservations, notifications, community services, and announcements are backed by the Node/Express API; do not introduce mock resident records.
- Image uploads must use Expo ImagePicker, enforce the existing per-feature file limits on-device, and rely on server-side validation as the security boundary.
- Scrollable screens use paddingBottom: BottomTabInset + 20 (from theme.ts). Touch targets at least 44px tall.
- Keep all five resident tabs (Home, Concerns, Payments, Reservations, Profile), and ensure selected-tab indicators do not obscure icons.
- Do not add a custom splash screen or remove Expo's development/debugging tools.
- Run `npx tsc --noEmit` and `npx expo lint` after mobile changes.
- When done, list the files created and changed.