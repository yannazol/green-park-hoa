import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';
import getDashboardStyles from '../../styles/DashboardStyles';

export default function Dashboard() {
  const { colors } = useTheme();
  const s = getDashboardStyles(colors);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      <div style={s.content}>
        <Card title={`Welcome, ${user.name}`} subtitle="Temporary page. The real dashboard comes later.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={s.row}>
              <span style={s.label}>Email</span>
              <span style={s.value}>{user.email}</span>
            </div>
            <div style={s.row}>
              <span style={s.label}>Role</span>
              <Badge variant="info">{user.role}</Badge>
            </div>
            {user.unit && (
              <div style={s.row}>
                <span style={s.label}>Unit</span>
                <span style={s.value}>{user.unit}</span>
              </div>
            )}
          </div>
        </Card>

        <Button onClick={() => navigate('/concerns')}>View concerns</Button>
        <Button onClick={logout}>Sign out</Button>
      </div>
    </div>
  );
}
