import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import StatCard from '../../components/StatCard';
import Table from '../../components/Table';
import Tabs from '../../components/Tabs';
import {
  CATEGORIES,
  STATUS_META,
  STATUS_OPTIONS,
  capitalize,
  formatDate,
  residentName,
  ticketId,
} from '../../constants/concerns';
import getConcernsStyles from '../../styles/ConcernsStyles';
import ConcernPanel from './ConcernPanel';

const PAGE_SIZE = 10;

export default function Concerns() {
  const { colors } = useTheme();
  const s = getConcernsStyles(colors);

  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('all');
  const [category, setCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api('/concerns');
      setConcerns(data.concerns);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const counts = useMemo(() => {
    const result = { all: concerns.length };
    STATUS_OPTIONS.forEach((value) => {
      result[value] = concerns.filter((c) => c.status === value).length;
    });
    return result;
  }, [concerns]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

    return concerns.filter((c) => {
      if (statusTab !== 'all' && c.status !== statusTab) return false;
      if (category !== 'all' && c.category !== category) return false;
      const created = new Date(c.createdAt);
      if (from && created < from) return false;
      if (to && created > to) return false;
      if (!query) return true;
      return [ticketId(c), residentName(c), c.resident?.unit, c.subject]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(query));
    });
  }, [concerns, search, statusTab, category, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(startIndex, startIndex + PAGE_SIZE);
  const hasFilters = search || statusTab !== 'all' || category !== 'all' || dateFrom || dateTo;

  const updateFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusTab('all');
    setCategory('all');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const openConcern = (row) => {
    setSelected(row);
    setPanelOpen(true);
  };

  const handleSaved = (updated) => {
    setSelected(updated);
    setConcerns((list) => list.map((c) => (c._id === updated._id ? updated : c)));
  };

  const columns = [
    {
      key: 'ticket',
      label: 'Ticket',
      render: (r) => <span style={s.ticket}>{ticketId(r)}</span>,
    },
    {
      key: 'resident',
      label: 'Resident',
      render: (r) => (
        <div>
          <div style={s.primaryText}>{residentName(r)}</div>
          {r.resident?.unit && <div style={s.secondaryText}>{r.resident.unit}</div>}
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (r) => (
        <div>
          <div style={s.primaryText}>{r.subject}</div>
          <div style={s.secondaryText}>
            {capitalize(r.category)} · {formatDate(r.createdAt)}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={STATUS_META[r.status].variant}>{STATUS_META[r.status].label}</Badge>
      ),
    },
    {
      key: 'action',
      label: '',
      align: 'right',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => openConcern(r)}>
          View
        </Button>
      ),
    },
  ];

  const tabs = [
    { key: 'all', label: `All (${counts.all})` },
    ...STATUS_OPTIONS.map((value) => ({
      key: value,
      label: `${STATUS_META[value].label} (${counts[value]})`,
    })),
  ];

  const categoryOptions = [
    { value: 'all', label: 'All categories' },
    ...CATEGORIES.map((value) => ({ value, label: capitalize(value) })),
  ];

  return (
    <div style={s.content}>
      <PageHeader
        title="Community concerns"
        subtitle="Review what residents submitted and update the status."
      />

      <div style={s.statGrid}>
        <StatCard
          label="Total concerns"
          value={loading ? '—' : counts.all}
          hint="Everything residents have submitted"
        />
        <StatCard
          label="Pending"
          value={loading ? '—' : counts.pending}
          hint="Waiting for review"
          variant="warning"
        />
        <StatCard
          label="In progress"
          value={loading ? '—' : counts.in_progress}
          hint="Currently being handled"
          variant="info"
        />
      </div>

      <div style={s.toolbar}>
        <div style={s.searchField}>
          <Input
            label="Search"
            type="search"
            placeholder="Ticket, resident, unit, or subject"
            value={search}
            onChange={(e) => updateFilter(setSearch)(e.target.value)}
          />
        </div>
        <div style={s.filterField}>
          <Select
            label="Category"
            value={category}
            options={categoryOptions}
            onChange={(e) => updateFilter(setCategory)(e.target.value)}
          />
        </div>
        <div style={s.filterField}>
          <Input
            label="From"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => updateFilter(setDateFrom)(e.target.value)}
          />
        </div>
        <div style={s.filterField}>
          <Input
            label="To"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => updateFilter(setDateTo)(e.target.value)}
          />
        </div>
      </div>

      <div style={s.tabsRow}>
        <Tabs
          tabs={tabs}
          value={statusTab}
          onChange={updateFilter(setStatusTab)}
          style={s.tabsWrap}
        />
        {hasFilters && (
          <button type="button" style={s.linkButton} onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {error && <div style={s.errorBox}>{error}</div>}

      {loading ? (
        <p style={s.message}>Loading...</p>
      ) : (
        <>
          <Table
            columns={columns}
            data={pageItems}
            emptyMessage={
              concerns.length === 0
                ? 'No concerns have been submitted yet.'
                : 'No concerns match your filters.'
            }
          />
          {filtered.length > 0 && (
            <div style={s.pagination}>
              <span style={s.message}>
                Showing {startIndex + 1}–{startIndex + pageItems.length} of {filtered.length}
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
                  <span style={s.message}>
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
        </>
      )}

      <ConcernPanel
        concern={selected}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSaved={handleSaved}
        onNotify={setToast}
      />

      {toast && (
        <div role="status" style={toast.kind === 'success' ? s.toastSuccess : s.toastError}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
