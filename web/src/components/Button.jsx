import { useState } from 'react';
import { useTheme } from '../context/useTheme';
import getButtonStyles from '../styles/ButtonStyles.js';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  style,
  ...rest
}) {
  const { colors } = useTheme();
  const s = getButtonStyles(colors);
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || loading;

  const buttonStyle = {
    ...s.base,
    ...s.sizes[size],
    ...s.variants[variant],
    ...(hovered && !isDisabled ? s.hover[variant] : {}),
    ...(fullWidth ? s.full : {}),
    ...(isDisabled ? s.disabled : {}),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      style={buttonStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...rest}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}