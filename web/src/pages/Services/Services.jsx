import { useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import PageHeader from '../../components/PageHeader';
import Tabs from '../../components/Tabs';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Modal from '../../components/Modal';
import getServicesStyles from '../../styles/ServicesStyles';

// TODO: replace with API
const INITIAL_VEHICLES = [
  {
    _id: 'veh-1',
    plate: 'ABC-1234',
    makeModel: 'Toyota Vios (Silver)',
    type: 'Sedan',
    resident: 'Maria Santos',
    unit: 'Unit 3B',
  },
  {
    _id: 'veh-2',
    plate: 'XYZ-5678',
    makeModel: 'Mitsubishi Montero (Black)',
    type: 'SUV',
    resident: 'Juan Reyes',
    unit: 'Unit 12A',
  },
  {
    _id: 'veh-3',
    plate: 'NBD-9012',
    makeModel: 'Honda Click 125i (Red)',
    type: 'Motorcycle',
    resident: 'Teresa Cruz',
    unit: 'Unit 7C',
  },
  {
    _id: 'veh-4',
    plate: 'CAR-3456',
    makeModel: 'Ford Ranger (White)',
    type: 'Pickup',
    resident: 'Pedro Ramos',
    unit: 'Unit 15D',
  },
  {
    _id: 'veh-5',
    plate: 'WXY-7890',
    makeModel: 'Nissan Serena (Gray)',
    type: 'Van',
    resident: 'Corazon Aquino',
    unit: 'Unit 1A',
  },
];

// TODO: replace with API
const INITIAL_GATE_FEES = [
  {
    _id: 'fee-1',
    category: 'Delivery Truck (Heavy / 6-wheeler+)',
    amount: 150,
    description: 'Large cargo deliveries and heavy construction supply vehicles.',
  },
  {
    _id: 'fee-2',
    category: 'Commercial Van / Light Truck (4-wheeler)',
    amount: 75,
    description: 'Couriers, furniture moving vans, and contractor pickup trucks.',
  },
  {
    _id: 'fee-3',
    category: 'Contractor Daily Entry Pass',
    amount: 50,
    description: 'Day pass per vehicle for home renovation contractors and technicians.',
  },
  {
    _id: 'fee-4',
    category: 'Visitor Overnight Parking',
    amount: 100,
    description: 'Overnight visitor parking pass at designated slots (10:00 PM - 6:00 AM).',
  },
  {
    _id: 'fee-5',
    category: 'Commercial Taxi / Ride-hailing Entry',
    amount: 0,
    description: 'Free entry for verified Grab/taxi picking up or dropping off residents.',
  },
];

// TODO: replace with API
const INITIAL_ASSISTANCE_REQUESTS = [
  {
    _id: 'ast-1',
    resident: 'Maria Santos',
    unit: 'Unit 3B',
    type: 'Heavy Package & Grocery Carry',
    date: '2026-11-06T09:00:00Z',
    status: 'Pending',
    notes: 'Needs help carrying 3 cases of bottled water from gate to unit.',
  },
  {
    _id: 'ast-2',
    resident: 'Teresa Cruz',
    unit: 'Unit 7C',
    type: 'Pharmacy & Medicine Delivery',
    date: '2026-11-05T14:30:00Z',
    status: 'In progress',
    notes: 'Prescription pickup from Mercury Drug village branch requested.',
  },
  {
    _id: 'ast-3',
    resident: 'Corazon Aquino',
    unit: 'Unit 1A',
    type: 'Clubhouse Shuttle Transport',
    date: '2026-11-04T11:00:00Z',
    status: 'Done',
    notes: 'Assisted golf-cart transport to village clinic medical checkup.',
  },
  {
    _id: 'ast-4',
    resident: 'Generoso Reyes',
    unit: 'Unit 9E',
    type: 'Minor Home Repair / Ladder Assistance',
    date: '2026-11-06T10:15:00Z',
    status: 'Pending',
    notes: 'Assistance requested to replace high porch ceiling light bulb.',
  },
];

const TABS = [
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'gate-fees', label: 'Gate-entry fees' },
  { key: 'senior', label: 'Senior assistance' },
];

const ASSISTANCE_STATUS_VARIANTS = {
  Pending: 'warning',
  'In progress': 'info',
  Done: 'success',
};

const ASSISTANCE_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In progress', label: 'In progress' },
  { value: 'Done', label: 'Done' },
];

