import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** When set, the mark is exposed to assistive tech (e.g. link has visible text). */
  title?: string;
};

/**
 * Inline wordmark + icon: hot food (steam + cloche) + spark for “Elctro”.
 * Uses `currentColor` so parent can set `text-primary` etc.
 */
export function ElctroLogo({ className, title }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* Plate */}
      <ellipse
        cx="20"
        cy="27.5"
        rx="13"
        ry="3.8"
        className="fill-current opacity-[0.18]"
      />
      <path
        d="M7 27.5h26"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="opacity-90"
      />
      {/* Cloche dome */}
      <path
        d="M9 24.5c0-7.5 5.5-13.5 11-13.5s11 6 11 13.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="opacity-95"
      />
      {/* Steam */}
      <path
        d="M14 9.5c-1.2-1.8 1.4-3.4 0.2-5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-55"
      />
      <path
        d="M20 8c-1.2-1.9 1.4-3.5 0.2-5.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-55"
      />
      <path
        d="M26 9.5c-1.2-1.8 1.4-3.4 0.2-5.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-55"
      />
      {/* Spark — quick delivery / “electro” */}
      <path
        d="M30,9 L26.5,16 H29 l-4,8 2,-6 h-2.5 L30,9 z"
        fill="currentColor"
        className="opacity-90"
      />
    </svg>
  );
}

/**
 * Horizontal lockup: icon + “Elctro” for nav headers.
 */
export function ElctroLogoLockup({
  className,
  wordmarkClassName,
}: {
  className?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ElctroLogo className="h-9 w-9 text-primary" />
      <span
        className={cn(
          "text-xl font-bold tracking-tight text-foreground",
          wordmarkClassName
        )}
      >
        Elctro
      </span>
    </span>
  );
}
