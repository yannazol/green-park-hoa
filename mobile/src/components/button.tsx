import {
  ActivityIndicator,
  Pressable,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useAppTheme } from '@/hooks/use-app-theme';
import getButtonStyles from '@/styles/button-styles';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  title: string;
  variant?: 'primary' | 'outline' | 'brandOutline' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: SymbolViewProps['name'];
  iconSize?: number;
  iconColor?: string;
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconSize = 17,
  iconColor,
  style,
  ...rest
}: Props) {
  const c = useAppTheme();
  const s = getButtonStyles(c);
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';
  const isBrandOutline = variant === 'brandOutline';
  const isGhost = variant === 'ghost';
  const textStyle = isPrimary
    ? s.primaryText
    : isBrandOutline
      ? s.brandOutlineText
      : isGhost
        ? s.ghostText
        : s.outlineText;

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
          : isBrandOutline
            ? pressed
              ? s.brandOutlinePressed
              : s.brandOutline
            : isGhost
              ? pressed
                ? s.ghostPressed
                : s.ghost
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
        <>
          {icon ? <SymbolView name={icon} size={iconSize} tintColor={iconColor ?? textStyle.color} /> : null}
          <Text style={[s.text, textStyle]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}