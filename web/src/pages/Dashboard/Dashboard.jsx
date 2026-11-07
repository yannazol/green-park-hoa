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

const formatMoney = (centavos) =>
  `₱${(Number(centavos || 0) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const dateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

export default function Dashboard() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = getDashboardStyles(colors);
  const navigate = useNavigate();

  const [concerns, setConcerns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConcerns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [concernData, paymentData, reservationData] = await Promise.all([
        api('/concerns'),
        api('/payments'),
        api('/reservations'),
      ]);
      setConcerns(concernData.concerns || []);
      setPayments(paymentData.payments || []);
      setReservations(reservationData.reservations || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
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
    () =>
      concerns.filter(
        (c) =>
          c.status === 'pending' ||
          c.status === 'under_review' ||
          c.status === 'in_progress'
      ).length,
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

  const pendingPayments = useMemo(
    () => payments.filter((payment) => payment.status === 'pending'),
    [payments]
  );
  const upcomingReservations = useMemo(() => {
    const now = new Date();
    const today = dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
    const monthEnd = dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return reservations.filter(
      (reservation) =>
        ['Pending', 'Approved'].includes(reservation.status) &&
        reservation.date >= today &&
        reservation.date <= monthEnd
    );
  }, [reservations]);
  const attentionItems = useMemo(() => {
    const paymentItems = pendingPayments.map((payment) => ({
      id: payment._id,
      type: 'Payment',
      badgeVariant: 'warning',
      title: `${payment.resident?.unit || payment.resident?.name || 'Resident'} - Payment`,
      detail: `${formatMoney(payment.amountCentavos)} · ${payment.referenceNumber}`,
      path: '/dues',
      actionLabel: 'Verify',
      createdAt: payment.createdAt,
    }));
    const reservationItems = reservations
      .filter((reservation) => reservation.status === 'Pending')
      .map((reservation) => ({
        id: reservation._id,
        type: 'Reservation',
        badgeVariant: 'info',
        title: reservation.facilityName || 'Facility reservation',
        detail: `${reservation.date} · ${reservation.timeSlot} · ${reservation.resident?.name || 'Resident'}`,
        path: '/reservations',
        actionLabel: 'Review',
        createdAt: reservation.createdAt,
      }));
    return [...paymentItems, ...reservationItems]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [pendingPayments, reservations]);

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
          value={loading ? '...' : pendingPayments.length}
          hint="Awaiting verification"
          variant="info"
        />
        <StatCard
          label="Upcoming reservations"
          value={loading ? '...' : upcomingReservations.length}
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
            {attentionItems.map((item, index) => (
              <div
                key={item.id}
                style={{
                  ...s.attentionItem,
                  ...(index === attentionItems.length - 1
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
            {!loading && attentionItems.length === 0 && (
              <span style={s.attentionMeta}>No pending items need attention.</span>
            )}
            {loading && <span style={s.attentionMeta}>Loading pending items...</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}
