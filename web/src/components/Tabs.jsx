import { useState } from 'react';
import { useTheme } from '../context/useTheme';
import getTabsStyles from '../styles/TabsStyles';

function TabItem({ tab, isActive, onClick, s }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onClick?.(tab.key)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...s.tab,
        ...(hovered && !isActive ? s.tabHover : {}),
        ...(isActive ? s.tabActive : {}),
      }}
    >
      {tab.label}
    </button>
  );
}

export default function Tabs({ tabs = [], value, onChange, style }) {
  const { colors } = useTheme();
  const s = getTabsStyles(colors);

  return (
    <div role="tablist" style={{ ...s.tablist, ...style }}>
      {tabs.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={tab.key === value}
          onClick={onChange}
          s={s}
        />
      ))}
    </div>
  );
}

