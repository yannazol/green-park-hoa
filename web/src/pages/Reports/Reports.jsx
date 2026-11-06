import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import Card from '../../components/Card';
import Table from '../../components/Table';
import Button from '../../components/Button';
import getReportsStyles from '../../styles/ReportsStyles';

// TODO: replace with API
const SAMPLE_STATS = {
  collectedThisMonth: 385000,
  outstandingDues: 42500,
  reservationsThisMonth: 18,
};

// TODO: replace with API
const MONTHLY_COLLECTIONS = [
  { month: 'Jun 2026', amount: 340000 },
  { month: 'Jul 2026', amount: 365000 },
  { month: 'Aug 2026', amount: 350000 },
  { month: 'Sep 2026', amount: 390000 },
  { month: 'Oct 2026', amount: 410000 },
  { month: 'Nov 2026', amount: 385000 },
];

// TODO: replace with API
const SIX_MONTH_SUMMARY = [
  {
    _id: 'm-1',
    month: 'November 2026 (MTD)',
    collected: 385000,
    outstanding: 42500,
    reservations: 18,
    concerns: 6,
  },
  {
    _id: 'm-2',
    month: 'October 2026',
    collected: 410000,
    outstanding: 35000,
    reservations: 24,
    concerns: 14,
  },
  {
    _id: 'm-3',
    month: 'September 2026',
    collected: 390000,
    outstanding: 48000,
    reservations: 21,
    concerns: 11,
  },
  {
    _id: 'm-4',
    month: 'August 2026',
    collected: 350000,
    outstanding: 52000,
    reservations: 19,
    concerns: 9,
  },
  {
    _id: 'm-5',
    month: 'July 2026',
    collected: 365000,
    outstanding: 45000,
    reservations: 26,
    concerns: 12,
  },
  {
    _id: 'm-6',
    month: 'June 2026',
    collected: 340000,
    outstanding: 58000,
    reservations: 16,
    concerns: 8,
  },
];

export default function Reports() {
  const { colors } = useTheme();
  const s = getReportsStyles(colors);

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    api('/concerns')
      .then((data) => {
        if (isMounted) {
          setConcerns(data.concerns || []);
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

  const maxCollectionAmount = useMemo(() => {
    return Math.max(...MONTHLY_COLLECTIONS.map((m) => m.amount), 1);
  }, []);

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
      render: (r) => `₱${r.collected.toLocaleString()}`,
    },
    {
      key: 'outstanding',
      label: 'Outstanding (₱)',
      render: (r) => `₱${r.outstanding.toLocaleString()}`,
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
          value={`₱${SAMPLE_STATS.collectedThisMonth.toLocaleString()}`}
          hint="November 2026 MTD"
          variant="success"
        />
        <StatCard
          label="Outstanding dues"
          value={`₱${SAMPLE_STATS.outstandingDues.toLocaleString()}`}
          hint="Unsettled accounts"
          variant="danger"
        />
        <StatCard
          label="Reservations this month"
          value={SAMPLE_STATS.reservationsThisMonth}
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
            {MONTHLY_COLLECTIONS.map((item) => {
              const widthPct = Math.round(
                (item.amount / maxCollectionAmount) * 100
              );
              return (
                <div key={item.month} style={s.chartRow}>
                  <span style={s.chartLabel}>{item.month}</span>
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
                    ₱{item.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card
        title="6-month financial & operational summary"
        subtitle="Historical breakdown of collections, receivables, bookings, and resident concerns"
        noPadding
      >
        <Table
          columns={summaryColumns}
          data={SIX_MONTH_SUMMARY}
          emptyMessage="No summary records available."
        />
      </Card>
    </div>
  );
}

