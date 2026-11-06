export const STATUS_META = {
  pending: { label: 'Pending', variant: 'warning' },
  under_review: { label: 'Under review', variant: 'neutral' },
  in_progress: { label: 'In progress', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export const STATUS_OPTIONS = Object.keys(STATUS_META);

// Allowed status moves (same rules as the server). Resolved and rejected are final.
export const NEXT_STATUS = {
  pending: ['under_review', 'rejected'],
  under_review: ['in_progress', 'rejected'],
  in_progress: ['resolved', 'rejected'],
  resolved: [],
  rejected: [],
};

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
];

export const ticketId = (concern) => `GP-${String(concern._id).slice(-6).toUpperCase()}`;

export const residentName = (concern) => concern.resident?.name || 'Unknown';

export const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
