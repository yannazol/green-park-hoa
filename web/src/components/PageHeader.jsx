import { useTheme } from '../context/useTheme';
import getPageHeaderStyles from '../styles/PageHeaderStyles';

export default function PageHeader({ title, subtitle, action, style }) {
  const { colors } = useTheme();
  const s = getPageHeaderStyles(colors);

  return (
    <div style={{ ...s.container, ...style }}>
      <div style={s.textWrapper}>
        {title && <h1 style={s.title}>{title}</h1>}
        {subtitle && <p style={s.subtitle}>{subtitle}</p>}
      </div>
      {action && <div style={s.action}>{action}</div>}
    </div>
  );
}

