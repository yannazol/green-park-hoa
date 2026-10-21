# Mobile UI rules (Green Park HOA, folder: mobile/)

- Stack: Expo SDK 57, Expo Router, TypeScript. Use the '@/...' import alias.
- Structure: routes in src/app are thin (re-export a screen). Screens go in src/screens/Resident/. Reusable components go in src/components/ (kebab-case file names).
- COLORS: only from src/constants/theme.ts through useAppTheme() (c.bg, c.bgCard, c.bgMuted, c.text, c.textSecondary, c.primary, c.onPrimary, c.brand, c.brandLight, c.textInverse, c.border, c.divider, c.success*/warning*/danger*/info*). Never hardcode hex colors. Use radius and spacing from theme.ts. Everything must work in light and dark mode.
- STYLES: never inside component or screen files. Each one gets src/styles/<name>-styles.ts exporting a default function getXStyles(c: AppColors) that returns StyleSheet.create({...}). Components only reference s.name. Pattern examples: src/components/button.tsx and src/styles/account-styles.ts.
- Reuse existing components: Button, Input, Badge, OptionPicker. Do not recreate them.
- No Inter font on mobile yet. Use the default font.
- Sample data: put it in src/constants/sample-data.ts, typed, with a "TODO: replace with API" comment. Only auth (useAuth) and concerns (/concerns/mine) have a real backend. Do not call APIs that don't exist.
- Scrollable screens use paddingBottom: BottomTabInset + 20 (from theme.ts). Touch targets at least 44px tall.
- ONLY create or edit the files the prompt lists. Never overwrite other screens or files.
- Do not run git commands. Do not run `npm run lint`. Check types with `npx tsc --noEmit`.
- When done, list the files created and changed.