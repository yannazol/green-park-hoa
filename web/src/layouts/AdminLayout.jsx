import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import Badge from '../components/Badge';
import Button from '../components/Button';
import getAdminLayoutStyles from '../styles/AdminLayoutStyles';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard' },
  { path: '/concerns', label: 'Concerns' },
  { path: '/residents', label: 'Residents', adminOnly: true },
  { path: '/dues', label: 'Dues & Payments' },
  { path: '/reservations', label: 'Reservations' },
  { path: '/announcements', label: 'Announcements' },
  { path: '/services', label: 'Vehicles & Senior' },
  { path: '/reports', label: 'Reports', adminOnly: true },
];

function NavItem({ to, label, s, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        ...s.navLink,
        ...(hovered && !isActive ? s.navLinkHover : {}),
        ...(isActive ? s.navLinkActive : {}),
      })}
    >
      {label}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const s = getAdminLayoutStyles(colors);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 800;
    }
    return false;
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuHovered, setMenuHovered] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 800;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  return (
    <div style={s.layout}>
      {isMobile ? (
        sidebarOpen && (
          <>
            <div
              style={s.sidebarBackdrop}
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <aside style={s.sidebarDrawer}>
              <div style={s.sidebarHeader}>
                <h2 style={s.appName}>Green Park Village HOA</h2>
                <button
                  type="button"
                  style={{
                    ...s.closeButton,
                    ...(closeHovered ? s.closeButtonHover : {}),
                  }}
                  onMouseEnter={() => setCloseHovered(true)}
                  onMouseLeave={() => setCloseHovered(false)}
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close navigation menu"
                >
                  ✕
                </button>
              </div>
              <nav style={s.nav}>
                {visibleNavItems.map((item) => (
                  <NavItem
                    key={item.path}
                    to={item.path}
                    label={item.label}
                    s={s}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </nav>
            </aside>
          </>
        )
      ) : (
        <aside style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <h2 style={s.appName}>Green Park Village HOA</h2>
          </div>
          <nav style={s.nav}>
            {visibleNavItems.map((item) => (
              <NavItem
                key={item.path}
                to={item.path}
                label={item.label}
                s={s}
              />
            ))}
          </nav>
        </aside>
      )}

      <div style={s.pageWrapper}>
        <header style={s.topBar}>
          <div style={s.topBarLeft}>
            {isMobile && (
              <button
                type="button"
                style={{
                  ...s.menuButton,
                  ...(menuHovered ? s.menuButtonHover : {}),
                }}
                onMouseEnter={() => setMenuHovered(true)}
                onMouseLeave={() => setMenuHovered(false)}
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                ☰
              </button>
            )}
          </div>
          <div style={s.topBarRight}>
            <span style={s.userName}>{user?.name}</span>
            {user?.role && <Badge variant="info">{user.role}</Badge>}
            <Button size="sm" variant="secondary" onClick={logout}>
              Sign out
            </Button>
          </div>
        </header>
        <main style={s.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
