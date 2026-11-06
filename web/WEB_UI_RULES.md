# Web UI rules (Green Park HOA, folder: web/)

- Stack: React + Vite (JavaScript, not TypeScript), react-router-dom. The web portal is for roles "admin" and "staff" only. Residents use the mobile app.
- Structure: pages in src/pages/<Feature>/<Feature>.jsx, reusable components in src/components/ (PascalCase), layouts in src/layouts/, constants in src/constants/.
- COLORS: only from src/constants/theme.js through `const { colors } = useTheme()` (c.bg, c.bgCard, c.bgMuted, c.text, c.textSecondary, c.primary, c.onPrimary, c.sidebar, c.brand, c.brandLight, c.border, c.divider, c.success*/warning*/danger*/info*). Use radius, spacing, and fontFamily from theme.js. Never hardcode hex colors. Everything must work in light and dark mode.
- STYLES: never inside page or component files. Each one gets src/styles/<Name>Styles.js with a default export `getXStyles(c)` that returns plain style objects. The component calls `const s = getXStyles(colors)` and uses `s.name`. Hover and focus states are chosen in the component with state, as in Button.jsx. Pattern examples: src/pages/Concerns/Concerns.jsx and src/styles/ConcernsStyles.js.
- Reuse existing components: Button, Input, Card, Badge, Table. Do not recreate them.
- Real backend exists only for auth (/auth/*) and concerns (/concerns). Everything else is UI only with typed-like sample data in src/constants/sample-data.js and a "TODO: replace with API" comment. Do not call APIs that don't exist.
- Do not install new packages. Charts, if any, are built with plain divs.
- Keep the working login, ProtectedRoute, and Concerns page behavior intact.
- ONLY create or edit the files the prompt lists. Never touch server/ or mobile/.
- Do not run git commands. After changes run `npm run lint` and `npm run build` inside web/ and fix errors in the files you changed.
- When done, list the files created and changed.