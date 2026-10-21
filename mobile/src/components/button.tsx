import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import getButtonStyles from '@/styles/button-styles';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  ...rest
}: Props) {
  const c = useAppTheme();
  const s = getButtonStyles(c);
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const textStyle = isPrimary ? s.primaryText : s.outlineText;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        s.base,
        isPrimary
          ? pressed
            ? s.primaryPressed
            : s.primary
          : pressed
            ? s.outlinePressed
            : s.outline,
        fullWidth && s.full,
        isDisabled && s.disabled,
        style,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={textStyle.color} />
      ) : (
        <Text style={[s.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}