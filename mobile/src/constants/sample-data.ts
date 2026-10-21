// TODO: replace with API

export type MonthlyDues = {
  month: string;
  amount: string;
  status: 'Due soon' | 'Paid' | 'Overdue';
  dueDate: string;
};

export type DuesSummary = {
  outstandingBalance: string;
  status: 'Paid' | 'Due soon' | 'Overdue';
  dueDate: string;
  paidThrough: string;
};

export type PaymentStatus = 'Verified' | 'Pending' | 'Rejected';

export type PaymentRecord = {
  id: string;
  month: string;
  amount: string;
  referenceNumber: string;
  status: PaymentStatus;
};

export type Announcement = {
  id: string;
  title: string;
  date: string;
  preview: string;
};

export type Facility = {
  id: string;
  name: string;
  description: string;
  fee: string;
};

export type ReservationStatus = 'Pending' | 'Approved' | 'Rejected';

export type Reservation = {
  id: string;
  facility: string;
  date: string;
  timeSlot: string;
  status: ReservationStatus;
};

export const TIME_SLOT_OPTIONS = [
  { value: 'Morning', label: 'Morning' },
  { value: 'Afternoon', label: 'Afternoon' },
  { value: 'Evening', label: 'Evening' },
] as const;

export type TimeSlot = (typeof TIME_SLOT_OPTIONS)[number]['value'];

export const VEHICLE_TYPES = [
  { value: 'Car', label: 'Car' },
  { value: 'Motorcycle', label: 'Motorcycle' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Van', label: 'Van' },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]['value'];

export type Vehicle = {
  id: string;
  plateNumber: string;
  makeModel: string;
  type: VehicleType;
};

export type GateEntryFee = {
  id: string;
  category: string;
  amount: string;
};

export const ASSISTANCE_TYPES = [
  { value: 'Grocery delivery', label: 'Grocery delivery' },
  { value: 'Medical / Pharmacy run', label: 'Medical / Pharmacy' },
  { value: 'Emergency gate escort', label: 'Gate escort' },
  { value: 'Home maintenance', label: 'Home maintenance' },
] as const;

export type AssistanceType = (typeof ASSISTANCE_TYPES)[number]['value'];

export const sampleDues: MonthlyDues = {
  month: 'October 2026',
  amount: '₱2,500.00',
  status: 'Due soon',
  dueDate: 'Due on October 25, 2026',
};

export const sampleDuesSummary: DuesSummary = {
  outstandingBalance: '₱2,500.00',
  status: 'Due soon',
  dueDate: 'Due on October 25, 2026',
  paidThrough: 'Paid through September 2026',
};

export const samplePaymentHistory: PaymentRecord[] = [
  {
    id: 'pay-1',
    month: 'September 2026',
    amount: '₱2,500.00',
    referenceNumber: 'REF-2026-09281',
    status: 'Verified',
  },
  {
    id: 'pay-2',
    month: 'August 2026',
    amount: '₱2,500.00',
    referenceNumber: 'REF-2026-08149',
    status: 'Verified',
  },
  {
    id: 'pay-3',
    month: 'July 2026',
    amount: '₱2,500.00',
    referenceNumber: 'REF-2026-07312',
    status: 'Verified',
  },
  {
    id: 'pay-4',
    month: 'June 2026',
    amount: '₱2,500.00',
    referenceNumber: 'REF-2026-06105',
    status: 'Rejected',
  },
];

export const sampleAnnouncement: Announcement = {
  id: 'ann-1',
  title: 'Annual General Assembly & Clubhouse Tree Trimming',
  date: 'October 10, 2026',
  preview:
    'Join us for the annual homeowners assembly this coming Saturday at the Clubhouse. Tree trimming operations will also commence along Main Avenue.',
};

export const sampleFacilities: Facility[] = [
  {
    id: 'fac-1',
    name: 'Clubhouse',
    description: 'Spacious venue for community gatherings, private parties, and meetings.',
    fee: '₱1,500 per 4-hour block',
  },
  {
    id: 'fac-2',
    name: 'Court',
    description: 'Full-sized covered basketball and badminton court with lighting.',
    fee: '₱200 per hour (day) / ₱350 per hour (night)',
  },
  {
    id: 'fac-3',
    name: 'Swimming pool',
    description: 'Adult and kiddie pools open for resident leisure and private celebrations.',
    fee: '₱100 per guest / ₱2,000 exclusive rental',
  },
  {
    id: 'fac-4',
    name: 'Function hall',
    description: 'Air-conditioned hall equipped with sound system and projector.',
    fee: '₱2,500 per 4-hour block',
  },
];

export const sampleReservations: Reservation[] = [
  {
    id: 'res-1',
    facility: 'Clubhouse',
    date: '2026-10-24',
    timeSlot: 'Afternoon',
    status: 'Approved',
  },
  {
    id: 'res-2',
    facility: 'Court',
    date: '2026-10-28',
    timeSlot: 'Evening',
    status: 'Pending',
  },
  {
    id: 'res-3',
    facility: 'Function hall',
    date: '2026-11-05',
    timeSlot: 'Morning',
    status: 'Rejected',
  },
];

export const sampleVehicles: Vehicle[] = [
  {
    id: 'veh-1',
    plateNumber: 'ABC 1234',
    makeModel: 'Toyota Vios (Silver)',
    type: 'Car',
  },
  {
    id: 'veh-2',
    plateNumber: 'XYZ 7890',
    makeModel: 'Honda Click 125i (Black)',
    type: 'Motorcycle',
  },
];

export const sampleGateEntryFees: GateEntryFee[] = [
  { id: 'fee-1', category: 'Delivery trucks (4-wheeler)', amount: '₱50.00' },
  { id: 'fee-2', category: 'Commercial delivery (6-wheeler+)', amount: '₱150.00' },
  { id: 'fee-3', category: 'Contractor / Construction workers (per day)', amount: '₱20.00' },
  { id: 'fee-4', category: 'Visitor vehicle (overnight pass)', amount: '₱100.00' },
  { id: 'fee-5', category: 'Tricycle / Taxi drop-off', amount: 'Free' },
];

export const sampleSeniorAssistanceDesc =
  'Special community assistance programs, medical wellness check-ins, and mobility support for senior residents.';
