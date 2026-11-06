import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, getToken } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import SlidePanel from '../../components/SlidePanel';
import Table from '../../components/Table';
import Tabs from '../../components/Tabs';
import getDuesStyles from '../../styles/DuesStyles';

const PAGE_SIZE = 10;
const API_URL = import.meta.env.VITE_API_URL;
const TABS = [
  { key: 'overview', label: 'Dues Overview' },
  { key: 'verify', label: 'Verify Payments' },
  { key: 'history', label: 'Payment History' },
];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];
const STATUS_META = {
  pending: { label: 'Pending', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
  Paid: { label: 'Paid', variant: 'success' },
  Outstanding: { label: 'Outstanding', variant: 'warning' },
};

const formatMoney = (centavos = 0) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(centavos / 100);
const formatMonth = (month) => {
  if (!month) return '—';
  const [year, value] = month.split('-').map(Number);
  return new Date(year, value - 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
};
const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';
const paymentStatus = (status) => STATUS_META[status] ?? { label: status, variant: 'neutral' };

function csvCell(value) {
  const text = String(value ?? '').replace(/^[=+\-@]/, "'$&");
  return `"${text.replaceAll('"', '""')}"`;
}

export default function Dues() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const s = getDuesStyles(colors);
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [receiptRequest, setReceiptRequest] = useState(0);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptError, setReceiptError] = useState('');
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [action, setAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [postingDues, setPostingDues] = useState(false);
  const [showPostDues, setShowPostDues] = useState(false);
  const [duesMonth, setDuesMonth] = useState('');
  const [duesAmount, setDuesAmount] = useState('');
  const [toast, setToast] = useState(null);

  const fetchFinancialData = useCallback(async () => {
    const [duesData, paymentData] = await Promise.all([api('/dues'), api('/payments')]);
    return { duesData, paymentData };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { duesData, paymentData } = await fetchFinancialData();
      setOverview(duesData);
      setPayments(paymentData.payments);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFinancialData]);

  useEffect(() => {
    let active = true;
    fetchFinancialData()
      .then(({ duesData, paymentData }) => {
        if (!active) return;
        setOverview(duesData);
        setPayments(paymentData.payments);
        setError('');
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchFinancialData]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const paymentId = selected?._id;
    if (!paymentId) return undefined;

    let active = true;
    let objectUrl;

    fetch(`${API_URL}/payments/${paymentId}/receipt`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('The receipt could not be loaded.');
        return response.blob();
      })
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setReceiptUrl(objectUrl);
      })
      .catch((err) => {
        if (active) setReceiptError(err.message);
      })
      .finally(() => {
        if (active) setReceiptLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [selected?._id, receiptRequest]);

  const searchText = search.trim().toLowerCase();
  const duesRecords = useMemo(() => overview?.dues ?? [], [overview]);
  const filteredDues = useMemo(
    () =>
      duesRecords.filter((row) => {
        if (statusFilter !== 'all' && row.status.toLowerCase() !== statusFilter) return false;
        return [row.resident?.name, row.resident?.unit, row.month]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchText));
      }),
    [duesRecords, searchText, statusFilter]
  );
  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) => {
        if (activeTab === 'verify' && payment.status !== 'pending') return false;
        if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
        return [
          payment.resident?.name,
          payment.resident?.unit,
          payment.referenceNumber,
          payment.receiptFileName,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(searchText));
      }),
    [payments, activeTab, searchText, statusFilter]
  );

  const rows = activeTab === 'overview' ? filteredDues : filteredPayments;
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  const notify = (kind, text) => setToast({ kind, text });

  const openDetails = (payment) => {
    setReceiptUrl('');
    setReceiptError('');
    setReceiptLoading(true);
    setReceiptRequest((request) => request + 1);
    setSelected(payment);
  };

  const closeDetails = () => {
    setSelected(null);
    setReceiptUrl('');
    setReceiptError('');
    setReceiptLoading(false);
  };

  const openAction = (payment, status) => {
    setAction({ payment, status });
    setActionError('');
    setRejectionReason('');
    setReviewNote('');
  };

  const closeAction = () => {
    setAction(null);
    setActionError('');
    setRejectionReason('');
    setReviewNote('');
  };

  const confirmAction = async (event) => {
    event?.preventDefault();
    if (action?.status === 'rejected' && !rejectionReason.trim()) {
      setActionError('Please provide a reason for rejecting this payment.');
      return;
    }

    try {
      const data = await api(`/payments/${action.payment._id}/verification`, {
        method: 'PATCH',
        body: {
          status: action.status,
          note: action.status === 'rejected' ? rejectionReason.trim() : reviewNote.trim(),
        },
      });
      setPayments((list) =>
        list.map((item) => (item._id === data.payment._id ? data.payment : item))
      );
      if (selected?._id === data.payment._id) setSelected(data.payment);
      notify('success', `Payment ${action.status} successfully.`);
      closeAction();
      void load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const postMonthlyDues = async (event) => {
    event.preventDefault();
    setPostingDues(true);
    try {
      await api('/dues', {
        method: 'POST',
        body: { month: duesMonth, amount: duesAmount },
      });
      setShowPostDues(false);
      setDuesMonth('');
      setDuesAmount('');
      notify('success', 'Monthly dues posted to resident accounts.');
      void load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setPostingDues(false);
    }
  };

  const exportHistory = () => {
    const lines = [
      ['Resident', 'Unit', 'Amount', 'Reference', 'Status', 'Submitted', 'Review note'],
      ...payments.map((payment) => [
        payment.resident?.name,
        payment.resident?.unit,
        (payment.amountCentavos / 100).toFixed(2),
        payment.referenceNumber,
        paymentStatus(payment.status).label,
        payment.createdAt,
        payment.rejectionReason ||
          payment.verificationHistory?.[payment.verificationHistory.length - 1]?.note,
      ]),
    ];
    const csv = lines.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `green-park-payment-history-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'Payment history exported.');
  };

  const exportDues = () => {
    const lines = [
      [
        'Resident',
        'Email',
        'Unit',
        'Latest billing period',
        'Outstanding balance',
        'Available credit',
        'Collected',
        'Status',
      ],
      ...duesRecords.map((row) => [
        row.resident?.name,
        row.resident?.email,
        row.resident?.unit,
        formatMonth(row.month),
        (row.outstandingCentavos / 100).toFixed(2),
        (row.creditCentavos / 100).toFixed(2),
        (row.collectedCentavos / 100).toFixed(2),
        row.status,
      ]),
    ];
    const csv = lines.map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `green-park-dues-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify('success', 'Dues report exported.');
  };

  const duesColumns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (row) => (
        <div style={s.residentCell}>
          <span style={s.primaryText}>{row.resident?.name ?? 'Unknown resident'}</span>
          <span style={s.secondaryText}>{row.resident?.email}</span>
        </div>
      ),
    },
    { key: 'unit', label: 'Unit', render: (row) => row.resident?.unit || '—' },
    {
      key: 'month',
      label: 'Latest billing period',
      render: (row) => formatMonth(row.month),
    },
    {
      key: 'outstanding',
      label: 'Outstanding balance',
      render: (row) => <span style={s.amountText}>{formatMoney(row.outstandingCentavos)}</span>,
    },
    {
      key: 'credit',
      label: 'Available credit',
      render: (row) => <span style={s.amountText}>{formatMoney(row.creditCentavos)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const meta = paymentStatus(row.status);
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
  ];

  const paymentColumns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (row) => (
        <div style={s.residentCell}>
          <span style={s.primaryText}>{row.resident?.name ?? 'Unknown resident'}</span>
        </div>
      ),
    },
    { key: 'unit', label: 'Unit', render: (row) => row.resident?.unit || '—' },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => <span style={s.amountText}>{formatMoney(row.amountCentavos)}</span>,
    },
    { key: 'reference', label: 'Reference', render: (row) => row.referenceNumber },
    {
      key: 'status',
      label: 'Payment status',
      render: (row) => {
        const meta = paymentStatus(row.status);
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <div style={s.actionsCell}>
          <Button size="sm" variant="secondary" onClick={() => openDetails(row)}>
            Details
          </Button>
          {isAdmin && activeTab === 'verify' && (
            <>
              <Button size="sm" onClick={() => openAction(row, 'approved')}>
                Approve
              </Button>
              <Button size="sm" variant="danger" onClick={() => openAction(row, 'rejected')}>
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const tableColumns = activeTab === 'overview' ? duesColumns : paymentColumns;

  return (
    <div style={s.container}>
      <div style={s.pageTop}>
        <PageHeader
          title="Dues & Payments"
          subtitle="A clear, auditable view of community dues and resident payments."
        />
        {isAdmin && (
          <Button
            onClick={() => {
              setActionError('');
              setShowPostDues(true);
            }}
          >
            Post monthly dues
          </Button>
        )}
      </div>

      <div style={s.overviewCards}>
        <div style={s.metricCard}>
          <span style={s.metricLabel}>Total collected</span>
          <span style={s.metricValue}>
            {loading || !overview ? '—' : formatMoney(overview.summary.totalCollectedCentavos)}
          </span>
          <span style={s.metricHint}>Approved payments recorded</span>
        </div>
        <div style={s.metricCard}>
          <span style={s.metricLabel}>Outstanding balance</span>
          <span style={s.metricValue}>
            {loading || !overview ? '—' : formatMoney(overview.summary.outstandingCentavos)}
          </span>
          <span style={s.metricHint}>Across resident accounts</span>
        </div>
        <div style={s.metricCard}>
          <span style={s.metricLabel}>Pending verification</span>
          <span style={s.metricValue}>
            {loading || !overview ? '—' : overview.summary.pendingVerification}
          </span>
          <span style={s.metricHint}>Payments awaiting review</span>
        </div>
      </div>

      <Tabs
        tabs={TABS}
        value={activeTab}
        onChange={(value) => {
          setActiveTab(value);
          setPage(1);
          setSearch('');
          setStatusFilter('all');
        }}
      />

      {error && <div style={s.errorBox}>{error}</div>}

      <section style={s.tabPanel}>
        <div style={s.toolbar}>
          <div style={s.searchField}>
            <Input
              label={activeTab === 'overview' ? 'Find a resident' : 'Search payments'}
              type="search"
              placeholder={
                activeTab === 'overview'
                  ? 'Name, unit, or billing period'
                  : 'Resident, unit, or reference number'
              }
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div style={s.filterField}>
            <Select
              label="Status"
              value={statusFilter}
              options={
                activeTab === 'overview'
                  ? [
                      { value: 'all', label: 'All account statuses' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'outstanding', label: 'Outstanding' },
                    ]
                  : activeTab === 'verify'
                    ? [{ value: 'all', label: 'Pending only' }]
                    : STATUS_OPTIONS
              }
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            />
          </div>
            {isAdmin && activeTab === 'history' && (
              <Button variant="secondary" disabled={!overview || loading} onClick={exportHistory}>
                Export CSV
              </Button>
            )}
            {isAdmin && activeTab === 'overview' && (
              <Button variant="secondary" disabled={!overview || loading} onClick={exportDues}>
                Export CSV
              </Button>
            )}
        </div>

        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h2 style={s.tableTitle}>
              {activeTab === 'overview'
                ? 'Resident dues'
                : activeTab === 'verify'
                  ? 'Payments awaiting review'
                  : 'Payment history'}
            </h2>
            <span style={s.tableHint}>
              {loading
                ? 'Loading records…'
                : error && !overview
                  ? 'Records unavailable'
                  : `${rows.length} record${rows.length === 1 ? '' : 's'}`}
            </span>
          </div>
          <Table
            columns={tableColumns}
            data={loading || (error && !overview) ? [] : pageRows}
            emptyMessage={
              loading
                ? 'Loading financial records…'
                : error && !overview
                  ? 'Financial records could not be loaded.'
                  : activeTab === 'verify'
                    ? 'No payments are waiting for verification.'
                    : 'No records match your search and filters.'
            }
          />
          {!loading && !(error && !overview) && rows.length > 0 && (
            <div style={s.pagination}>
              <span style={s.tableHint}>
                Showing {start + 1}–{start + pageRows.length} of {rows.length}
              </span>
              {totalPages > 1 && (
                <div style={s.pageButtons}>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={currentPage === 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span style={s.tableHint}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <SlidePanel
        open={Boolean(selected)}
        title="Payment details"
        subtitle={selected?.referenceNumber}
        onClose={closeDetails}
        footer={
          selected?.status === 'pending' && isAdmin ? (
            <div style={s.actionsCell}>
              <Button variant="secondary" onClick={() => openAction(selected, 'rejected')}>
                Reject
              </Button>
              <Button onClick={() => openAction(selected, 'approved')}>Approve payment</Button>
            </div>
          ) : null
        }
      >
        {selected && (
          <>
            <section style={s.panelSection}>
              <h3 style={s.sectionHeading}>Resident</h3>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Name</span>
                <span style={s.detailValue}>{selected.resident?.name || 'Unknown resident'}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Unit</span>
                <span style={s.detailValue}>{selected.resident?.unit || '—'}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Email</span>
                <span style={s.detailValue}>{selected.resident?.email || '—'}</span>
              </div>
            </section>
            <section style={s.panelSection}>
              <h3 style={s.sectionHeading}>Payment</h3>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Amount</span>
                <strong style={s.detailValue}>{formatMoney(selected.amountCentavos)}</strong>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Reference</span>
                <span style={s.detailValue}>{selected.referenceNumber}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Submitted</span>
                <span style={s.detailValue}>{formatDate(selected.createdAt)}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Status</span>
                <span style={s.detailValue}>
                  <Badge variant={paymentStatus(selected.status).variant}>
                    {paymentStatus(selected.status).label}
                  </Badge>
                </span>
              </div>
              {selected.rejectionReason && (
                <div style={s.detailRow}>
                  <span style={s.detailLabel}>Admin note</span>
                  <span style={s.detailValue}>{selected.rejectionReason}</span>
                </div>
              )}
            </section>
            <section style={s.panelSection}>
              <h3 style={s.sectionHeading}>Uploaded receipt</h3>
              {receiptLoading && <span style={s.secondaryText}>Loading receipt…</span>}
              {receiptError && <div style={s.errorBox}>{receiptError}</div>}
              {receiptUrl && (
                <a href={receiptUrl} target="_blank" rel="noreferrer">
                  <img src={receiptUrl} alt="Uploaded payment receipt" style={s.receiptImage} />
                </a>
              )}
            </section>
            <section style={s.panelSection}>
              <h3 style={s.sectionHeading}>Verification history</h3>
              {selected.verificationHistory?.length ? (
                <div style={s.historyList}>
                  {selected.verificationHistory.map((entry, index) => (
                    <div key={`${entry.at}-${index}`} style={s.historyItem}>
                      <span style={s.primaryText}>
                        {paymentStatus(entry.status).label} · {entry.by?.name || 'Administrator'}
                      </span>
                      <span style={s.secondaryText}>{formatDate(entry.at)}</span>
                      {entry.note && <span style={s.secondaryText}>{entry.note}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={s.secondaryText}>Not reviewed yet.</span>
              )}
            </section>
          </>
        )}
      </SlidePanel>

      <Modal
        open={Boolean(action)}
        title={action?.status === 'approved' ? 'Approve payment?' : 'Reject payment'}
        onClose={closeAction}
      >
        {action && (
          <form onSubmit={confirmAction} style={s.modalForm}>
            <p style={s.rejectionText}>
              {action.status === 'approved'
                ? `Approve ${formatMoney(action.payment.amountCentavos)} from ${action.payment.resident?.name || 'this resident'}? This will update their outstanding dues and the payment ledger.`
                : `Reject ${formatMoney(action.payment.amountCentavos)} from ${action.payment.resident?.name || 'this resident'}?`}
            </p>
            {action.status === 'rejected' && (
              <Input
                label="Reason for rejection"
                value={rejectionReason}
                error={actionError}
                maxLength={1000}
                onChange={(event) => {
                  setRejectionReason(event.target.value);
                  if (actionError) setActionError('');
                }}
              />
            )}
            {action.status === 'approved' && (
              <Input
                label="Admin note (optional)"
                value={reviewNote}
                maxLength={1000}
                onChange={(event) => setReviewNote(event.target.value)}
              />
            )}
            {actionError && action.status === 'approved' && (
              <div style={s.errorBox}>{actionError}</div>
            )}
            <div style={s.modalActions}>
              <Button type="button" variant="secondary" onClick={closeAction}>
                Cancel
              </Button>
              <Button type="submit" variant={action.status === 'rejected' ? 'danger' : 'primary'}>
                {action.status === 'approved' ? 'Confirm approval' : 'Reject payment'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        open={showPostDues}
        title="Post monthly dues"
        onClose={() => {
          setShowPostDues(false);
          setActionError('');
        }}
      >
        <form onSubmit={postMonthlyDues} style={s.modalForm}>
          <p style={s.rejectionText}>
            This creates an auditable charge for each resident account. Billing periods cannot be
            posted twice or deleted.
          </p>
          <Input
            label="Billing month"
            type="month"
            value={duesMonth}
            required
            onChange={(event) => setDuesMonth(event.target.value)}
          />
          <Input
            label="Monthly amount (PHP)"
            type="number"
            min="0.01"
            step="0.01"
            value={duesAmount}
            required
            onChange={(event) => setDuesAmount(event.target.value)}
          />
          {actionError && <div style={s.errorBox}>{actionError}</div>}
          <div style={s.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowPostDues(false);
                setActionError('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={postingDues}>
              Post dues
            </Button>
          </div>
        </form>
      </Modal>

      {toast && (
        <div role="status" style={toast.kind === 'success' ? s.toastSuccess : s.toastError}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
