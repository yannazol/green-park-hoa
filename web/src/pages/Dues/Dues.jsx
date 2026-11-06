import { useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import PageHeader from '../../components/PageHeader';
import Tabs from '../../components/Tabs';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import getDuesStyles from '../../styles/DuesStyles';

// TODO: replace with API
const INITIAL_DUES = [
  {
    _id: 'due-1',
    resident: 'Maria Santos',
    unit: 'Unit 3B',
    balance: 0,
    paidThrough: 'November 2026',
    status: 'Paid',
  },
  {
    _id: 'due-2',
    resident: 'Juan Reyes',
    unit: 'Unit 12A',
    balance: 2500,
    paidThrough: 'October 2026',
    status: 'Due soon',
  },
  {
    _id: 'due-3',
    resident: 'Teresa Cruz',
    unit: 'Unit 7C',
    balance: 0,
    paidThrough: 'December 2026',
    status: 'Paid',
  },
  {
    _id: 'due-4',
    resident: 'Pedro Ramos',
    unit: 'Unit 15D',
    balance: 7500,
    paidThrough: 'August 2026',
    status: 'Overdue',
  },
  {
    _id: 'due-5',
    resident: 'Corazon Aquino',
    unit: 'Unit 1A',
    balance: 0,
    paidThrough: 'November 2026',
    status: 'Paid',
  },
  {
    _id: 'due-6',
    resident: 'Manuel Roxas',
    unit: 'Unit 22F',
    balance: 5000,
    paidThrough: 'September 2026',
    status: 'Overdue',
  },
];

// TODO: replace with API
const INITIAL_PAYMENTS = [
  {
    _id: 'pay-101',
    resident: 'Juan Reyes',
    unit: 'Unit 12A',
    amount: 2500,
    refNo: 'BDO-98234710',
    date: '2026-11-04T10:30:00Z',
    status: 'Pending',
  },
  {
    _id: 'pay-102',
    resident: 'Pedro Ramos',
    unit: 'Unit 15D',
    amount: 2500,
    refNo: 'GCASH-78219034',
    date: '2026-11-05T14:15:00Z',
    status: 'Pending',
  },
  {
    _id: 'pay-103',
    resident: 'Maria Santos',
    unit: 'Unit 3B',
    amount: 2500,
    refNo: 'BPI-45019283',
    date: '2026-10-30T09:00:00Z',
    status: 'Verified',
  },
  {
    _id: 'pay-104',
    resident: 'Manuel Roxas',
    unit: 'Unit 22F',
    amount: 1500,
    refNo: 'GCASH-11029384',
    date: '2026-10-25T16:45:00Z',
    status: 'Rejected',
    rejectionReason: 'Partial payment not accepted under arrears policy.',
  },
];

const DUE_STATUS_VARIANTS = {
  Paid: 'success',
  'Due soon': 'warning',
  Overdue: 'danger',
};

const PAYMENT_STATUS_VARIANTS = {
  Pending: 'warning',
  Verified: 'success',
  Rejected: 'danger',
};

const TABS = [
  { key: 'dues', label: 'Dues' },
  { key: 'payments', label: 'Payments to verify' },
];

const PAYMENT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'Pending', label: 'Pending' },
  { key: 'Verified', label: 'Verified' },
  { key: 'Rejected', label: 'Rejected' },
];

