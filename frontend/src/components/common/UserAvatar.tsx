"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initialsFromName(name: string): string {
  const t = name.trim();
  if (!t) return "";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const a = parts[0][0];
    const b = parts[1][0];
    if (a && b) return (a + b).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: "h-8 w-8 min-h-8 min-w-8 text-[10px]",
  md: "h-9 w-9 min-h-9 min-w-9 text-xs",
  lg: "h-10 w-10 min-h-10 min-w-10 text-sm",
} as const;

export default function UserAvatar({
  name,
  imageUrl,
  className,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: keyof typeof sizeClasses;
}) {
  const initials = initialsFromName(name);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {imageUrl ? <AvatarImage src={imageUrl} alt="" referrerPolicy="no-referrer" /> : null}
      <AvatarFallback delayMs={imageUrl ? 200 : 0}>
        {initials ? (
          <span aria-hidden>{initials}</span>
        ) : (
          <img src="/default-avatar.svg" alt="" className="h-[55%] w-[55%] object-contain opacity-90" />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
