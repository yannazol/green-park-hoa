import { useCallback, useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import Button from '../components/Button';
import Modal from '../components/Modal';
import getAdminLayoutStyles from '../styles/AdminLayoutStyles';

const NAV_GROUPS = [
  {
    label: 'Main Menu',
    items: [
      { path: '/', label: 'Overview', icon: 'overview' },
      { path: '/concerns', label: 'Concerns', icon: 'concerns' },
      { path: '/residents', label: 'Residents', icon: 'residents', adminOnly: true },
      { path: '/dues', label: 'Dues & Payments', icon: 'dues', adminOnly: true },
      { path: '/reservations', label: 'Reservations', icon: 'reservations', adminOnly: true },
      { path: '/announcements', label: 'Announcements', icon: 'announcements' },
    ],
  },
  {
    label: 'Community',
    items: [
      { path: '/services', label: 'Vehicles & Senior', icon: 'services' },
      { path: '/reports', label: 'Reports', icon: 'reports', adminOnly: true },
    ],
  },
];

function NavigationIcon({ name, size = 20 }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const shapes = {
    overview: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
      </>
    ),
    concerns: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" />
        <path d="M8 11h8M8 14h5" />
      </>
    ),
    residents: (
      <>
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M16 5.2a3.5 3.5 0 0 1 0 6.7M17.5 14a5.6 5.6 0 0 1 3.7 5.3" />
      </>
    ),
    dues: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M3 9h18M7 15h4" />
        <circle cx="17" cy="14" r="1.5" />
      </>
    ),
    reservations: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2.5" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h3" />
      </>
    ),
    announcements: (
      <>
        <path d="m3 11 17-6v14L3 13v-2Z" />
        <path d="M7 14.5 9 20h4l-2.2-7.1M20 10a3 3 0 0 1 0 4" />
      </>
    ),
    services: (
      <>
        <path d="m5 11 1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11M3.5 11h17v7h-17zM6 18v2M18 18v2" />
        <circle cx="7.5" cy="14.5" r=".8" />
        <circle cx="16.5" cy="14.5" r=".8" />
      </>
    ),
    reports: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        <path d="m3 7 5-3 5 5 7-6" />
      </>
    ),
    settings: (
      <>
        <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3.1 1.3v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3.1-1.3l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-1.3-3.1h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 1.3-3.1l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3.1-1.3v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3.1 1.3l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 1.3 3.1h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-1.3 3.1Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...common}
    >
      {shapes[name]}
    </svg>
  );
}

function NavItem({ item, s, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        ...s.navLink,
        ...(hovered && !isActive ? s.navLinkHover : {}),
        ...(isActive ? s.navLinkActive : {}),
      })}
    >
      <span style={s.navIcon}>
        <NavigationIcon name={item.icon} />
      </span>
      <span style={s.navLabel}>{item.label}</span>
    </NavLink>
  );
}

