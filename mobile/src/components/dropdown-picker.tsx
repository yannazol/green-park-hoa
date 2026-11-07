import { Pressable, ScrollView, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { useAppTheme } from '@/hooks/use-app-theme';
import getDropdownPickerStyles from '@/styles/dropdown-picker-styles';

type Props<T extends string> = {
  label: string;
  placeholder: string;
  options: readonly { value: T; label: string }[];
  value: T | '';
  onChange: (value: T) => void;
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
};

export default function DropdownPicker<T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
  expanded,
  onToggle,
}: Props<T>) {
  const c = useAppTheme();
  const s = getDropdownPickerStyles(c);
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <View style={[s.field, expanded && s.fieldExpanded]}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selectedLabel ?? placeholder}`}
        accessibilityState={{ expanded }}
        onPress={() => onToggle(!expanded)}
        style={s.control}>
        <Text style={[s.value, !selectedLabel && s.placeholder]}>
          {selectedLabel ?? placeholder}
        </Text>
        <SymbolView
          name={{ ios: expanded ? 'chevron.up' : 'chevron.down', android: expanded ? 'expand_less' : 'expand_more', web: expanded ? 'expand_less' : 'expand_more' }}
          size={18}
          tintColor={c.textSecondary}
        />
      </Pressable>
      {expanded ? (
        <ScrollView style={s.options} nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: option.value === value }}
              onPress={() => {
                onChange(option.value);
                onToggle(false);
              }}
              style={[s.option, option.value === value && s.optionSelected]}>
              <Text style={[s.optionText, option.value === value && s.optionTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
