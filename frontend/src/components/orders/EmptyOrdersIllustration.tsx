/**
 * Decorative SVG — receipt + delivery path + warm glow (matches cart/checkout empty style).
 */
export default function EmptyOrdersIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="emptyOrdersGlow" x1="24" y1="0" x2="296" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(24 95% 53%)" stopOpacity="0.26" />
          <stop offset="1" stopColor="hsl(24 95% 53%)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="emptyOrdersPaper" x1="96" y1="56" x2="224" y2="232" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(0 0% 100%)" />
          <stop offset="1" stopColor="hsl(28 40% 96%)" />
        </linearGradient>
        <linearGradient id="emptyOrdersAccent" x1="200" y1="48" x2="288" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="hsl(24 95% 52%)" />
          <stop offset="1" stopColor="hsl(20 88% 44%)" />
        </linearGradient>
        <filter id="emptyOrdersShadow" x="-12%" y="-12%" width="124%" height="124%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.12" />
        </filter>
      </defs>
      <ellipse cx="160" cy="252" rx="118" ry="16" fill="url(#emptyOrdersGlow)" />
      <path
        d="M40 200 Q120 120 200 100 T300 72"
        stroke="hsl(24 90% 52%)"
        strokeWidth="3"
        strokeOpacity="0.35"
        strokeLinecap="round"
        strokeDasharray="10 8"
        fill="none"
      />
      <circle cx="300" cy="72" r="10" fill="url(#emptyOrdersAccent)" opacity="0.9" />
      <path d="M294 72l4 4 8-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect
        x="88"
        y="48"
        width="144"
        height="188"
        rx="12"
        fill="url(#emptyOrdersPaper)"
        stroke="hsl(24 25% 88%)"
        strokeWidth="2"
        filter="url(#emptyOrdersShadow)"
      />
      <rect x="108" y="76" width="72" height="6" rx="3" fill="hsl(24 90% 52%)" fillOpacity="0.35" />
      <rect x="108" y="94" width="104" height="5" rx="2.5" fill="hsl(24 15% 82%)" />
      <rect x="108" y="108" width="96" height="5" rx="2.5" fill="hsl(24 12% 86%)" />
      <rect x="108" y="122" width="88" height="5" rx="2.5" fill="hsl(24 12% 86%)" />
      <rect x="108" y="148" width="48" height="5" rx="2.5" fill="hsl(24 12% 88%)" />
      <g transform="translate(196 168)">
        <circle r="28" fill="hsl(24 95% 53%)" fillOpacity="0.14" />
        <ellipse cy="6" rx="20" ry="5" fill="hsl(33 85% 70%)" />
        <ellipse cy="0" rx="18" ry="4" fill="hsl(25 40% 30%)" />
        <ellipse cy="-6" rx="19" ry="5" fill="hsl(33 80% 65%)" />
      </g>
      <g transform="translate(52 188)">
        <path
          d="M0-16c10 0 18 8 18 18 0 14-18 34-18 34S-18 32-18 2c0-10 8-18 18-18z"
          fill="hsl(24 90% 52%)"
          fillOpacity="0.85"
        />
        <circle cy="-2" r="5" fill="white" fillOpacity="0.95" />
      </g>
    </svg>
  );
}
