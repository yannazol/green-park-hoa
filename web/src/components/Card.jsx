import { useTheme } from '../context/useTheme';
import getCardStyles from '../styles/CardStyles';

export default function Card({
  title,
  subtitle,
  action,
  noPadding = false,
  children,
  style,
}) {
  const { colors } = useTheme();
  const s = getCardStyles(colors);
  const hasHeader = title || action;

  return (
    <div style={{ ...s.card, ...style }}>
      {hasHeader && (
        <div style={s.header}>
          <div>
            {title && <h3 style={s.title}>{title}</h3>}
            {subtitle && <p style={s.subtitle}>{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div style={{ ...s.body, ...(noPadding ? s.bodyNoPadding : {}) }}>{children}</div>
    </div>
  );
}