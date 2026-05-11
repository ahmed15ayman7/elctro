/**
 * Decorative SVG — takeout bag + tray + warm glow (no external assets).
 * Matches the guest-checkout illustration style for a cohesive brand feel.
 */
export default function EmptyCartIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="emptyCartGlow" x1="32" y1="0" x2="288" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(24 95% 53%)" stopOpacity="0.28" />
          <stop offset="1" stopColor="hsl(24 95% 53%)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="emptyCartBag" x1="88" y1="72" x2="232" y2="248" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(33 100% 96%)" />
          <stop offset="0.45" stopColor="hsl(28 85% 92%)" />
          <stop offset="1" stopColor="hsl(24 55% 88%)" />
        </linearGradient>
        <linearGradient id="emptyCartHandle" x1="120" y1="40" x2="200" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(24 90% 52%)" />
          <stop offset="1" stopColor="hsl(20 85% 44%)" />
        </linearGradient>
        <filter id="emptyCartSoft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="b" />
          <feOffset dx="0" dy="3" in="b" result="o" />
          <feMerge>
            <feMergeNode in="o" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="160" cy="252" rx="118" ry="16" fill="url(#emptyCartGlow)" />
      {/* Handle */}
      <path
        d="M112 108c0-36 28-64 64-64s64 28 64 64"
        stroke="url(#emptyCartHandle)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
        opacity="0.92"
      />
      {/* Bag body */}
      <path
        d="M72 108h176l-16 152c-2 18-18 32-36 32H124c-18 0-34-14-36-32L72 108z"
        fill="url(#emptyCartBag)"
        stroke="hsl(24 30% 78%)"
        strokeWidth="2"
        filter="url(#emptyCartSoft)"
      />
      {/* Inner fold */}
      <path d="M96 132h128" stroke="hsl(24 25% 82%)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path d="M108 156h104" stroke="hsl(24 20% 88%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
      {/* “Empty” dashed tray */}
      <rect
        x="118"
        y="168"
        width="84"
        height="52"
        rx="10"
        stroke="hsl(24 95% 48%)"
        strokeWidth="2.5"
        strokeDasharray="8 6"
        fill="hsl(24 100% 98%)"
        fillOpacity="0.55"
      />
      {/* Small burger hint */}
      <g transform="translate(200 52)">
        <circle cx="0" cy="0" r="22" fill="hsl(24 95% 53%)" fillOpacity="0.18" />
        <ellipse cx="0" cy="4" rx="18" ry="5" fill="hsl(33 90% 72%)" />
        <ellipse cx="0" cy="0" rx="16" ry="4" fill="hsl(25 45% 32%)" />
        <ellipse cx="0" cy="-4" rx="17" ry="5" fill="hsl(33 85% 68%)" />
      </g>
      <g transform="translate(92 64)">
        <circle cx="0" cy="0" r="16" fill="hsl(142 50% 45%)" fillOpacity="0.2" />
        <path d="M-10 6 Q0 -8 10 6" stroke="hsl(142 45% 42%)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
