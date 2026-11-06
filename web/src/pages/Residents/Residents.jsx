import { useMemo, useState } from 'react';
import { useTheme } from '../../context/useTheme';
import PageHeader from '../../components/PageHeader';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Table from '../../components/Table';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import getResidentsStyles from '../../styles/ResidentsStyles';

// TODO: replace with API
const INITIAL_RESIDENTS = [
  {
    _id: 'res-1',
    name: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    unit: 'Unit 3B',
    phone: '+63 917 123 4567',
    isSenior: true,
    status: 'Active',
  },
  {
    _id: 'res-2',
    name: 'Juan Reyes',
    email: 'juan.reyes@yahoo.com',
    unit: 'Unit 12A',
    phone: '+63 920 345 6789',
    isSenior: false,
    status: 'Active',
  },
  {
    _id: 'res-3',
    name: 'Teresa Cruz',
    email: 'teresa.cruz@outlook.com',
    unit: 'Unit 7C',
    phone: '+63 908 567 8901',
    isSenior: true,
    status: 'Active',
  },
  {
    _id: 'res-4',
    name: 'Pedro Ramos',
    email: 'pedro.ramos@gmail.com',
    unit: 'Unit 15D',
    phone: '+63 915 789 0123',
    isSenior: false,
    status: 'Inactive',
  },
  {
    _id: 'res-5',
    name: 'Corazon Aquino',
    email: 'corazon.aquino@gmail.com',
    unit: 'Unit 1A',
    phone: '+63 927 901 2345',
    isSenior: true,
    status: 'Active',
  },
  {
    _id: 'res-6',
    name: 'Manuel Roxas',
    email: 'manuel.roxas@gmail.com',
    unit: 'Unit 22F',
    phone: '+63 939 123 9876',
    isSenior: false,
    status: 'Active',
  },
];

const SENIOR_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

export default function Residents() {
  const { colors } = useTheme();
  const s = getResidentsStyles(colors);

  const [residents, setResidents] = useState(INITIAL_RESIDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    unit: '',
    isSenior: 'no',
  });
  const [errors, setErrors] = useState({});

  const filteredResidents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return residents;
    return residents.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.unit.toLowerCase().includes(query)
    );
  }, [residents, searchQuery]);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'unit', label: 'Unit' },
    {
      key: 'isSenior',
      label: 'Senior',
      render: (r) => (r.isSenior ? <Badge variant="info">Senior</Badge> : null),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <Badge variant={r.status === 'Active' ? 'success' : 'neutral'}>
          {r.status}
        </Badge>
      ),
    },
  ];

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Enter a valid email address';
    }
    if (!formData.unit.trim()) {
      nextErrors.unit = 'Unit is required';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const newResident = {
      _id: `res-${Date.now()}`,
      name: formData.name.trim(),
      email: formData.email.trim(),
      unit: formData.unit.trim(),
      isSenior: formData.isSenior === 'yes',
      status: 'Active',
      phone: 'N/A',
    };

    setResidents((prev) => [newResident, ...prev]);
    setIsAddModalOpen(false);
    setFormData({ name: '', email: '', unit: '', isSenior: 'no' });
    setErrors({});
  };

  return (
    <div style={s.container}>
      <PageHeader
        title="Residents"
        subtitle="Manage registered homeowners and tenants."
        action={
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add resident
          </Button>
        }
      />

      <div style={s.toolbar}>
        <div style={s.searchWrapper}>
          <Input
            placeholder="Search by name, email, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={s.tableCard}>
        <Table
          columns={columns}
          data={filteredResidents}
          onRowClick={(row) => setSelectedResident(row)}
          emptyMessage="No residents found."
        />
      </div>

      <Modal
        open={Boolean(selectedResident)}
        title="Resident details"
        onClose={() => setSelectedResident(null)}
      >
        {selectedResident && (
          <div style={s.detailsBody}>
            <div style={s.detailsGrid}>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Full name</span>
                <span style={s.detailValue}>{selectedResident.name}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Unit</span>
                <span style={s.detailValue}>{selectedResident.unit}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Email address</span>
                <span style={s.detailValue}>{selectedResident.email}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Phone number</span>
                <span style={s.detailValue}>{selectedResident.phone || 'N/A'}</span>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Senior Citizen</span>
                <div>
                  {selectedResident.isSenior ? (
                    <Badge variant="info">Senior</Badge>
                  ) : (
                    <span style={s.detailValue}>No</span>
                  )}
                </div>
              </div>
              <div style={s.detailRow}>
                <span style={s.detailLabel}>Account status</span>
                <div>
                  <Badge
                    variant={
                      selectedResident.status === 'Active' ? 'success' : 'neutral'
                    }
                  >
                    {selectedResident.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div style={s.modalActions}>
              <Button
                variant="secondary"
                onClick={() => setSelectedResident(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isAddModalOpen}
        title="Add resident"
        onClose={() => {
          setIsAddModalOpen(false);
          setErrors({});
        }}
      >
        <form onSubmit={handleAddSubmit} style={s.form}>
          <Input
            label="Full name"
            placeholder="e.g. Juan dela Cruz"
            value={formData.name}
            error={errors.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="e.g. juan@example.com"
            value={formData.email}
            error={errors.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: e.target.value }));
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
          />
          <Input
            label="Unit"
            placeholder="e.g. Unit 5B"
            value={formData.unit}
            error={errors.unit}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, unit: e.target.value }));
              if (errors.unit) setErrors((prev) => ({ ...prev, unit: undefined }));
            }}
          />
          <Select
            label="Senior citizen"
            options={SENIOR_OPTIONS}
            value={formData.isSenior}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isSenior: e.target.value }))
            }
          />
          <div style={s.modalActions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save resident</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

