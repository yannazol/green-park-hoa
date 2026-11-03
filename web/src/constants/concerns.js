export const STATUS_META = {
  pending: { label: 'Pending', variant: 'warning' },
  in_progress: { label: 'In progress', variant: 'info' },
  resolved: { label: 'Resolved', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'danger' },
};

export const STATUS_OPTIONS = Object.keys(STATUS_META);
