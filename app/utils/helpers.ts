import { PROBLEM_TYPES, INDIAN_STATES, DISTRICTS } from './constants';

/**
 * Formats a date string or Date object into a human-readable string.
 * Example: "13 Apr 2026, 10:30 AM"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

/**
 * Returns a relative time string like "2 min ago", "1 hour ago", "Yesterday".
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;

  return formatDate(d);
}

/**
 * Formats a phone number with +91 prefix for display.
 * Input: "9876543210" -> "+91 98765 43210"
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // Remove leading 91 if present
  const number = cleaned.startsWith('91') && cleaned.length > 10
    ? cleaned.slice(2)
    : cleaned;

  if (number.length === 10) {
    return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
  }

  return `+91 ${number}`;
}

/**
 * Truncates text to a maximum length, adding ellipsis if needed.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

/**
 * Looks up the label for a problem type value.
 */
export function getProblemTypeLabel(value: string): string {
  const found = PROBLEM_TYPES.find((pt) => pt.value === value);
  return found ? found.label : value;
}

/**
 * Looks up the label for a state value.
 */
export function getStateLabel(value: string): string {
  const found = INDIAN_STATES.find((s) => s.value === value);
  return found ? found.label : value;
}

/**
 * Looks up the label for a district value within a state.
 */
export function getDistrictLabel(state: string, district: string): string {
  const stateDistricts = DISTRICTS[state];
  if (!stateDistricts) return district;

  const found = stateDistricts.find((d) => d.value === district);
  return found ? found.label : district;
}
