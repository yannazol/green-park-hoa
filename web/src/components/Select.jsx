import { useId, useState } from 'react';
import { useTheme } from '../context/useTheme';
import getSelectStyles from '../styles/SelectStyles';

export default function Select({
  label,
  error,
  helperText,
  options = [],
  id,
  disabled,
  onFocus,
  onBlur,
  style,
  ...rest
}) {
  const { colors } = useTheme();
  const s = getSelectStyles(colors);
  const [focused, setFocused] = useState(false);
  const generatedId = useId();
  const selectId = id || generatedId;

  const selectStyle = {
    ...s.select,
    ...(error ? s.selectError : {}),
    ...(focused ? (error ? s.selectErrorFocused : s.selectFocused) : {}),
    ...(disabled ? s.selectDisabled : {}),
    ...style,
  };

  return (
    <div style={s.field}>
      {label && (
        <label htmlFor={selectId} style={s.label}>
          {label}
        </label>
      )}
      <div style={s.selectWrapper}>
        <select
          id={selectId}
          disabled={disabled}
          style={selectStyle}
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
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} style={s.option}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <span style={s.messageError}>{error}</span>
      ) : (
        helperText && <span style={s.message}>{helperText}</span>
      )}
    </div>
  );
}

