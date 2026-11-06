import { useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import getReservationsStyles from '../../styles/ReservationsStyles';

// TODO: replace with API
const INITIAL_RESERVATIONS = [
  {
    _id: 'resv-1',
    resident: 'Maria Santos',
    unit: 'Unit 3B',
    facility: 'Clubhouse',
    date: '2026-11-15',
    timeSlot: '01:00 PM - 05:00 PM',
    fee: 2500,
    status: 'Approved',
    purpose: 'Birthday celebration',
  },
  {
    _id: 'resv-2',
    resident: 'Juan Reyes',
    unit: 'Unit 12A',
    facility: 'Clubhouse',
    date: '2026-11-15',
    timeSlot: '01:00 PM - 05:00 PM',
    fee: 2500,
    status: 'Pending',
    purpose: 'Family anniversary gathering',
  },
  {
    _id: 'resv-3',
    resident: 'Teresa Cruz',
    unit: 'Unit 7C',
    facility: 'Court',
    date: '2026-11-16',
    timeSlot: '08:00 AM - 10:00 AM',
    fee: 500,
    status: 'Pending',
    purpose: 'Basketball scrimmage with neighbors',
  },
  {
    _id: 'resv-4',
    resident: 'Pedro Ramos',
    unit: 'Unit 15D',
    facility: 'Swimming pool',
    date: '2026-11-18',
    timeSlot: '02:00 PM - 06:00 PM',
    fee: 1000,
    status: 'Approved',
    purpose: 'Kids weekend swimming party',
  },
  {
    _id: 'resv-5',
    resident: 'Corazon Aquino',
    unit: 'Unit 1A',
    facility: 'Function hall',
    date: '2026-11-20',
    timeSlot: '06:00 PM - 10:00 PM',
    fee: 3500,
    status: 'Pending',
    purpose: 'Committee thanksgiving dinner',
  },
  {
    _id: 'resv-6',
    resident: 'Manuel Roxas',
    unit: 'Unit 22F',
    facility: 'Clubhouse',
    date: '2026-11-10',
    timeSlot: '09:00 AM - 01:00 PM',
    fee: 2500,
    status: 'Rejected',
    purpose: 'Private workshop seminar',
  },
];

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const STATUS_VARIANTS = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
};

const FACILITY_OPTIONS = [
  { value: 'all', label: 'All facilities' },
  { value: 'Clubhouse', label: 'Clubhouse' },
  { value: 'Court', label: 'Court' },
  { value: 'Swimming pool', label: 'Swimming pool' },
  { value: 'Function hall', label: 'Function hall' },
];

export default function Reservations() {
  const { colors } = useTheme();
  const s = getReservationsStyles(colors);

  const [reservations, setResidents] = useState(INITIAL_RESERVATIONS);
  const [statusFilter, setStatusFilter] = useState('All');
  const [facilityFilter, setFacilityFilter] = useState('all');

  const [selectedReservation, setSelectedReservation] = useState(null);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesStatus =
        statusFilter === 'All' ||
        r.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesFacility =
        facilityFilter === 'all' || r.facility === facilityFilter;
      return matchesStatus && matchesFacility;
    });
  }, [reservations, statusFilter, facilityFilter]);

  const conflictReservation = useMemo(() => {
    if (!selectedReservation || selectedReservation.status === 'Approved') {
      return null;
    }
    return reservations.find(
      (other) =>
        other._id !== selectedReservation._id &&
        other.status === 'Approved' &&
        other.facility === selectedReservation.facility &&
        other.date === selectedReservation.date &&
        other.timeSlot === selectedReservation.timeSlot
    );
  }, [selectedReservation, reservations]);

  const handleApprove = () => {
    if (conflictReservation) return;

    setResidents((prev) =>
      prev.map((r) =>
        r._id === selectedReservation._id ? { ...r, status: 'Approved' } : r
      )
    );
    setSelectedReservation((prev) => ({ ...prev, status: 'Approved' }));
  };

  const handleReject = () => {
    setResidents((prev) =>
      prev.map((r) =>
        r._id === selectedReservation._id ? { ...r, status: 'Rejected' } : r
      )
    );
    setSelectedReservation((prev) => ({ ...prev, status: 'Rejected' }));
  };

  const columns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (r) => `${r.resident}${r.unit ? ` (${r.unit})` : ''}`,
    },
    { key: 'facility', label: 'Facility' },
    {
      key: 'date',
      label: 'Date',
      render: (r) => new Date(r.date).toLocaleDateString(),
    },
    { key: 'timeSlot', label: 'Time slot' },
    {
      key: 'fee',
      label: 'Fee',
      render: (r) => `₱${r.fee.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={STATUS_VARIANTS[r.status] || 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <div style={s.container}>
      <PageHeader
        title="Reservations"
        subtitle="Manage facility bookings, review pending requests, and check availability."
      />

      <div style={s.toolbar}>
        <div style={s.chips}>
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              type="button"
              style={statusFilter === status ? s.chipActive : s.chip}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        <div style={s.facilitySelectWrapper}>
          <Select
            options={FACILITY_OPTIONS}
            value={facilityFilter}
            onChange={(e) => setFacilityFilter(e.target.value)}
          />
        </div>
      </div>

      <div style={s.tableCard}>
        <Table
          columns={columns}
          data={filteredReservations}
          onRowClick={(row) => setSelectedReservation(row)}
          emptyMessage="No reservations found."
        />
      </div>

      <Modal
        open={Boolean(selectedReservation)}
        title="Reservation details"
        onClose={() => setSelectedReservation(null)}
      >
        {selectedReservation && (
          <div style={s.modalBody}>
            <div style={s.detailsGrid}>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Resident</span>
                <span style={s.detailValue}>
                  {selectedReservation.resident} ({selectedReservation.unit})
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Facility</span>
                <span style={s.detailValue}>{selectedReservation.facility}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Date</span>
                <span style={s.detailValue}>
                  {new Date(selectedReservation.date).toLocaleDateString()}
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Time slot</span>
                <span style={s.detailValue}>{selectedReservation.timeSlot}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Rental fee</span>
                <span style={s.detailValue}>
                  ₱{selectedReservation.fee.toLocaleString()}
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Status</span>
                <div>
                  <Badge
                    variant={
                      STATUS_VARIANTS[selectedReservation.status] || 'neutral'
                    }
                  >
                    {selectedReservation.status}
                  </Badge>
                </div>
              </div>
            </div>

            {selectedReservation.purpose && (
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Purpose of booking</span>
                <span style={{ ...s.detailValue, fontWeight: 400 }}>
                  {selectedReservation.purpose}
                </span>
              </div>
            )}

            {conflictReservation && (
              <div style={s.conflictBox}>
                <strong>Scheduling conflict:</strong> {selectedReservation.facility}{' '}
                is already booked and approved for{' '}
                <strong>{conflictReservation.resident}</strong> (
                {conflictReservation.unit}) on{' '}
                <strong>
                  {new Date(conflictReservation.date).toLocaleDateString()}
                </strong>{' '}
                during <strong>{conflictReservation.timeSlot}</strong>.
                Approval is blocked.
              </div>
            )}

            <div style={s.modalActions}>
              {selectedReservation.status === 'Pending' && (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={Boolean(conflictReservation)}
                  >
                    Approve
                  </Button>
                  <Button variant="secondary" onClick={handleReject}>
                    Reject
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                onClick={() => setSelectedReservation(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

