# Web UI rules (Green Park HOA, folder: web/)

- Stack: React + Vite (JavaScript, not TypeScript), react-router-dom. The web portal is for roles "admin" and "staff" only. Residents use the mobile app.
- Structure: pages in src/pages/<Feature>/<Feature>.jsx, reusable components in src/components/ (PascalCase), layouts in src/layouts/, constants in src/constants/.
- COLORS: only from src/constants/theme.js through `const { colors } = useTheme()` (c.bg, c.bgCard, c.bgMuted, c.text, c.textSecondary, c.primary, c.onPrimary, c.sidebar, c.brand, c.brandLight, c.border, c.divider, c.success*/warning*/danger*/info*). Use radius, spacing, and fontFamily from theme.js. Never hardcode hex colors. Everything must work in light and dark mode.
- STYLES: never inside page or component files. Each one gets src/styles/<Name>Styles.js with a default export `getXStyles(c)` that returns plain style objects. The component calls `const s = getXStyles(colors)` and uses `s.name`. Hover and focus states are chosen in the component with state, as in Button.jsx. Pattern examples: src/pages/Concerns/Concerns.jsx and src/styles/ConcernsStyles.js.
- Reuse existing components: Button, Input, Card, Badge, Table. Do not recreate them.
- The backend includes authentication, concerns, residents, reservations, and announcements APIs. Use the existing API client and role-protected routes for these features; don't introduce sample data when a real endpoint exists.
- Do not install new packages. Charts, if any, are built with plain divs.
- Keep the working login, ProtectedRoute, and Concerns page behavior intact.
- Keep changes scoped to the user's requested feature. Cross-layer backend or mobile changes are appropriate when explicitly requested.
- Do not run git commands. After changes run `npm run lint` and `npm run build` inside web/ and fix errors in the files you changed.
- When done, list the files created and changed.