import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/useTheme';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import PageHeader from '../../components/PageHeader';
import Select from '../../components/Select';
import SlidePanel from '../../components/SlidePanel';
import Table from '../../components/Table';
import getReservationsStyles from '../../styles/ReservationsStyles';

const PAGE_SIZE = 10;
const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Cancelled', label: 'Cancelled' },
];
const STATUS_VARIANTS = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Cancelled: 'neutral',
};
const VIEW_OPTIONS = [
  { value: 'list', label: 'List view' },
  { value: 'calendar', label: 'Calendar view' },
];

const residentName = (reservation) =>
  reservation.resident?.name ?? reservation.residentName ?? 'Resident';
const residentUnit = (reservation) =>
  reservation.resident?.unit ?? reservation.unit ?? '';
const formatDate = (date) => {
  if (!date) return '—';
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};
const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '—';
const formatMoney = (centavos) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
    (centavos ?? 0) / 100
  );

function Calendar({ month, reservations, onMonthChange, onSelect, s }) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const start = new Date(year, monthIndex, 1 - firstDay.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
    const key = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    return {
      date,
      key,
      inMonth: date.getMonth() === monthIndex,
      reservations: reservations.filter((reservation) => reservation.date === key),
    };
  });

  return (
    <div style={s.calendar}>
      <div style={s.calendarHeader}>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Previous month"
          onClick={() => onMonthChange(new Date(year, monthIndex - 1, 1))}
        >
          ‹
        </Button>
        <h2 style={s.calendarTitle}>
          {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </h2>
        <Button
          variant="secondary"
          size="sm"
          aria-label="Next month"
          onClick={() => onMonthChange(new Date(year, monthIndex + 1, 1))}
        >
          ›
        </Button>
      </div>
      <div style={s.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} style={s.calendarWeekday}>
            {day}
          </div>
        ))}
        {days.map((day) => (
          <div
            key={day.key}
            style={{
              ...s.calendarDay,
              ...(day.inMonth ? {} : s.calendarDayOutside),
            }}
          >
            <span style={s.calendarDayNumber}>{day.date.getDate()}</span>
            <div style={s.calendarEvents}>
              {day.reservations.map((reservation) => (
                <button
                  type="button"
                  key={reservation._id}
                  style={s.calendarEvent}
                  onClick={() => onSelect(reservation)}
                  title={`${reservation.facilityName} · ${residentName(reservation)} · ${reservation.timeSlot}`}
                >
                  <span>{reservation.facilityName}</span>
                  <span style={s.calendarEventMeta}>{reservation.timeSlot}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p style={s.calendarHint}>Select a booking to view details and manage its status.</p>
    </div>
  );
}

export default function Reservations() {
  const { colors } = useTheme();
  const s = getReservationsStyles(colors);
  const [reservations, setReservations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [view, setView] = useState('list');
  const [page, setPage] = useState(1);
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api('/reservations');
      setReservations(data.reservations);
      setError('');
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api('/reservations'), api('/reservations/facilities')])
      .then(([reservationData, facilityData]) => {
        if (!active) return;
        setReservations(reservationData.reservations);
        setFacilities(facilityData.facilities);
        setError('');
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredReservations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return reservations.filter((reservation) => {
      if (statusFilter !== 'all' && reservation.status !== statusFilter) return false;
      if (
        facilityFilter !== 'all' &&
        reservation.facilityName !== facilityFilter
      ) {
        return false;
      }
      if (!query) return true;
      return [
        residentName(reservation),
        residentUnit(reservation),
        reservation.resident?.email,
        reservation.facilityName,
        reservation.purpose,
        reservation.timeSlot,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query));
    });
  }, [reservations, search, statusFilter, facilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredReservations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const openReservation = (reservation) => {
    setSelectedReservation(reservation);
    setAdminNote(reservation.adminNote ?? '');
    setActionError('');
    setActionMessage('');
  };

  const updateReservation = async (payload, successMessage) => {
    if (!selectedReservation) return;
    setUpdatingStatus(true);
    setActionError('');
    setActionMessage('');
    try {
      const data = await api(`/reservations/${selectedReservation._id}`, {
        method: 'PATCH',
        body: payload,
      });
      setSelectedReservation(data.reservation);
      setAdminNote(data.reservation.adminNote ?? '');
      setReservations((previous) =>
        previous.map((item) => (item._id === data.reservation._id ? data.reservation : item))
      );
      setActionMessage(successMessage);
    } catch (updateError) {
      setActionError(updateError.message);
      if (updateError.status === 409) void load();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveNote = async (event) => {
    event.preventDefault();
    if (!selectedReservation) return;
    setSavingNote(true);
    setActionError('');
    setActionMessage('');
    try {
      const data = await api(`/reservations/${selectedReservation._id}`, {
        method: 'PATCH',
        body: { adminNote },
      });
      setSelectedReservation(data.reservation);
      setAdminNote(data.reservation.adminNote ?? '');
      setReservations((previous) =>
        previous.map((item) => (item._id === data.reservation._id ? data.reservation : item))
      );
      setActionMessage('Administrator note saved.');
    } catch (saveError) {
      setActionError(saveError.message);
    } finally {
      setSavingNote(false);
    }
  };

  const columns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (reservation) => (
        <div>
          <div style={s.primaryText}>{residentName(reservation)}</div>
          {residentUnit(reservation) && (
            <div style={s.secondaryText}>{residentUnit(reservation)}</div>
          )}
        </div>
      ),
    },
    { key: 'facilityName', label: 'Facility' },
    { key: 'date', label: 'Date', render: (reservation) => formatDate(reservation.date) },
    {
      key: 'timeSlot',
      label: 'Time slot',
      render: (reservation) => reservation.timeSlot,
    },
    {
      key: 'feeCentavos',
      label: 'Fee',
      render: (reservation) => formatMoney(reservation.feeCentavos),
    },
    {
      key: 'status',
      label: 'Status',
      render: (reservation) => (
        <Badge variant={STATUS_VARIANTS[reservation.status] ?? 'neutral'}>
          {reservation.status}
        </Badge>
      ),
    },
  ];

  const facilityOptions = [
    { value: 'all', label: 'All facilities' },
    ...facilities.map((facility) => ({ value: facility.name, label: facility.name })),
    ...reservations
      .filter((reservation) => !facilities.some((facility) => facility.name === reservation.facilityName))
      .map((reservation) => reservation.facilityName)
      .filter((name, index, list) => list.indexOf(name) === index)
      .map((name) => ({ value: name, label: name })),
  ];

  const updateFilter = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  return (
    <div style={s.container}>
      <PageHeader
        title="Reservations"
        subtitle="Review facility requests, resolve conflicts, and manage bookings."
      />

      {error && (
        <div style={s.errorMessage}>
          <span>{error}</span>
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Retry
          </Button>
        </div>
      )}

      <div style={s.toolbar}>
        <div style={s.searchWrapper}>
          <Input
            placeholder="Search residents, facilities, or purpose..."
            aria-label="Search reservations"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          aria-label="Filter by status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={updateFilter(setStatusFilter)}
        />
        <Select
          aria-label="Filter by facility"
          options={facilityOptions}
          value={facilityFilter}
          onChange={updateFilter(setFacilityFilter)}
        />
        <Select
          aria-label="Reservations view"
          options={VIEW_OPTIONS}
          value={view}
          onChange={(event) => setView(event.target.value)}
        />
      </div>

      <div style={s.summaryLine}>
        {loading
          ? 'Loading reservations…'
          : `${filteredReservations.length} booking${filteredReservations.length === 1 ? '' : 's'}`}
      </div>

      {view === 'list' ? (
        <>
          <div style={s.tableCard}>
            <Table
              columns={columns}
              data={pageItems}
              onRowClick={openReservation}
              emptyMessage={loading ? 'Loading reservations…' : 'No reservations found.'}
            />
          </div>
          <div style={s.pagination}>
            <span style={s.summaryLine}>
              Page {currentPage} of {totalPages}
            </span>
            <div style={s.paginationButtons}>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Calendar
          month={calendarMonth}
          reservations={filteredReservations}
          onMonthChange={setCalendarMonth}
          onSelect={openReservation}
          s={s}
        />
      )}

      <SlidePanel
        open={Boolean(selectedReservation)}
        title="Reservation details"
        subtitle={
          selectedReservation
            ? `${selectedReservation.facilityName} · ${formatDate(selectedReservation.date)}`
            : ''
        }
        onClose={() => {
          setSelectedReservation(null);
          setActionError('');
          setActionMessage('');
        }}
      >
        {selectedReservation && (
          <>
            <div style={s.detailsGrid}>
              {[
                ['Resident', residentName(selectedReservation)],
                ['Unit', residentUnit(selectedReservation) || '—'],
                ['Email', selectedReservation.resident?.email || '—'],
                ['Phone', selectedReservation.resident?.phone || '—'],
                ['Facility', selectedReservation.facilityName],
                ['Date', formatDate(selectedReservation.date)],
                [
                  'Time slot',
                  `${selectedReservation.timeSlot}${selectedReservation.timeRange ? ` · ${selectedReservation.timeRange}` : ''}`,
                ],
                ['Rental fee', formatMoney(selectedReservation.feeCentavos)],
                ['Fee details', selectedReservation.feeDescription || '—'],
                ['Submitted', formatDateTime(selectedReservation.createdAt)],
              ].map(([label, value]) => (
                <div key={label} style={s.detailRow}>
                  <span style={s.detailLabel}>{label}</span>
                  <span style={s.detailValue}>{value}</span>
                </div>
              ))}
            </div>

            <div style={s.detailRow}>
              <span style={s.detailLabel}>Status</span>
              <Badge variant={STATUS_VARIANTS[selectedReservation.status] ?? 'neutral'}>
                {selectedReservation.status}
              </Badge>
            </div>
            <div style={s.detailRow}>
              <span style={s.detailLabel}>Purpose / resident notes</span>
              <p style={s.purpose}>{selectedReservation.purpose || 'No purpose provided.'}</p>
            </div>

            <form style={s.noteForm} onSubmit={saveNote}>
              <label htmlFor="reservation-admin-note" style={s.detailLabel}>
                Administrator notes
              </label>
              <textarea
                id="reservation-admin-note"
                rows={4}
                maxLength={2000}
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Add internal notes for this booking..."
                style={s.noteInput}
              />
              <div style={s.noteActions}>
                <span style={s.noteCount}>{adminNote.length}/2000</span>
                <Button type="submit" size="sm" loading={savingNote}>
                  Save note
                </Button>
              </div>
            </form>

            {selectedReservation.statusHistory?.length > 0 && (
              <div style={s.historySection}>
                <h3 style={s.historyTitle}>Booking history</h3>
                {selectedReservation.statusHistory
                  .slice()
                  .reverse()
                  .map((entry, index) => (
                    <div key={`${entry.at}-${index}`} style={s.historyItem}>
                      <strong>{entry.status}</strong>
                      <span>
                        {entry.by?.name ? ` by ${entry.by.name}` : ''} · {formatDateTime(entry.at)}
                      </span>
                      {entry.note && <p style={s.historyNote}>{entry.note}</p>}
                    </div>
                  ))}
              </div>
            )}

            {actionError && <div style={s.errorMessage}>{actionError}</div>}
            {actionMessage && <div style={s.successMessage}>{actionMessage}</div>}
          </>
        )}
        <div style={s.panelActions}>
          {selectedReservation?.status === 'Pending' && (
            <>
              <Button
                disabled={updatingStatus}
                onClick={() => void updateReservation({ status: 'Approved' }, 'Reservation approved.')}
              >
                Approve
              </Button>
              <Button
                variant="secondary"
                disabled={updatingStatus}
                onClick={() => void updateReservation({ status: 'Rejected' }, 'Reservation rejected.')}
              >
                Reject
              </Button>
            </>
          )}
          {['Pending', 'Approved'].includes(selectedReservation?.status) && (
            <Button
              variant="secondary"
              disabled={updatingStatus}
              onClick={() =>
                void updateReservation({ status: 'Cancelled' }, 'Booking cancelled.')
              }
            >
              Cancel booking
            </Button>
          )}
        </div>
      </SlidePanel>
    </div>
  );
}
