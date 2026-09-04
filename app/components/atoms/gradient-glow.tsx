type GradientGlowProps = {
  /** Unique suffix for the SVG element ids so several glows can coexist on one page. */
  id: string;
  className?: string;
};

/**
 * Blurred angular-gradient ring used as the landing backdrop.
 * Exported verbatim from Figma (`Ellipse 1469`–`1473`, node 201:28): the conic gradient is
 * painted through a `foreignObject`, clipped to the ring path, then blurred by the SVG filter.
 * `preserveAspectRatio="none"` lets the caller stretch it to the design's box.
 */
export function GradientGlow({ id, className }: GradientGlowProps) {
  const filterId = `glow-blur-${id}`;
  const maskId = `glow-mask-${id}`;
  const clipId = `glow-clip-${id}`;

  return (
    <svg
      aria-hidden
      className={className}
      width="1541.05"
      height="1040.79"
      viewBox="0 0 1541.05 1040.79"
      preserveAspectRatio="none"
      overflow="visible"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filterId})`}>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="156.762" y="156.762" width="1227" height="727" fill="black">
          <rect fill="white" x="156.762" y="156.762" width="1227" height="727" />
        </mask>
        <g clipPath={`url(#${clipId})`} mask={`url(#${maskId})`}>
          <g transform="matrix(6.94714e-05 0.28685 -0.635767 0.000117617 770.523 520.396)">
            <foreignObject x="-1814.67" y="-1814.67" width="3629.34" height="3629.34">
              <div
                style={{
                  background:
                    "conic-gradient(from 90deg,rgba(88, 64, 250, 1) 0deg,rgba(140, 251, 130, 1) 112.5deg,rgba(88, 64, 250, 1) 232.5deg,rgba(140, 251, 130, 1) 324.375deg,rgba(88, 64, 250, 1) 360deg)",
                  height: "100%",
                  width: "100%",
                }}
              />
            </foreignObject>
          </g>
        </g>
      </g>
      <defs>
        <filter
          id={filterId}
          x="0"
          y="0"
          width="1541.05"
          height="1040.79"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="78.6905" result="effect1_foregroundBlur" />
        </filter>
        <clipPath id={clipId}>
          <path d="M1383.66 314.762C1383.66 227.843 1313.2 157.381 1226.28 157.381C1139.36 157.381 1068.9 227.843 1068.9 314.762H1226.28H1383.66ZM472.143 314.762C472.143 227.843 401.681 157.381 314.762 157.381C227.843 157.381 157.381 227.843 157.381 314.762H314.762H472.143ZM1226.28 314.762H1068.9C1068.9 440.161 950.912 568.648 770.523 568.648V726.029V883.41C1093.55 883.41 1383.66 643.637 1383.66 314.762H1226.28ZM770.523 726.029V568.648C590.133 568.648 472.143 440.161 472.143 314.762H314.762H157.381C157.381 643.637 447.493 883.41 770.523 883.41V726.029Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
