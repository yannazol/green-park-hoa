import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import PageHeader from '../../components/PageHeader';
import Tabs from '../../components/Tabs';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import { api } from '../../services/api';
import { useAuth } from '../../context/useAuth';
import getServicesStyles from '../../styles/ServicesStyles';

const TABS = [
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'gate-fees', label: 'Gate-entry fees' },
  { key: 'senior', label: 'Senior assistance' },
];

const ASSISTANCE_STATUS_VARIANTS = {
  Pending: 'warning',
  'In progress': 'info',
  Done: 'success',
  Cancelled: 'neutral',
};

const ASSISTANCE_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In progress', label: 'In progress' },
  { value: 'Done', label: 'Done' },
  { value: 'Cancelled', label: 'Cancelled' },
];

const money = (centavos) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(centavos / 100);

export default function Services() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const s = getServicesStyles(colors);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [gateFees, setGateFees] = useState([]);
  const [requests, setRequests] = useState([]);
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [feeToEdit, setFeeToEdit] = useState(null);
  const [feeCategory, setFeeCategory] = useState('');
  const [feeDescription, setFeeDescription] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [feeError, setFeeError] = useState('');
  const [feeSaving, setFeeSaving] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState('Pending');
  const [adminNote, setAdminNote] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSaving, setRequestSaving] = useState(false);

  const fetchServices = useCallback(() => Promise.allSettled([
      api('/community/vehicles'),
      api('/community/gate-fees'),
      api('/community/assistance'),
  ]), []);

  const applyServices = useCallback((results) => {
    const failures = [];
    if (results[0].status === 'fulfilled') setVehicles(results[0].value.vehicles);
    else failures.push(results[0].reason?.message || 'Could not load vehicle registrations.');
    if (results[1].status === 'fulfilled') setGateFees(results[1].value.fees);
    else failures.push(results[1].reason?.message || 'Could not load gate-entry fees.');
    if (results[2].status === 'fulfilled') setRequests(results[2].value.requests);
    else failures.push(results[2].reason?.message || 'Could not load assistance requests.');
    setError(failures.join(' '));
    setLoading(false);
  }, []);

  const load = useCallback(async () => {
    applyServices(await fetchServices());
  }, [applyServices, fetchServices]);

  useEffect(() => {
    let active = true;
    fetchServices().then((results) => {
      if (active) applyServices(results);
    });
    return () => { active = false; };
  }, [applyServices, fetchServices]);

  const filteredVehicles = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter((vehicle) => {
      const resident = vehicle.resident || {};
      return [
        vehicle.plateNumber,
        vehicle.makeModel,
        vehicle.type,
        resident.name,
        resident.email,
        resident.unit,
      ].some((value) => String(value || '').toLowerCase().includes(query));
    });
  }, [vehicles, vehicleSearch]);

  const openNewFee = () => {
    setFeeToEdit(null);
    setFeeCategory('');
    setFeeDescription('');
    setFeeAmount('');
    setFeeError('');
    setFeeDialogOpen(true);
  };

  const openEditFee = (fee) => {
    setFeeToEdit(fee);
    setFeeCategory(fee.category);
    setFeeDescription(fee.description);
    setFeeAmount((fee.amountCentavos / 100).toFixed(2));
    setFeeError('');
    setFeeDialogOpen(true);
  };

  const saveFee = async (event) => {
    event.preventDefault();
    if (!feeCategory.trim() || !feeDescription.trim()) {
      setFeeError('Category and description are required.');
      return;
    }
    if (!/^\d+(?:\.\d{1,2})?$/.test(feeAmount.trim())) {
      setFeeError('Enter a non-negative amount with up to two decimal places.');
      return;
    }
    setFeeSaving(true);
    setFeeError('');
    try {
      await api(
        feeToEdit ? `/community/gate-fees/${feeToEdit._id}` : '/community/gate-fees',
        {
          method: feeToEdit ? 'PATCH' : 'POST',
          body: {
            category: feeCategory.trim(),
            description: feeDescription.trim(),
            amount: Number(feeAmount),
          },
        },
      );
      setFeeDialogOpen(false);
      await load();
    } catch (saveError) {
      setFeeError(saveError instanceof Error ? saveError.message : 'Could not save this fee.');
    } finally {
      setFeeSaving(false);
    }
  };

  const openRequest = (request) => {
    setSelectedRequest(request);
    setRequestStatus(request.status);
    setAdminNote(request.adminNote || '');
    setRequestError('');
  };

  const saveRequest = async (event) => {
    event.preventDefault();
    if (adminNote.length > 1000) {
      setRequestError('Notes must be 1,000 characters or fewer.');
      return;
    }
    setRequestSaving(true);
    setRequestError('');
    try {
      await api(`/community/assistance/${selectedRequest._id}`, {
        method: 'PATCH',
        body: { status: requestStatus, adminNote },
      });
      setSelectedRequest(null);
      await load();
    } catch (saveError) {
      setRequestError(saveError instanceof Error ? saveError.message : 'Could not update this request.');
    } finally {
      setRequestSaving(false);
    }
  };

  const vehicleColumns = [
    { key: 'plateNumber', label: 'Plate number' },
    { key: 'makeModel', label: 'Make / Model' },
    { key: 'type', label: 'Type' },
    { key: 'resident', label: 'Resident', render: (row) => row.resident?.name || '—' },
    { key: 'unit', label: 'Unit', render: (row) => row.resident?.unit || '—' },
  ];

  const gateFeeColumns = [
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    {
      key: 'amountCentavos',
      label: 'Fee amount',
      render: (row) => (row.amountCentavos === 0 ? 'Free' : money(row.amountCentavos)),
    },
    ...(isAdmin ? [{
      key: 'actions',
      label: 'Actions',
      render: (row) => <Button size="sm" variant="secondary" onClick={() => openEditFee(row)}>Edit fee</Button>,
    }] : []),
  ];

  const assistanceColumns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (row) => `${row.resident?.name || 'Unknown resident'}${row.resident?.unit ? ` (${row.resident.unit})` : ''}`,
    },
    { key: 'type', label: 'Assistance type' },
    {
      key: 'createdAt',
      label: 'Submitted',
      render: (row) => new Date(row.createdAt).toLocaleDateString('en-PH'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge variant={ASSISTANCE_STATUS_VARIANTS[row.status] || 'neutral'}>{row.status}</Badge>,
    },
  ];

  return (
    <div style={s.container}>
      <PageHeader
        title="Vehicles & Senior assistance"
        subtitle="Manage resident vehicle registrations, entry gate fees, and senior citizen assistance."
      />
      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {error ? (
        <div role="alert" style={{ color: colors.dangerText }}>
          {error} <Button size="sm" variant="secondary" onClick={() => { setLoading(true); void load(); }}>Retry</Button>
        </div>
      ) : null}
      {loading ? <p role="status">Loading community services…</p> : null}

      {activeTab === 'vehicles' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchWrapper}>
              <Input
                placeholder="Search by plate, make, model, resident, unit..."
                value={vehicleSearch}
                onChange={(event) => setVehicleSearch(event.target.value)}
              />
            </div>
          </div>
          <div style={s.tableCard}>
            <Table columns={vehicleColumns} data={filteredVehicles} emptyMessage="No registered vehicles found." />
          </div>
        </>
      )}

      {activeTab === 'gate-fees' && (
        <>
          {isAdmin ? <div style={s.toolbar}><Button onClick={openNewFee}>Add gate fee</Button></div> : null}
          <div style={s.tableCard}>
            <Table columns={gateFeeColumns} data={gateFees} emptyMessage="No gate-entry fees configured." />
          </div>
        </>
      )}

      {activeTab === 'senior' && (
        <div style={s.tableCard}>
          <Table
            columns={assistanceColumns}
            data={requests}
            onRowClick={openRequest}
            emptyMessage="No senior assistance requests found."
          />
        </div>
      )}

      <Modal
        open={feeDialogOpen}
        title={feeToEdit ? `Edit fee: ${feeToEdit.category}` : 'Add gate-entry fee'}
        onClose={() => setFeeDialogOpen(false)}
      >
        <form onSubmit={saveFee} style={s.form}>
          <Input label="Category" value={feeCategory} maxLength={100} onChange={(event) => setFeeCategory(event.target.value)} />
          <Input label="Description" value={feeDescription} maxLength={500} onChange={(event) => setFeeDescription(event.target.value)} />
          <Input
            label="Fee amount (₱)"
            type="number"
            min="0"
            step="0.01"
            value={feeAmount}
            error={feeError}
            onChange={(event) => setFeeAmount(event.target.value)}
          />
          {feeError ? <p role="alert" style={{ color: colors.dangerText }}>{feeError}</p> : null}
          <div style={s.modalActions}>
            <Button type="button" variant="secondary" disabled={feeSaving} onClick={() => setFeeDialogOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={feeSaving}>{feeSaving ? 'Saving…' : 'Save fee'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(selectedRequest)} title="Senior assistance request" onClose={() => setSelectedRequest(null)}>
        {selectedRequest ? (
          <form onSubmit={saveRequest} style={s.form}>
            <div style={s.detailsGrid}>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Resident</span>
                <span style={s.detailValue}>
                  {selectedRequest.resident?.name || 'Unknown resident'}
                  {selectedRequest.resident?.unit ? ` (${selectedRequest.resident.unit})` : ''}
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Assistance type</span>
                <span style={s.detailValue}>{selectedRequest.type}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Submitted</span>
                <span style={s.detailValue}>{new Date(selectedRequest.createdAt).toLocaleString('en-PH')}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Current status</span>
                <Badge variant={ASSISTANCE_STATUS_VARIANTS[selectedRequest.status] || 'neutral'}>{selectedRequest.status}</Badge>
              </div>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>Request details</span>
              <span style={s.detailText}>{selectedRequest.details}</span>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>Activity history</span>
              {(selectedRequest.statusHistory || []).map((entry, index) => (
                <span key={`${entry.at}-${index}`} style={s.detailText}>
                  {entry.status} · {new Date(entry.at).toLocaleString('en-PH')}
                  {entry.note ? ` — ${entry.note}` : ''}
                </span>
              ))}
            </div>
            <Select
              label="Update status"
              options={ASSISTANCE_STATUS_OPTIONS}
              value={requestStatus}
              onChange={(event) => setRequestStatus(event.target.value)}
            />
            <Input
              label="HOA note"
              value={adminNote}
              maxLength={1000}
              error={requestError}
              onChange={(event) => setAdminNote(event.target.value)}
            />
            {requestError ? <p role="alert" style={{ color: colors.dangerText }}>{requestError}</p> : null}
            <div style={s.modalActions}>
              <Button type="button" variant="secondary" disabled={requestSaving} onClick={() => setSelectedRequest(null)}>Cancel</Button>
              <Button type="submit" disabled={requestSaving}>{requestSaving ? 'Saving…' : 'Save update'}</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
