/**
 * Format a date into a relative time string (e.g. "2h ago", "3 days ago")
 */
export const formatRelativeTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 4) return `${diffWeek}w`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: diffDay > 365 ? 'numeric' : undefined });
};

/**
 * Format a number with K/M suffix (e.g. 1200 → "1.2K")
 */
export const formatCount = (num) => {
  if (!num && num !== 0) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
};

/**
 * Get initials from a display name or username
 */
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Generate a consistent color from a string (for avatar backgrounds)
 */
export const stringToColor = (str) => {
  const colors = [
    '#4F6EF7', '#7C3AED', '#DB2777', '#DC2626',
    '#D97706', '#059669', '#0284C7', '#7C3AED',
  ];
  if (!str) return colors[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
