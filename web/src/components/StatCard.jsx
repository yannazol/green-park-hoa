import { useTheme } from '../context/useTheme';
import getStatCardStyles from '../styles/StatCardStyles';

export default function StatCard({
  label,
  value,
  hint,
  variant = 'neutral',
  style,
}) {
  const { colors } = useTheme();
  const s = getStatCardStyles(colors);
  const accent = s.accents[variant] || s.accents.neutral;

  return (
    <div style={{ ...s.card, ...style }}>
      <div style={{ ...s.accentBar, backgroundColor: accent }} />
      {label && <span style={s.label}>{label}</span>}
      <div style={s.valueRow}>
        <span style={s.value}>{value}</span>
      </div>
      {hint && <span style={s.hint}>{hint}</span>}
    </div>
  );
}

