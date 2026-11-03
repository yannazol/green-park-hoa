import { useId, useState } from 'react';
import { useTheme } from '../context/useTheme';
import getInputStyles from '../styles/InputStyles';

export default function Input({
  label,
  error,
  helperText,
  type = 'text',
  id,
  disabled,
  onFocus,
  onBlur,
  rightElement,
  ...rest
}) {
  const { colors } = useTheme();
  const s = getInputStyles(colors);
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const inputId = id || generatedId;

  const inputStyle = {
    ...s.input,
    ...(error ? s.inputError : {}),
    ...(focused ? (error ? s.inputErrorFocused : s.inputFocused) : {}),
    ...(disabled ? s.inputDisabled : {}),
    ...(rightElement ? s.inputWithEndAdornment : {}),
  };

  return (
    <div style={s.field}>
      {label && (
        <label htmlFor={inputId} style={s.label}>
          {label}
        </label>
      )}
      <div style={s.inputWrapper}>
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          style={inputStyle}
          aria-invalid={error ? 'true' : undefined}
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
        {rightElement && <div style={s.endAdornment}>{rightElement}</div>}
      </div>
      {error ? (
        <span style={s.messageError}>{error}</span>
      ) : (
        helperText && <span style={s.message}>{helperText}</span>
      )}
    </div>
  );
}