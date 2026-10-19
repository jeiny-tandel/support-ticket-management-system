// Formats a date into "MMM D, YYYY" (e.g., "Oct 19, 2026")
export const formatDate = (
  dateInput?: string | Date | null,
  fallback: string = '—',
): string => {
  if (!dateInput) return fallback;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Formats a time into "hh:mm" (e.g., "06:05 PM")
export const formatTime = (
  dateInput?: string | Date | null,
  fallback: string = '—',
): string => {
  if (!dateInput) return fallback;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formats a date and time into "MMM D, YYYY, h:mm A" (e.g., "Oct 19, 2026, 6:05 PM")
export const formatDateTime = (
  dateInput?: string | Date | null,
  fallback: string = '—',
): string => {
  if (!dateInput) return fallback;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};
