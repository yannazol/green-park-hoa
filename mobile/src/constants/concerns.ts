import type { BadgeVariant } from '@/components/badge';

export type ConcernStatus = 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';

export type Concern = {
  _id: string;
  type: 'complaint' | 'suggestion' | 'inquiry';
  category: string;
  subject: string;
  description: string;
  status: ConcernStatus;
  staffNote?: string;
  photos: string[];
  createdAt: string;
};

export const STATUS_META: Record<ConcernStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'info' },
  in_progress: { label: 'In progress', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export type ConcernType = Concern['type'];

export const TYPE_OPTIONS: { value: ConcernType; label: string }[] = [
  { value: 'complaint', label: 'Complaint' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'inquiry', label: 'Inquiry' },
];

export const CATEGORIES = [
  'parking',
  'security',
  'noise',
  'roads',
  'street lights',
  'garbage',
  'landscaping',
  'common facilities',
  'other',
] as const;

export type ConcernCategory = (typeof CATEGORIES)[number];

export const CATEGORY_OPTIONS = CATEGORIES.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

