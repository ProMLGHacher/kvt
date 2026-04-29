export function LogoMark() {
  return (
    <svg aria-hidden="true" className="size-14" fill="none" viewBox="0 0 64 64">
      <path
        d="M32 12a20 20 0 1 1 0 40 20 20 0 0 1-9.2-2.2L15 53l2.3-8A19.8 19.8 0 0 1 12 32a20 20 0 0 1 20-20Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path d="M18.7 46.2 15 53l7.2-2.8c-1.4-.2-2.6-.9-3.5-2.1Z" fill="currentColor" />
      <circle cx="39.6" cy="24.7" r="3.6" fill="var(--color-primary)" />
      <path
        d="M39.4 37.9c1.1 1.2 2.2 1.9 3.4 1.9.9 0 1.9-.3 2.7-.8"
        stroke="var(--color-primary)"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  )
}

export function JoinIcon() {
  return (
    <svg aria-hidden="true" className="size-12" fill="none" viewBox="0 0 64 64">
      <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="3" />
      <circle cx="43" cy="25" r="7" stroke="currentColor" strokeWidth="3" />
      <path
        d="M10 49c2.6-8 9.4-12 14-12s11.4 4 14 12M34 40c3-2.3 6-3 9-3 4 0 9 3.4 11 10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  )
}
