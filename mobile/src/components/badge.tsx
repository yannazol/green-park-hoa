import { Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import getBadgeStyles from '@/styles/badge-styles';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

type Props = {
  label: string;
  variant?: BadgeVariant;
};

export default function Badge({ label, variant = 'neutral' }: Props) {
  const c = useAppTheme();
  const s = getBadgeStyles(c);

  const textStyle = {
    success: s.successText,
    warning: s.warningText,
    danger: s.dangerText,
    info: s.infoText,
    neutral: s.neutralText,
  }[variant];

  return (
    <View style={[s.base, s[variant]]}>
      <Text style={[s.text, textStyle]}>{label}</Text>
    </View>
  );
}