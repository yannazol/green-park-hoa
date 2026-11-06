import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/useTheme';
import getSlidePanelStyles from '../styles/SlidePanelStyles';

export default function SlidePanel({ open, title, subtitle, onClose, footer, children }) {
  const { colors } = useTheme();
  const s = getSlidePanelStyles(colors);
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [closeHovered, setCloseHovered] = useState(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    panelRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  return (
    <>
      <div
        style={{ ...s.backdrop, ...(open ? s.backdropOpen : {}) }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        style={{ ...s.panel, ...(open ? s.panelOpen : {}) }}
      >
        <div style={s.header}>
          <div style={s.headerText}>
            <h2 style={s.title}>{title}</h2>
            {subtitle && <p style={s.subtitle}>{subtitle}</p>}
          </div>
          <button
            type="button"
            style={{ ...s.closeButton, ...(closeHovered ? s.closeButtonHover : {}) }}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            onClick={onClose}
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>
        <div style={s.body}>{children}</div>
        {footer && <div style={s.footer}>{footer}</div>}
      </aside>
    </>
  );
}
