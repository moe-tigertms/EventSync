import { cn, getInitials } from "../lib/utils";

interface AvatarProps {
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

export function Avatar({
  imageUrl,
  firstName,
  lastName,
  email,
  size = "sm",
  className,
}: AvatarProps) {
  const sizeClass = sizeMap[size];
  const fallback =
    firstName || lastName
      ? getInitials(firstName, lastName)
      : email?.charAt(0).toUpperCase() ?? "?";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={firstName ?? "User"}
        className={cn(
          "rounded-full ring-2 ring-white object-cover",
          sizeClass,
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold ring-2 ring-white",
        sizeClass,
        className
      )}
    >
      {fallback}
    </div>
  );
}
