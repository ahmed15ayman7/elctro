/**
 * Large decorative SVG: guest + lock — signals “sign in required” without relying on external assets.
 */
export default function GuestCheckoutIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="guestCheckoutGlow" x1="40" y1="0" x2="280" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(24 95% 53%)" stopOpacity="0.35" />
          <stop offset="1" stopColor="hsl(24 95% 53%)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="guestCheckoutLock" x1="200" y1="48" x2="272" y2="140" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(24 95% 48%)" />
          <stop offset="1" stopColor="hsl(28 90% 40%)" />
        </linearGradient>
      </defs>
      <ellipse cx="160" cy="248" rx="120" ry="18" fill="url(#guestCheckoutGlow)" />
      {/* Takeout bag (left) — pairs with account metaphor like reference UI */}
      <g transform="translate(18 122)" opacity="0.95">
        <path
          d="M6 28h76l-7 68H13L6 28z"
          fill="white"
          fillOpacity="0.92"
          stroke="hsl(24 90% 52%)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 28c0-14 11-24 24-24s24 10 24 24"
          stroke="hsl(24 90% 48%)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M20 46h48" stroke="hsl(24 40% 85%)" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* User silhouette */}
      <circle cx="138" cy="108" r="44" className="fill-primary/90" />
      <path
        d="M58 248c0-52 36-88 80-88s80 36 80 88"
        className="fill-primary/55"
      />
      {/* Lock badge */}
      <g transform="translate(198 36)">
        <rect x="0" y="28" width="88" height="72" rx="14" fill="url(#guestCheckoutLock)" />
        <path
          d="M24 28V22a20 20 0 0 1 40 0v6"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
        <circle cx="44" cy="64" r="8" fill="white" fillOpacity="0.9" />
      </g>
    </svg>
  );
}
