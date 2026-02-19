import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(date: string | Date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDateTime(date: string | Date) {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function isUpcoming(date: string | Date) {
  return new Date(date) > new Date();
}

export function isPast(date: string | Date) {
  return new Date(date) < new Date();
}

export function getInitials(
  firstName?: string | null,
  lastName?: string | null
) {
  const f = firstName?.charAt(0) ?? "";
  const l = lastName?.charAt(0) ?? "";
  return (f + l).toUpperCase() || "?";
}

export function relativeTime(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const absDiffMs = Math.abs(diffMs);
  const isFuture = diffMs > 0;

  const minutes = Math.floor(absDiffMs / (1000 * 60));
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60));
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(days / 7);

  let label: string;
  if (minutes < 1) {
    label = "just now";
    return label;
  } else if (minutes < 60) {
    label = `${minutes}m`;
  } else if (hours < 24) {
    label = `${hours}h`;
  } else if (days < 7) {
    label = `${days}d`;
  } else if (weeks < 5) {
    label = `${weeks}w`;
  } else {
    return formatDate(date);
  }

  return isFuture ? `in ${label}` : `${label} ago`;
}

export function displayName(
  firstName?: string | null,
  lastName?: string | null,
  email?: string
): string {
  const full = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return full || email || "Unknown";
}

export function isToday(date: string | Date): boolean {
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}
