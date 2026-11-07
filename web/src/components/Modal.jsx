import { useEffect, useId, useRef, useState } from 'react';
import { useTheme } from '../context/useTheme';
import getModalStyles from '../styles/ModalStyles';

export default function Modal({ open, title, onClose, children }) {
  const { colors } = useTheme();
  const s = getModalStyles(colors);
  const [closeHovered, setCloseHovered] = useState(false);
  const [closeFocused, setCloseFocused] = useState(false);
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusable = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onCloseRef.current?.();
        return;
      }

      if (e.key === 'Tab') {
        const focusableNodes = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableNodes.length === 0) return;

        const firstNode = focusableNodes[0];
        const lastNode = focusableNodes[focusableNodes.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstNode) {
            e.preventDefault();
            lastNode.focus();
          }
        } else {
          if (document.activeElement === lastNode) {
            e.preventDefault();
            firstNode.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      style={s.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={s.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={s.header}>
            <h2 id={titleId} style={s.title}>
              {title}
            </h2>
            <button
              type="button"
              style={{
                ...s.closeButton,
                ...(closeHovered ? s.closeButtonHover : {}),
                ...(closeFocused ? s.closeButtonFocus : {}),
              }}
              onMouseEnter={() => setCloseHovered(true)}
              onMouseLeave={() => setCloseHovered(false)}
              onFocus={() => setCloseFocused(true)}
              onBlur={() => setCloseFocused(false)}
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        )}
        <div style={s.body}>{children}</div>
      </div>
    </div>
  );
}
