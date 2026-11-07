import { Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useAppTheme } from '@/hooks/use-app-theme';
import getModalCloseButtonStyles from '@/styles/modal-close-button-styles';

type Props = {
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function ModalCloseButton({ accessibilityLabel, onPress, disabled = false }: Props) {
  const c = useAppTheme();
  const s = getModalCloseButtonStyles(c);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.button, pressed && s.pressed, disabled && s.disabled]}>
      <SymbolView
        name={{ ios: 'xmark', android: 'close', web: 'close' }}
        size={20}
        tintColor={c.text}
      />
    </Pressable>
  );
}
