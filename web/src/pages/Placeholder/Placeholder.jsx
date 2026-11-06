import { useTheme } from '../../context/useTheme';
import getPlaceholderStyles from '../../styles/PlaceholderStyles';

export default function Placeholder({ title }) {
  const { colors } = useTheme();
  const s = getPlaceholderStyles(colors);

  return (
    <div style={s.container}>
      <h1 style={s.title}>{title}</h1>
    </div>
  );
}

