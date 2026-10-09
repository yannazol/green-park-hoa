import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Button from './Button';

// Wrap a page with this to require login.
// Optional: roles={['admin', 'staff']} to also restrict by role.
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 24 }}>
        <p>This web portal is for HOA staff and admins. Residents use the mobile app.</p>
        <Button onClick={logout}>Sign out</Button>
      </div>
    );
  }

  return children;
}