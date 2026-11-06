import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Table from '../../components/Table';
import getResidentsStyles from '../../styles/ResidentsStyles';

const EMPTY_FORM = {
  name: '',
  email: '',
  unit: '',
  phone: '',
  residentType: 'homeowner',
};
const RESIDENT_TYPE_OPTIONS = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'tenant', label: 'Tenant' },
];
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
const actionLabel = (action) =>
  ({
    'resident.created': 'Resident account created',
    'resident.updated': 'Resident details updated',
    'resident.activated': 'Account activated',
    'resident.deactivated': 'Account deactivated',
    'resident.access_reset': 'Access code reset',
  })[action] ?? action;

export default function Residents() {
  const { colors } = useTheme();
  const s = getResidentsStyles(colors);

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [activityRefresh, setActivityRefresh] = useState(0);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [formMode, setFormMode] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [accessCode, setAccessCode] = useState(null);
  const [accessCodeError, setAccessCodeError] = useState('');
  const [accessCodeNotice, setAccessCodeNotice] = useState('');
  const [accessSubmitting, setAccessSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [noticeError, setNoticeError] = useState('');

  const loadResidents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/residents');
      setResidents(data.residents);
      setLoadError('');
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    api('/residents')
      .then((data) => {
        if (!active) return;
        setResidents(data.residents);
        setLoadError('');
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedResidentId = selectedResident?._id;
  useEffect(() => {
    if (!selectedResidentId) return;

    let active = true;
    api(`/residents/${selectedResidentId}`)
      .then((data) => {
        if (!active) return;
        setSelectedResident(data.resident);
        setActivity(data.activity);
        setActivityError('');
      })
      .catch((error) => {
        if (active) setActivityError(error.message);
      })
      .finally(() => {
        if (active) setActivityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedResidentId, activityRefresh]);

  const openResident = (resident) => {
    setActivity([]);
    setActivityError('');
    setActivityLoading(true);
    setSelectedResident(resident);
  };

  const filteredResidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return residents;
    return residents.filter((resident) =>
      [resident.name, resident.email, resident.unit, resident.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [residents, searchQuery]);

  const openAddForm = () => {
    setFormData(EMPTY_FORM);
    setFormError('');
    setEditingId(null);
    setFormMode('add');
  };

  const openEditForm = () => {
    setEditingId(selectedResident._id);
    setFormData({
      name: selectedResident.name ?? '',
      email: selectedResident.email ?? '',
      unit: selectedResident.unit ?? '',
      phone: selectedResident.phone ?? '',
      residentType: selectedResident.residentType ?? 'homeowner',
    });
    setFormError('');
    setSelectedResident(null);
    setFormMode('edit');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSubmitting(true);
    try {
      const isEditing = formMode === 'edit';
      const data = await api(
        isEditing ? `/residents/${editingId}` : '/residents',
        { method: isEditing ? 'PATCH' : 'POST', body: formData }
      );
      if (isEditing) {
        setSelectedResident(data.resident);
        setActivityRefresh((refresh) => refresh + 1);
        setNotice(data.warning || 'Resident details saved.');
      } else {
        setSelectedResident(null);
        setAccessCode(data.accessCode);
        setAccessCodeError('');
        setAccessCodeNotice('');
        setNotice(data.warning || '');
      }
      setFormMode(null);
      await loadResidents();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    setStatusSubmitting(true);
    setNotice('');
    setNoticeError('');
    try {
      const data = await api(`/residents/${statusTarget._id}/status`, {
        method: 'PATCH',
        body: { isActive: !statusTarget.isActive },
      });
      setSelectedResident(data.resident);
      setActivityRefresh((refresh) => refresh + 1);
      setNotice(data.warning || 'Resident account status updated.');
      setStatusTarget(null);
      await loadResidents();
    } catch (error) {
      setNoticeError(error.message);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleAccessReset = async () => {
    if (!selectedResident) return;
    setAccessSubmitting(true);
    setAccessCodeError('');
    setAccessCodeNotice('');
    setNotice('');
    setNoticeError('');
    try {
      const data = await api(`/residents/${selectedResident._id}/reset-access`, {
        method: 'POST',
      });
      setSelectedResident(null);
      setAccessCode(data.accessCode);
      setNotice(data.warning || '');
      await loadResidents();
    } catch (error) {
      setNoticeError(error.message);
    } finally {
      setAccessSubmitting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Resident',
      render: (resident) => (
        <div>
          <div style={s.primaryText}>{resident.name}</div>
          <div style={s.secondaryText}>{resident.email}</div>
        </div>
      ),
    },
    { key: 'unit', label: 'Unit', render: (resident) => resident.unit || '—' },
    {
      key: 'residentType',
      label: 'Type',
      render: (resident) =>
        resident.residentType
          ? resident.residentType[0].toUpperCase() + resident.residentType.slice(1)
          : '—',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (resident) => (
        <Badge variant={resident.isActive ? 'success' : 'neutral'}>
          {resident.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (resident) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={(event) => {
            event.stopPropagation();
            openResident(resident);
            setNotice('');
            setNoticeError('');
          }}
        >
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div style={s.container}>
      <PageHeader
        title="Residents"
        subtitle="Manage resident accounts, access, and account history."
        action={<Button onClick={openAddForm}>Add resident</Button>}
      />

      {notice && <div style={s.successMessage}>{notice}</div>}
      {noticeError && <div style={s.errorMessage}>{noticeError}</div>}
      {loadError && (
        <div style={s.errorMessage}>
          <span>{loadError}</span>
          <Button variant="secondary" size="sm" onClick={() => void loadResidents()}>
            Retry
          </Button>
        </div>
      )}

      <div style={s.toolbar}>
        <div style={s.searchWrapper}>
          <Input
            placeholder="Search by name, email, unit, or phone..."
            aria-label="Search residents"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <span style={s.resultCount}>
          {loading ? 'Loading residents…' : `${filteredResidents.length} residents`}
        </span>
      </div>

      <div style={s.tableCard}>
        <Table
          columns={columns}
          data={filteredResidents}
          onRowClick={(resident) => {
            openResident(resident);
            setNotice('');
            setNoticeError('');
          }}
          emptyMessage={loading ? 'Loading residents…' : 'No residents found.'}
        />
      </div>

      <Modal
        open={Boolean(selectedResident)}
        title="Resident account"
        onClose={() => {
          setSelectedResident(null);
          setActivity([]);
          setActivityError('');
          setNotice('');
          setNoticeError('');
        }}
      >
        {selectedResident && (
          <div style={s.detailsBody}>
            {notice && <div style={s.successMessage}>{notice}</div>}
            {noticeError && <div style={s.errorMessage}>{noticeError}</div>}
            <div style={s.detailsGrid}>
              {[
                ['Full name', selectedResident.name],
                ['Unit', selectedResident.unit || '—'],
                ['Email address', selectedResident.email],
                ['Phone number', selectedResident.phone || '—'],
                [
                  'Resident type',
                  selectedResident.residentType
                    ? selectedResident.residentType[0].toUpperCase() +
                      selectedResident.residentType.slice(1)
                    : 'Not specified',
                ],
                ['Account status', selectedResident.isActive ? 'Active' : 'Inactive'],
                ['Added', formatDate(selectedResident.createdAt)],
              ].map(([label, value]) => (
                <div key={label} style={s.detailRow}>
                  <span style={s.detailLabel}>{label}</span>
                  <span style={s.detailValue}>{value}</span>
                </div>
              ))}
            </div>

            <div style={s.sectionHeader}>
              <h3 style={s.sectionTitle}>Recent activity</h3>
            </div>
            {activityLoading ? (
              <p style={s.mutedText}>Loading activity…</p>
            ) : activityError ? (
              <div style={s.errorMessage}>{activityError}</div>
            ) : activity.length === 0 ? (
              <p style={s.mutedText}>No activity recorded yet.</p>
            ) : (
              <div style={s.activityList}>
                {activity.map((item) => (
                  <div key={item._id} style={s.activityItem}>
                    <div>
                      <div style={s.primaryText}>{actionLabel(item.action)}</div>
                      <div style={s.secondaryText}>
                        By {item.actorName} · {formatDate(item.createdAt)}
                      </div>
                      {item.details?.changes && (
                        <div style={s.activityDetails}>
                          {Object.entries(item.details.changes).map(([field, change]) => (
                            <span key={field}>
                              {field}: {change.from || '—'} → {change.to || '—'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={s.modalActions}>
              <Button
                variant="secondary"
                onClick={() => {
                  setStatusTarget(selectedResident);
                  setSelectedResident(null);
                }}
              >
                {selectedResident.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="secondary"
                loading={accessSubmitting}
                disabled={!selectedResident.isActive}
                onClick={() => void handleAccessReset()}
              >
                Reset access code
              </Button>
              <Button onClick={openEditForm}>Edit details</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(formMode)}
        title={formMode === 'edit' ? 'Edit resident' : 'Add resident'}
        onClose={() => {
          if (!formSubmitting) setFormMode(null);
        }}
      >
        <form onSubmit={handleSave} style={s.form}>
          {formError && <div style={s.errorMessage}>{formError}</div>}
          <Input
            label="Full name"
            placeholder="e.g. Juan dela Cruz"
            maxLength={80}
            autoComplete="name"
            value={formData.name}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, name: event.target.value }))
            }
          />
          <Input
            label="Email address"
            type="email"
            placeholder="e.g. juan@example.com"
            maxLength={254}
            autoComplete="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, email: event.target.value }))
            }
          />
          <Input
            label="Unit"
            placeholder="e.g. Block 1 Lot 1"
            maxLength={40}
            value={formData.unit}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, unit: event.target.value }))
            }
          />
          <Input
            label="Phone number (optional)"
            type="tel"
            placeholder="+63 9XX XXX XXXX"
            maxLength={30}
            autoComplete="tel"
            value={formData.phone}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, phone: event.target.value }))
            }
          />
          <Select
            label="Resident type"
            options={RESIDENT_TYPE_OPTIONS}
            value={formData.residentType}
            onChange={(event) =>
              setFormData((previous) => ({ ...previous, residentType: event.target.value }))
            }
          />
          {formMode === 'add' && (
            <p style={s.helperText}>
              A one-time access code will be shown after the account is created. Share it
              securely with the resident.
            </p>
          )}
          <div style={s.modalActions}>
            <Button
              type="button"
              variant="secondary"
              disabled={formSubmitting}
              onClick={() => setFormMode(null)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={formSubmitting}>
              {formMode === 'edit' ? 'Save changes' : 'Create resident'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(statusTarget)}
        title={`${statusTarget?.isActive ? 'Deactivate' : 'Activate'} resident`}
        onClose={() => {
          if (!statusSubmitting) setStatusTarget(null);
        }}
      >
        {statusTarget && (
          <div style={s.detailsBody}>
            <p style={s.mutedText}>
              {statusTarget.isActive
                ? `Deactivate ${statusTarget.name}'s account? They will no longer be able to sign in.`
                : `Reactivate ${statusTarget.name}'s account?`}
            </p>
            {noticeError && <div style={s.errorMessage}>{noticeError}</div>}
            <div style={s.modalActions}>
              <Button
                variant="secondary"
                disabled={statusSubmitting}
                onClick={() => setStatusTarget(null)}
              >
                Cancel
              </Button>
              <Button loading={statusSubmitting} onClick={() => void handleStatusChange()}>
                Confirm
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(accessCode)}
        title="One-time access code"
        onClose={() => {
          setAccessCode(null);
          setAccessCodeError('');
          setAccessCodeNotice('');
        }}
      >
        {accessCode && (
          <div style={s.detailsBody}>
            <p style={s.mutedText}>
              Share this code with the resident. It can only be used once and expires{' '}
              {formatDate(accessCode.expiresAt)}. The code will not be shown again.
            </p>
            <code style={s.accessCode}>{accessCode.code}</code>
            {accessCodeNotice && <div style={s.successMessage}>{accessCodeNotice}</div>}
            {accessCodeError && <div style={s.errorMessage}>{accessCodeError}</div>}
            <div style={s.modalActions}>
              <Button
                variant="secondary"
                onClick={async () => {
                  setAccessCodeNotice('');
                  try {
                    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
                    await navigator.clipboard.writeText(accessCode.code);
                    setAccessCodeNotice('Code copied to clipboard.');
                  } catch {
                    setAccessCodeError('Could not copy the code. Select and copy it manually.');
                  }
                }}
              >
                Copy code
              </Button>
              <Button
                onClick={() => {
                  setAccessCode(null);
                  setAccessCodeError('');
                  setAccessCodeNotice('');
                }}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
