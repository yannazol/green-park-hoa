import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Button from '../../components/Button';
import getReportsStyles from '../../styles/ReportsStyles';

function monthKey(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}/.test(value)) {
    return value.slice(0, 7);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function createReportMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      _id: `${date.getFullYear()}-${date.getMonth() + 1}`,
      key: monthKey(date),
      month: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      chartLabel: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
      collected: 0,
      reservations: 0,
      concerns: 0,
    };
  });
}

export default function Reports() {
  const { colors } = useTheme();
  const s = getReportsStyles(colors);

  const [concerns, setConcerns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [outstandingDues, setOutstandingDues] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api('/concerns'),
      api('/dues'),
      api('/payments'),
      api('/reservations'),
    ])
      .then(([concernData, duesData, paymentData, reservationData]) => {
        if (isMounted) {
          setConcerns(concernData.concerns || []);
          setOutstandingDues(duesData.summary?.outstandingCentavos || 0);
          setPayments(paymentData.payments || []);
          setReservations(reservationData.reservations || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load concerns');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalConcerns = concerns.length;

  const concernCounts = useMemo(() => {
    const counts = {
      resolved: 0,
      pending: 0,
      under_review: 0,
      in_progress: 0,
      rejected: 0,
    };
    for (const c of concerns) {
      if (counts[c.status] !== undefined) {
        counts[c.status] += 1;
      }
    }
    return counts;
  }, [concerns]);

  const monthlySummary = useMemo(() => {
    const months = createReportMonths();
    const monthByKey = new Map(months.map((month) => [month.key, month]));
    for (const payment of payments) {
      if (payment.status !== 'approved') continue;
      const history = payment.verificationHistory || [];
      const approval = history.filter((entry) => entry.status === 'approved').at(-1);
      const key = monthKey(approval?.at || payment.updatedAt);
      const month = monthByKey.get(key);
      if (month) month.collected += payment.amountCentavos || 0;
    }
    for (const reservation of reservations) {
      if (!['Pending', 'Approved'].includes(reservation.status)) continue;
      const month = monthByKey.get(monthKey(reservation.date));
      if (month) month.reservations += 1;
    }
    for (const concern of concerns) {
      const month = monthByKey.get(monthKey(concern.createdAt));
      if (month) month.concerns += 1;
    }
    return months;
  }, [concerns, payments, reservations]);

  const currentMonth = monthlySummary[monthlySummary.length - 1];
  const maxCollectionAmount = useMemo(
    () => Math.max(...monthlySummary.map((month) => month.collected), 1),
    [monthlySummary]
  );

  const concernsChartData = useMemo(() => {
    const items = [
      {
        label: 'Resolved',
        count: concernCounts.resolved,
        color: colors.success,
      },
      {
        label: 'In progress',
        count: concernCounts.in_progress,
        color: colors.info,
      },
      {
        label: 'Pending',
        count: concernCounts.pending,
        color: colors.warning,
      },
      {
        label: 'Under review',
        count: concernCounts.under_review,
        color: colors.brand,
      },
      {
        label: 'Rejected',
        count: concernCounts.rejected,
        color: colors.danger,
      },
    ];

    return items.map((item) => {
      const pct =
        totalConcerns > 0 ? Math.round((item.count / totalConcerns) * 100) : 0;
      return {
        ...item,
        pct,
      };
    });
  }, [concernCounts, totalConcerns, colors]);

  const summaryColumns = [
    { key: 'month', label: 'Month' },
    {
      key: 'collected',
      label: 'Collected (₱)',
      render: (r) => `₱${(r.collected / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    },
    {
      key: 'reservations',
      label: 'Reservations',
      render: (r) => `${r.reservations} bookings`,
    },
    {
      key: 'concerns',
      label: 'Concerns filed',
      render: (r) => `${r.concerns} filed`,
    },
  ];

  return (
    <div style={s.container}>
      <style>{`
        @media print {
          aside, header, button {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
        }
      `}</style>

      <PageHeader
        title="Reports"
        subtitle="Monthly financial, operational, and community performance summary."
        action={
          <Button onClick={() => window.print()}>
            Print report
          </Button>
        }
      />

      {error && <div style={s.errorBox}>{error}</div>}

      <div style={s.statsGrid}>
        <StatCard
          label="Total collected this month"
          value={`₱${((currentMonth?.collected || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint="Current month"
          variant="success"
        />
        <StatCard
          label="Outstanding dues"
          value={`₱${(outstandingDues / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          hint="Current unsettled balance"
          variant="danger"
        />
        <StatCard
          label="Reservations this month"
          value={loading ? '...' : currentMonth?.reservations || 0}
          hint="Facilities booked"
          variant="info"
        />
        <StatCard
          label="Concerns resolved"
          value={loading ? '...' : concernCounts.resolved}
          hint={loading ? 'Loading...' : `${totalConcerns} total reported`}
          variant="neutral"
        />
      </div>

      <div style={s.chartsGrid}>
        <Card title="Concerns by status" subtitle="Distribution of all reported community concerns">
          <div style={s.chartBody}>
            {loading ? (
              <p style={s.loadingText}>Loading concerns data...</p>
            ) : totalConcerns === 0 ? (
              <p style={s.loadingText}>No concerns recorded yet.</p>
            ) : (
              concernsChartData.map((item) => (
                <div key={item.label} style={s.chartRow}>
                  <span style={s.chartLabel}>{item.label}</span>
                  <div style={s.barTrack}>
                    <div
                      style={{
                        ...s.barFill,
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <span style={s.chartValue}>
                    {item.count} ({item.pct}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Monthly collections" subtitle="Monthly homeowner dues and fee collections">
          <div style={s.chartBody}>
            {loading ? (
              <p style={s.loadingText}>Loading collection data...</p>
            ) : monthlySummary.map((item) => {
              const widthPct = Math.round(
                (item.collected / maxCollectionAmount) * 100
              );
              return (
                <div key={item.month} style={s.chartRow}>
                  <span style={s.chartLabel}>{item.chartLabel}</span>
                  <div style={s.barTrack}>
                    <div
                      style={{
                        ...s.barFill,
                        width: `${widthPct}%`,
                        backgroundColor: colors.brand,
                      }}
                    />
                  </div>
                  <span style={s.chartValue}>
                    ₱{(item.collected / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card
        title="6-month activity summary"
        subtitle="Verified collections, active reservations, and concerns filed by month"
        noPadding
      >
        <Table
          columns={summaryColumns}
          data={loading ? [] : monthlySummary}
          emptyMessage="No summary records available."
        />
      </Card>
    </div>
  );
}
