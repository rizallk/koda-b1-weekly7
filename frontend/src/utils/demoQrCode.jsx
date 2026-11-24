export function DemoQrCode() {
  return (
    <svg
      viewBox="0 0 120 120"
      className="size-40 text-[#182220]"
      fill="currentColor"
      aria-label="Kode QR Demo"
    >
      {/* Finder Patterns */}
      <path d="M8 8h32v32H8V8zm6 6v20h20V14H14zm5 5h10v10H19V19z" />
      <path d="M80 8h32v32H80V8zm6 6v20h20V14H86zm5 5h10v10H91V19z" />
      <path d="M8 80h32v32H8V80zm6 6v20h20V86H14zm5 5h10v10H19V91z" />
      {/* Data Modules */}
      <rect x="48" y="8" width="6" height="6" />
      <rect x="60" y="8" width="12" height="6" />
      <rect x="48" y="20" width="12" height="6" />
      <rect x="66" y="20" width="6" height="12" />
      <rect x="48" y="32" width="6" height="12" />
      <rect x="8" y="48" width="12" height="6" />
      <rect x="26" y="48" width="14" height="6" />
      <rect x="48" y="48" width="12" height="12" />
      <rect x="66" y="48" width="6" height="6" />
      <rect x="80" y="48" width="12" height="6" />
      <rect x="100" y="48" width="12" height="6" />
      <rect x="14" y="60" width="12" height="6" />
      <rect x="34" y="66" width="14" height="6" />
      <rect x="54" y="66" width="12" height="6" />
      <rect x="74" y="60" width="12" height="12" />
      <rect x="94" y="60" width="6" height="12" />
      <rect x="106" y="66" width="6" height="12" />
      <rect x="48" y="80" width="6" height="12" />
      <rect x="60" y="80" width="14" height="6" />
      <rect x="80" y="80" width="12" height="12" />
      <rect x="98" y="86" width="14" height="6" />
      <rect x="48" y="100" width="18" height="6" />
      <rect x="72" y="98" width="6" height="14" />
      <rect x="86" y="100" width="12" height="12" />
      <rect x="104" y="104" width="8" height="8" />
    </svg>
  );
}
