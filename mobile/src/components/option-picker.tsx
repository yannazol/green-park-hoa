import { Pressable, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import getOptionPickerStyles from '@/styles/option-picker-styles';

type Props<T extends string> = {
  label?: string;
  options: readonly { value: T; label: string }[];
  value: T | '';
  onChange: (value: T) => void;
};

export default function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const c = useAppTheme();
  const s = getOptionPickerStyles(c);

  return (
    <View style={s.field}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <View style={s.wrap}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(option.value)}
              style={[s.chip, selected && s.chipSelected]}>
              <Text style={[s.chipText, selected && s.chipTextSelected]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
