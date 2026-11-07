export type Announcement = {
  _id: string;
  title: string;
  date: string;
  publishedAt?: string | null;
  category: 'Notice' | 'Maintenance' | 'Reminder' | 'Fees';
  message: string;
  images?: { mimeType: string; data: string; name?: string }[];
  authorName?: string;
  likesCount?: number;
  commentsCount?: number;
  likedByMe?: boolean;
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

export const ASSISTANCE_TYPES = [
  { value: 'Grocery delivery', label: 'Grocery delivery' },
  { value: 'Medical / Pharmacy run', label: 'Medical / Pharmacy' },
  { value: 'Emergency gate escort', label: 'Gate escort' },
  { value: 'Home maintenance', label: 'Home maintenance' },
] as const;
export type AssistanceType = (typeof ASSISTANCE_TYPES)[number]['value'];
