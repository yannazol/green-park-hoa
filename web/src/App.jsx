import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Concerns from './pages/Concerns/Concerns';
import Residents from './pages/Residents/Residents';
import Dues from './pages/Dues/Dues';
import Reservations from './pages/Reservations/Reservations';
import Announcements from './pages/Announcements/Announcements';
import Services from './pages/Services/Services';
import Reports from './pages/Reports/Reports';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        element={
          <ProtectedRoute roles={['admin', 'staff']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/concerns" element={<Concerns />} />
        <Route
          path="/residents"
          element={
            <ProtectedRoute roles={['admin']}>
              <Residents />
            </ProtectedRoute>
          }
        />
        <Route path="/dues" element={<Dues />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
