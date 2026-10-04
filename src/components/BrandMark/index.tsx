export function BrandMark({ size = 36 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
    <rect width="40" height="40" rx="12" fill="#175cda" />
    <path d="M26 12h-7a8 8 0 000 16h7" stroke="white" strokeWidth="4" strokeLinecap="round" />
    <path d="M23 17l5 3-5 3" stroke="#91e0c5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
