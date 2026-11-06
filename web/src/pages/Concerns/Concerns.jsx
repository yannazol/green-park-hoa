import { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import PageHeader from '../../components/PageHeader';
import Table from '../../components/Table';
import { STATUS_META, STATUS_OPTIONS } from '../../constants/concerns';
import getConcernsStyles from '../../styles/ConcernsStyles';

const FILTERS = ['all', ...STATUS_OPTIONS];

const residentText = (r) =>
  r.resident ? `${r.resident.name}${r.resident.unit ? ` (${r.resident.unit})` : ''}` : 'Unknown';

export default function Concerns() {
  const { colors } = useTheme();
  const s = getConcernsStyles(colors);

  const [concerns, setConcerns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const load = useCallback(async () => {
    try {
      const query = filter === 'all' ? '' : `?status=${filter}`;
      const data = await api(`/concerns${query}`);
      setConcerns(data.concerns);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void (async () => {
      await load();
    })();
  }, [load]);

  const changeFilter = (value) => {
    setLoading(true);
    setFilter(value);
  };

  const selectConcern = (row) => {
    setSelected(row);
    setNewStatus(row.status);
    setNote(row.staffNote || '');
    setNotice(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const data = await api(`/concerns/${selected._id}/status`, {
        method: 'PATCH',
        body: { status: newStatus, staffNote: note },
      });
      setSelected(data.concern);
      setNotice({ kind: 'success', text: 'Saved. The resident will see this update.' });
      await load();
    } catch (err) {
      setNotice({ kind: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'resident', label: 'Resident', render: residentText },
    { key: 'subject', label: 'Subject' },
    { key: 'category', label: 'Category' },
    { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={STATUS_META[r.status].variant}>{STATUS_META[r.status].label}</Badge>
      ),
    },
  ];

  return (
    <div style={s.content}>
      <PageHeader
        title="Community concerns"
        subtitle="Review what residents submitted and update the status."
      />

        <div style={s.chips}>
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              style={filter === value ? s.chipActive : s.chip}
              onClick={() => changeFilter(value)}
            >
              {value === 'all' ? 'All' : STATUS_META[value].label}
            </button>
          ))}
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        {loading ? (
          <p style={s.message}>Loading...</p>
        ) : (
          <Table
            columns={columns}
            data={concerns}
            onRowClick={selectConcern}
            emptyMessage="No concerns found."
          />
        )}

        {selected && (
          <Card title={selected.subject} subtitle={`${selected.type} · ${selected.category}`}>
            <div style={s.detailBody}>
              <p style={s.description}>{selected.description}</p>
              <p style={s.metaLine}>
                From {residentText(selected)} on {new Date(selected.createdAt).toLocaleDateString()}
              </p>

              <div>
                <span style={s.fieldLabel}>Status</span>
                <div style={s.chips}>
                  {STATUS_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      style={newStatus === value ? s.chipActive : s.chip}
                      onClick={() => setNewStatus(value)}
                    >
                      {STATUS_META[value].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="staff-note" style={s.fieldLabel}>
                  Note to resident (optional)
                </label>
                <textarea
                  id="staff-note"
                  style={s.textarea}
                  maxLength={1000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              {notice && (
                <div style={notice.kind === 'success' ? s.noticeSuccess : s.noticeError}>
                  {notice.text}
                </div>
              )}

              <div style={s.actions}>
                <Button onClick={handleSave} loading={saving}>
                  Save changes
                </Button>
                <button type="button" style={s.linkButton} onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>
          </Card>
        )}
    </div>
  );
}