export default function Dues() {
  const { colors } = useTheme();
  const s = getDuesStyles(colors);

  const [activeTab, setActiveTab] = useState('dues');
  const [dues] = useState(INITIAL_DUES);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [paymentToReject, setPaymentToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  const pendingCount = useMemo(
    () => payments.filter((p) => p.status === 'Pending').length,
    [payments]
  );

  const filteredPayments = useMemo(() => {
    if (paymentFilter === 'all') return payments;
    return payments.filter((p) => p.status === paymentFilter);
  }, [payments, paymentFilter]);

  const handleVerify = (paymentId) => {
    setPayments((prev) =>
      prev.map((p) => (p._id === paymentId ? { ...p, status: 'Verified' } : p))
    );
  };

  const handleOpenRejectModal = (payment) => {
    setPaymentToReject(payment);
    setRejectionReason('');
    setRejectionError('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError('Please provide a reason for rejecting the payment');
      return;
    }

    setPayments((prev) =>
      prev.map((p) =>
        p._id === paymentToReject._id
          ? {
              ...p,
              status: 'Rejected',
              rejectionReason: rejectionReason.trim(),
            }
          : p
      )
    );

    setPaymentToReject(null);
    setRejectionReason('');
    setRejectionError('');
  };

  const duesColumns = [
    { key: 'resident', label: 'Resident' },
    { key: 'unit', label: 'Unit' },
    {
      key: 'balance',
      label: 'Outstanding balance',
      render: (r) => `₱${r.balance.toLocaleString()}`,
    },
    { key: 'paidThrough', label: 'Paid-through month' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={DUE_STATUS_VARIANTS[r.status] || 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  const paymentsColumns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (r) => `${r.resident}${r.unit ? ` (${r.unit})` : ''}`,
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (r) => `₱${r.amount.toLocaleString()}`,
    },
    { key: 'refNo', label: 'Reference number' },
    {
      key: 'date',
      label: 'Date',
      render: (r) => new Date(r.date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={PAYMENT_STATUS_VARIANTS[r.status] || 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => {
        if (r.status === 'Pending') {
          return (
            <div style={s.actionsCell}>
              <Button size="sm" onClick={() => handleVerify(r._id)}>
                Verify
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleOpenRejectModal(r)}
              >
                Reject
              </Button>
            </div>
          );
        }
        if (r.status === 'Rejected' && r.rejectionReason) {
          return (
            <span style={{ fontSize: 13, color: colors.textSecondary }}>
              {r.rejectionReason}
            </span>
          );
        }
        return '—';
      },
    },
  ];

  return (
    <div style={s.container}>
      <PageHeader
        title="Dues & Payments"
        subtitle="Track resident balances and process submitted payment receipts."
      />

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'dues' ? (
        <div style={s.tableCard}>
          <Table
            columns={duesColumns}
            data={dues}
            emptyMessage="No dues records found."
          />
        </div>
      ) : (
        <div>
          {pendingCount === 0 && (
            <div style={s.emptyPendingBox}>
              <p style={s.emptyPendingTitle}>
                No payments pending verification
              </p>
              <p style={s.emptyPendingSubtitle}>
                All submitted payments have been verified or reviewed.
              </p>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div style={s.chips}>
              {PAYMENT_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  style={paymentFilter === f.key ? s.chipActive : s.chip}
                  onClick={() => setPaymentFilter(f.key)}
                >
                  {f.label}
                  {f.key === 'Pending' && pendingCount > 0
                    ? ` (${pendingCount})`
                    : ''}
                </button>
              ))}
            </div>
          </div>

          <div style={s.tableCard}>
            <Table
              columns={paymentsColumns}
              data={filteredPayments}
              emptyMessage={
                paymentFilter === 'Pending'
                  ? 'No payments pending verification.'
                  : 'No payments found.'
              }
            />
          </div>
        </div>
      )}

      <Modal
        open={Boolean(paymentToReject)}
        title="Reject payment"
        onClose={() => {
          setPaymentToReject(null);
          setRejectionReason('');
          setRejectionError('');
        }}
      >
        {paymentToReject && (
          <form onSubmit={handleConfirmReject} style={s.modalForm}>
            <p style={s.rejectDetailText}>
              Rejecting payment of{' '}
              <strong>₱{paymentToReject.amount.toLocaleString()}</strong> from{' '}
              <strong>{paymentToReject.resident}</strong> (Ref:{' '}
              {paymentToReject.refNo}).
            </p>
            <Input
              label="Reason for rejection"
              placeholder="e.g. Invalid reference number, amount discrepancy"
              value={rejectionReason}
              error={rejectionError}
              onChange={(e) => {
                setRejectionReason(e.target.value);
                if (rejectionError) setRejectionError('');
              }}
            />
            <div style={s.modalActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setPaymentToReject(null);
                  setRejectionReason('');
                  setRejectionError('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger">
                Reject payment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