function Sidebar({ mobile, open, onClose, groups, user, logout, s, onSettings }) {
  const [closeHovered, setCloseHovered] = useState(false);
  const [settingsHovered, setSettingsHovered] = useState(false);
  const [signOutHovered, setSignOutHovered] = useState(false);

  useEffect(() => {
    if (!mobile || !open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobile, open, onClose]);

  const sidebarStyle = mobile
    ? { ...s.sidebar, ...s.sidebarDrawer, ...(open ? s.sidebarDrawerOpen : s.sidebarDrawerClosed) }
    : s.sidebar;

  return (
    <>
      {mobile && open && (
        <button
          type="button"
          style={s.sidebarBackdrop}
          onClick={onClose}
          aria-label="Close navigation menu"
        />
      )}
      <aside
        className="admin-sidebar"
        style={sidebarStyle}
        aria-label="Main navigation"
        aria-hidden={mobile && !open}
      >
        <div style={s.sidebarHeader}>
          <div style={s.brand}>
            <img
              src="/brand/simplified-leaf.png"
              alt=""
              aria-hidden="true"
              style={s.brandMark}
            />
            <div style={s.brandText}>
              <h2 style={s.appName}>Green Park Village</h2>
              <span style={s.appSubtitle}>Homeowners Association</span>
            </div>
          </div>
          {mobile ? (
            <button
              type="button"
              style={{ ...s.iconButton, ...(closeHovered ? s.iconButtonHover : {}) }}
              onMouseEnter={() => setCloseHovered(true)}
              onMouseLeave={() => setCloseHovered(false)}
              onClick={onClose}
              aria-label="Close navigation menu"
            >
              <NavigationIcon name="close" />
            </button>
          ) : null}
        </div>

        <nav className="admin-sidebar-nav" style={s.nav}>
          {groups.map((group) => (
            <div key={group.label} style={s.navGroup}>
              <h3 style={s.sectionHeading}>{group.label}</h3>
              <div style={s.navItems}>
                {group.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    s={s}
                    onClick={mobile ? onClose : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.footerActions}>
            <button
              type="button"
              style={{
                ...s.utilityButton,
                ...(settingsHovered ? s.utilityButtonHover : {}),
              }}
              onClick={onSettings}
              onMouseEnter={() => setSettingsHovered(true)}
              onMouseLeave={() => setSettingsHovered(false)}
              aria-label="Settings"
            >
              <NavigationIcon name="settings" />
              <span>Settings</span>
            </button>
          </div>
          <div style={s.profile}>
            <div style={s.profileAvatar} aria-hidden="true">
              {(user?.name || 'A').trim().charAt(0).toUpperCase()}
            </div>
            <div style={s.profileDetails}>
              <span style={s.profileName}>{user?.name || 'Administrator'}</span>
              <span style={s.profileRole}>
                {user?.role === 'admin' ? 'Administrator' : 'HOA Staff'}
              </span>
            </div>
          </div>
          <button
            type="button"
            style={{ ...s.signOut, ...(signOutHovered ? s.signOutHover : {}) }}
            onClick={logout}
            onMouseEnter={() => setSignOutHovered(true)}
            onMouseLeave={() => setSignOutHovered(false)}
          >
            <NavigationIcon name="logout" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { colors, mode, setMode } = useTheme();
  const s = getAdminLayoutStyles(colors);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 800);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.adminOnly || user?.role === 'admin'),
  })).filter((group) => group.items.length > 0);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div style={s.layout}>
      <Sidebar
        mobile={isMobile}
        open={sidebarOpen}
        onClose={closeSidebar}
        groups={visibleGroups}
        user={user}
        logout={logout}
        s={s}
        onSettings={() => setSettingsOpen(true)}
      />

      <div
        style={{
          ...s.pageWrapper,
        }}
      >
        {isMobile && (
          <header style={s.topBar}>
            <div style={s.topBarLeft}>
              <button
                type="button"
                style={{
                  ...s.menuButton,
                  ...(menuHovered ? s.menuButtonHover : {}),
                }}
                onMouseEnter={() => setMenuHovered(true)}
                onMouseLeave={() => setMenuHovered(false)}
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
              >
                <NavigationIcon name="menu" />
              </button>
            </div>
          </header>
        )}
        <main style={s.mainContent}>
          <Outlet />
        </main>
      </div>

      <Modal
        open={settingsOpen}
        title="Settings"
        onClose={() => setSettingsOpen(false)}
      >
        <div style={s.settingsContent}>
          <div>
            <h3 style={s.settingsHeading}>Appearance</h3>
            <p style={s.settingsDescription}>Choose how the admin portal looks on this device.</p>
          </div>
          <div style={s.themeOptions} role="group" aria-label="Color theme">
            {[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'Use system setting' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                style={{
                  ...s.themeOption,
                  ...(mode === option.value ? s.themeOptionActive : {}),
                }}
                onClick={() => setMode(option.value)}
                aria-pressed={mode === option.value}
              >
                <span>{option.label}</span>
                <span style={mode === option.value ? s.themeRadioActive : s.themeRadio} />
              </button>
            ))}
          </div>
          <div style={s.settingsActions}>
            <Button onClick={() => setSettingsOpen(false)}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
