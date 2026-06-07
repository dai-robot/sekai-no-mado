type P = { className?: string }

export function BottleIcon({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4v3l1.4 2.2A4 4 0 0 1 16 9.4V20a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V9.4a4 4 0 0 1 .6-2.2L10 5z" />
      <path d="M9 13h6" />
      <path d="M10.5 16.5l3-1.5" />
    </svg>
  )
}

export function WindowIcon({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M12 3v18M4 12h16" />
    </svg>
  )
}

export function CameraIcon({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}
