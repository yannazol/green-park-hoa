import { useTheme } from '../context/useTheme';
import getBadgeStyles from '../styles/BadgeStyles';

export default function Badge({ children, variant = 'neutral', style }) {
  const { colors } = useTheme();
  const s = getBadgeStyles(colors);

  return (
    <span style={{ ...s.base, ...s.variants[variant], ...style }}>
      {children}
    </span>
  );
}