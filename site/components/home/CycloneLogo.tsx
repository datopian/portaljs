type CycloneLogoProps = {
  size?: number
  spin?: boolean
  className?: string
}

/**
 * The PortalJS cyclone mark: a two-armed spiral drawn as a single gradient
 * stroke that sweeps inward to a deep-blue core. Inline SVG so it scales
 * crisply and can animate without shipping an asset. Gradient + core colors
 * come straight from DESIGN.md.
 */
export default function CycloneLogo({
  size = 96,
  spin = true,
  className = '',
}: CycloneLogoProps) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{ width: size, height: size, lineHeight: 0 }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        className={spin ? 'cyclone-spin' : ''}
      >
        <defs>
          <linearGradient id="cyclone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="55%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {/* two spiral arms, 180° apart, sweeping inward toward the core */}
        <path
          d="M50 6 C 78 6 94 28 94 50 C 94 70 78 84 58 84 C 44 84 34 74 34 62 C 34 53 41 46 50 46"
          stroke="url(#cyclone-grad)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M50 94 C 22 94 6 72 6 50 C 6 30 22 16 42 16 C 56 16 66 26 66 38 C 66 47 59 54 50 54"
          stroke="url(#cyclone-grad)"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {/* deep-blue core */}
        <circle cx="50" cy="50" r="7" fill="#1e3a8a" />
      </svg>
      <style jsx>{`
        .cyclone-spin {
          animation: cyclone-rotate 14s linear infinite;
          transform-origin: 50% 50%;
        }
        @keyframes cyclone-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .cyclone-spin {
            animation: none;
          }
        }
      `}</style>
    </span>
  )
}
