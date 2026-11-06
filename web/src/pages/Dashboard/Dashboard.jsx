import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import { api } from '../../services/api';
import { STATUS_META } from '../../constants/concerns';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import getDashboardStyles from '../../styles/DashboardStyles';

// TODO: replace with API
const SAMPLE_STATS = {
  paymentsToVerify: 3,
  upcomingReservations: 5,
};

// TODO: replace with API
const SAMPLE_ATTENTION_ITEMS = [
  {
    id: 'pay-1',
    type: 'Payment',
    badgeVariant: 'warning',
    title: 'Unit 4B - Monthly Dues',
    detail: '₱2,500 bank transfer submitted by Juan Perez',
    path: '/dues',
    actionLabel: 'Verify',
  },
  {
    id: 'res-1',
    type: 'Reservation',
    badgeVariant: 'info',
    title: 'Clubhouse Event Booking',
    detail: 'Nov 15, 2:00 PM - 6:00 PM · Ana Reyes',
    path: '/reservations',
    actionLabel: 'Review',
  },
  {
    id: 'pay-2',
    type: 'Payment',
    badgeVariant: 'warning',
    title: 'Unit 12A - Maintenance Fee',
    detail: '₱1,800 GCash receipt uploaded by Pedro Santos',
    path: '/dues',
    actionLabel: 'Verify',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = getDashboardStyles(colors);
  const navigate = useNavigate();

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConcerns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('/concerns');
      setConcerns(data.concerns || []);
    } catch (err) {
      setError(err.message || 'Failed to load concerns.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadConcerns();
    })();
  }, [loadConcerns]);

  const openCount = useMemo(
    () => concerns.filter((c) => c.status === 'pending' || c.status === 'in_progress').length,
    [concerns]
  );

  const pendingCount = useMemo(
    () => concerns.filter((c) => c.status === 'pending').length,
    [concerns]
  );

  const resolvedCount = useMemo(
    () => concerns.filter((c) => c.status === 'resolved').length,
    [concerns]
  );

  const recentConcerns = useMemo(() => {
    return [...concerns]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [concerns]);

  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'there';
  const todayDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const columns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (r) =>
        r.resident
          ? `${r.resident.name}${r.resident.unit ? ` (${r.resident.unit})` : ''}`
          : 'Unknown',
    },
    {
      key: 'subject',
      label: 'Subject',
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const meta = STATUS_META[r.status] || { label: r.status, variant: 'neutral' };
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
  ];

  return (
    <div style={s.container}>
      <PageHeader
        title={`Welcome, ${firstName}`}
        subtitle={todayDate}
      />

      {error && (
        <div style={s.errorBox}>
          <span>{error}</span>
          <Button size="sm" variant="secondary" onClick={loadConcerns}>
            Retry
          </Button>
        </div>
      )}

      <div style={s.statsGrid}>
        <StatCard
          label="Open concerns"
          value={loading ? '...' : openCount}
          hint={loading ? 'Loading...' : `${pendingCount} pending review`}
          variant="warning"
        />
        <StatCard
          label="Resolved concerns"
          value={loading ? '...' : resolvedCount}
          hint={loading ? 'Loading...' : 'Total resolved'}
          variant="success"
        />
        <StatCard
          label="Payments to verify"
          value={SAMPLE_STATS.paymentsToVerify}
          hint="Awaiting verification"
          variant="info"
        />
        <StatCard
          label="Upcoming reservations"
          value={SAMPLE_STATS.upcomingReservations}
          hint="Scheduled this month"
          variant="neutral"
        />
      </div>

      <div style={s.sectionsGrid}>
        <Card
          title="Recent concerns"
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/concerns')}
            >
              View all
            </Button>
          }
          noPadding
        >
          <Table
            columns={columns}
            data={recentConcerns}
            onRowClick={() => navigate('/concerns')}
            emptyMessage={loading ? 'Loading concerns...' : 'No recent concerns found.'}
          />
        </Card>

        <Card
          title="Needs attention"
          subtitle="Action items requiring staff or admin review"
        >
          <div style={s.attentionList}>
            {SAMPLE_ATTENTION_ITEMS.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...s.attentionItem,
                  ...(index === SAMPLE_ATTENTION_ITEMS.length - 1
                    ? s.attentionItemLast
                    : {}),
                }}
              >
                <div style={s.attentionInfo}>
                  <div style={s.attentionHeader}>
                    <span style={s.attentionTitle}>{item.title}</span>
                    <Badge variant={item.badgeVariant}>{item.type}</Badge>
                  </div>
                  <span style={s.attentionMeta}>{item.detail}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(item.path)}
                >
                  {item.actionLabel}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
