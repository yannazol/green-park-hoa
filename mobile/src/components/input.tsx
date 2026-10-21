import { useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import getInputStyles from '@/styles/input-styles';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export default function Input({ label, error, helperText, onFocus, onBlur, style, ...rest }: Props) {
  const c = useAppTheme();
  const s = getInputStyles(c);
  const [focused, setFocused] = useState(false);

  const inputStateStyle = error ? s.inputError : focused ? s.inputFocused : undefined;

  return (
    <View style={s.field}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={s.placeholder.color}
        style={[s.input, inputStateStyle, style]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <Text style={[s.message, s.messageError]}>{error}</Text>
      ) : helperText ? (
        <Text style={[s.message, s.helperText]}>{helperText}</Text>
      ) : null}
    </View>
  );
}