export default function Services() {
  const { colors } = useTheme();
  const s = getServicesStyles(colors);

  const [activeTab, setActiveTab] = useState('vehicles');

  // Vehicles state
  const [vehicles] = useState(INITIAL_VEHICLES);
  const [vehicleSearch, setVehicleSearch] = useState('');

  // Gate fees state
  const [gateFees, setGateFees] = useState(INITIAL_GATE_FEES);
  const [feeToEdit, setFeeToEdit] = useState(null);
  const [feeAmount, setFeeAmount] = useState('');
  const [feeError, setFeeError] = useState('');

  // Senior assistance state
  const [requests, setRequests] = useState(INITIAL_ASSISTANCE_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestStatus, setRequestStatus] = useState('Pending');

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    if (!query) return vehicles;
    return vehicles.filter(
      (v) =>
        v.plate.toLowerCase().includes(query) ||
        v.makeModel.toLowerCase().includes(query) ||
        v.type.toLowerCase().includes(query) ||
        v.resident.toLowerCase().includes(query) ||
        v.unit.toLowerCase().includes(query)
    );
  }, [vehicles, vehicleSearch]);

  // Edit fee handlers
  const handleOpenEditFee = (fee) => {
    setFeeToEdit(fee);
    setFeeAmount(String(fee.amount));
    setFeeError('');
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    const parsedAmount = Number(feeAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      setFeeError('Please enter a valid non-negative amount');
      return;
    }

    setGateFees((prev) =>
      prev.map((f) =>
        f._id === feeToEdit._id ? { ...f, amount: parsedAmount } : f
      )
    );
    setFeeToEdit(null);
  };

  // Senior assistance handlers
  const handleOpenRequestModal = (request) => {
    setSelectedRequest(request);
    setRequestStatus(request.status);
  };

  const handleSaveRequestStatus = (e) => {
    e.preventDefault();
    setRequests((prev) =>
      prev.map((r) =>
        r._id === selectedRequest._id ? { ...r, status: requestStatus } : r
      )
    );
    setSelectedRequest(null);
  };

  // Table column definitions
  const vehicleColumns = [
    { key: 'plate', label: 'Plate number' },
    { key: 'makeModel', label: 'Make / Model' },
    { key: 'type', label: 'Type' },
    { key: 'resident', label: 'Resident' },
    { key: 'unit', label: 'Unit' },
  ];

  const gateFeeColumns = [
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' },
    {
      key: 'amount',
      label: 'Fee amount',
      render: (r) => (r.amount === 0 ? 'Free' : `₱${r.amount.toLocaleString()}`),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <Button size="sm" variant="secondary" onClick={() => handleOpenEditFee(r)}>
          Edit fee
        </Button>
      ),
    },
  ];

  const assistanceColumns = [
    {
      key: 'resident',
      label: 'Resident',
      render: (r) => `${r.resident}${r.unit ? ` (${r.unit})` : ''}`,
    },
    { key: 'type', label: 'Assistance type' },
    {
      key: 'date',
      label: 'Date',
      render: (r) => new Date(r.date).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={ASSISTANCE_STATUS_VARIANTS[r.status] || 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  return (
    <div style={s.container}>
      <PageHeader
        title="Vehicles & Senior assistance"
        subtitle="Manage resident vehicle registrations, entry gate fees, and senior citizen assistance."
      />

      <Tabs tabs={TABS} value={activeTab} onChange={setActiveTab} />

      {activeTab === 'vehicles' && (
        <>
          <div style={s.toolbar}>
            <div style={s.searchWrapper}>
              <Input
                placeholder="Search by plate, make, model, resident, unit..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
              />
            </div>
          </div>
          <div style={s.tableCard}>
            <Table
              columns={vehicleColumns}
              data={filteredVehicles}
              emptyMessage="No registered vehicles found."
            />
          </div>
        </>
      )}

      {activeTab === 'gate-fees' && (
        <div style={s.tableCard}>
          <Table
            columns={gateFeeColumns}
            data={gateFees}
            emptyMessage="No gate-entry fees configured."
          />
        </div>
      )}

      {activeTab === 'senior' && (
        <div style={s.tableCard}>
          <Table
            columns={assistanceColumns}
            data={requests}
            onRowClick={handleOpenRequestModal}
            emptyMessage="No senior assistance requests found."
          />
        </div>
      )}

      {/* Edit Fee Modal */}
      <Modal
        open={Boolean(feeToEdit)}
        title={feeToEdit ? `Edit fee: ${feeToEdit.category}` : 'Edit fee'}
        onClose={() => setFeeToEdit(null)}
      >
        {feeToEdit && (
          <form onSubmit={handleSaveFee} style={s.form}>
            <p style={s.detailText}>{feeToEdit.description}</p>
            <Input
              label="Fee amount (₱)"
              type="number"
              min="0"
              step="1"
              value={feeAmount}
              error={feeError}
              onChange={(e) => {
                setFeeAmount(e.target.value);
                if (feeError) setFeeError('');
              }}
            />
            <div style={s.modalActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setFeeToEdit(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Save fee</Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Senior Assistance Modal */}
      <Modal
        open={Boolean(selectedRequest)}
        title="Senior assistance request"
        onClose={() => setSelectedRequest(null)}
      >
        {selectedRequest && (
          <form onSubmit={handleSaveRequestStatus} style={s.form}>
            <div style={s.detailsGrid}>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Resident</span>
                <span style={s.detailValue}>
                  {selectedRequest.resident} ({selectedRequest.unit})
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Assistance type</span>
                <span style={s.detailValue}>{selectedRequest.type}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Request date</span>
                <span style={s.detailValue}>
                  {new Date(selectedRequest.date).toLocaleDateString()}
                </span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Current status</span>
                <div>
                  <Badge
                    variant={
                      ASSISTANCE_STATUS_VARIANTS[selectedRequest.status] ||
                      'neutral'
                    }
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
            </div>

            {selectedRequest.notes && (
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Request notes</span>
                <span style={s.detailText}>{selectedRequest.notes}</span>
              </div>
            )}

            <Select
              label="Update status"
              options={ASSISTANCE_STATUS_OPTIONS}
              value={requestStatus}
              onChange={(e) => setRequestStatus(e.target.value)}
            />

            <div style={s.modalActions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </Button>
              <Button type="submit">Update status</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

