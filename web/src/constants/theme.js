// Brand palette: navy (primary), forest (brand accent), taupe, beige, ivory (page bg)
const lightColors = {
  bg: '#FAF7EF',
  bgSecondary: '#F3EDE0',
  bgCard: '#FFFFFF',
  bgElevated: '#FFFFFF',
  bgMuted: '#E8DCC6',
  bgAccent: '#EAF0EB',
  bgOverlay: 'rgba(30,42,68,0.45)',

  text: '#1E2A44',
  textSecondary: '#5B6478',
  textMuted: '#8A8FA0',
  textInverse: '#FFFFFF',

  border: '#DED4C1',
  borderLight: '#EDE6D6',
  borderStrong: '#B7A78F',
  divider: '#EDE6D6',

  primary: '#1E2A44',
  primaryHover: '#2A3A5C',
  onPrimary: '#FFFFFF',
  sidebar: '#1E2A44',

  brand: '#4E6B55',
  brandLight: '#EAF0EB',
  brandBorder: '#C5D4C8',

  danger: '#B4443C',
  dangerBg: '#FBEDEC',
  dangerBorder: '#E8B4B0',
  dangerText: '#9A332B',

  success: '#4E6B55',
  successBg: '#E8F0E9',
  successBorder: '#A9C2AE',
  successText: '#3B5742',

  warning: '#B7791F',
  warningBg: '#FBF1DC',
  warningBorder: '#E3C27A',
  warningText: '#8A5A12',

  info: '#3B5B8C',
  infoBg: '#E8EEF6',
  infoBorder: '#A9BDD9',
  infoText: '#2F4A73',

  shadow: '#1E2A44',
};

const darkColors = {
  bg: '#121826',
  bgSecondary: '#182033',
  bgCard: '#1E2A44',
  bgElevated: '#243252',
  bgMuted: '#243252',
  bgAccent: '#1F3027',
  bgOverlay: 'rgba(0,0,0,0.65)',

  text: '#FAF7EF',
  textSecondary: '#C9C3B5',
  textMuted: '#8E93A3',
  textInverse: '#1E2A44',

  border: '#2E3B5A',
  borderLight: '#243252',
  borderStrong: '#4A5878',
  divider: '#2E3B5A',

  primary: '#E8DCC6',
  primaryHover: '#F1E8D6',
  onPrimary: '#1E2A44',
  sidebar: '#182033',

  brand: '#7FA188',
  brandLight: '#1F3027',
  brandBorder: '#3A5543',

  danger: '#E0736B',
  dangerBg: '#3A1F1F',
  dangerBorder: '#6B3030',
  dangerText: '#F0A09A',

  success: '#7FA188',
  successBg: '#1F3027',
  successBorder: '#3A5543',
  successText: '#A9C9B1',

  warning: '#E0B04F',
  warningBg: '#33281A',
  warningBorder: '#7A5A1E',
  warningText: '#F0CB80',

  info: '#7FA3D6',
  infoBg: '#1A2840',
  infoBorder: '#34507A',
  infoText: '#A9C3E8',

  shadow: '#000000',
};

export const radius = { sm: 8, md: 12, lg: 16 };
export const spacing = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32 };
export const shadow = { sm: '0 1px 2px rgba(30, 42, 68, 0.06)' };
export const fontFamily = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

// mode: 'light' | 'dark' | 'system'
export function getThemeColors(mode, systemScheme) {
  if (mode === 'system') {
    return systemScheme === 'dark' ? darkColors : lightColors;
  }
  return mode === 'dark' ? darkColors : lightColors;
}

export { lightColors, darkColors };

