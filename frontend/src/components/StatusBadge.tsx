import { cn } from "../lib/utils";

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-100 text-blue-700 ring-blue-200",
    dot: "bg-blue-500 animate-soft-pulse",
  },
  attending: {
    label: "Attending",
    className: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  maybe: {
    label: "Maybe",
    className: "bg-amber-100 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  declined: {
    label: "Declined",
    className: "bg-red-100 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
} as const;

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = statusConfig[status] ?? statusConfig.upcoming;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full ring-1 font-medium",
        config.className,
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
