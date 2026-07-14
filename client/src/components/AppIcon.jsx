const ICON_PATHS = {
  activity: (
    <>
      <path d="M4 12h3l2-6 4 12 2-6h5" />
    </>
  ),
  archive: (
    <>
      <path d="M4 7h16M6 7v11h12V7" />
      <path d="M9 11h6" />
      <path d="M5 4h14v3H5z" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="m8.5 11.5-1 8 4.5-2.5 4.5 2.5-1-8" />
    </>
  ),
  briefcase: (
    <>
      <path d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
      <rect x="4" y="6" width="16" height="13" rx="2" />
      <path d="M4 11h16M10 11v2h4v-2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3v4M16 3v4M4 10h16" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12.5 2.3 2.3 4.8-5.4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: (
    <>
      <path d="M7 7l10 10M17 7 7 17" />
    </>
  ),
  dollar: (
    <>
      <path d="M12 3v18" />
      <path d="M16 7.5c-.8-1-2.1-1.5-3.8-1.5-2 0-3.2 1-3.2 2.4 0 1.6 1.4 2.2 3.5 2.8 2.2.6 3.7 1.4 3.7 3.3 0 1.7-1.5 3-4 3-1.9 0-3.4-.6-4.3-1.8" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 13h6M9 17h6" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13 7 4h10l3 9" />
      <path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5h-4l-2 3h-4l-2-3H4Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 8 4-8 4-8-4 8-4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 17 8 4 8-4" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  review: (
    <>
      <path d="M5 4h14v14H5z" />
      <path d="M8 8h8M8 12h5M8 16h3" />
    </>
  ),
  rocket: (
    <>
      <path d="M13.5 4.5c2.3-.9 4.6-.8 6-.5.3 1.4.4 3.7-.5 6-1.2 3-4.1 5.4-7.5 6.8L7.2 12.5c1.4-3.4 3.8-6.8 6.3-8Z" />
      <path d="m7.5 13-3 3-.5 4 4-.5 3-3" />
      <path d="M14.5 8.5h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="5.5" />
      <path d="m15 15 4 4" />
    </>
  ),
  send: (
    <>
      <path d="m4 12 16-8-5 16-3-7-8-1Z" />
      <path d="m12 13 8-9" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M5 20h14" />
    </>
  ),
  users: (
    <>
      <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
      <circle cx="12" cy="9" r="3" />
      <path d="M20 19c0-1.7-1-3.1-2.5-3.7M17 6.4a2.5 2.5 0 0 1 0 5" />
      <path d="M4 19c0-1.7 1-3.1 2.5-3.7M7 6.4a2.5 2.5 0 0 0 0 5" />
    </>
  ),
  zap: (
    <>
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </>
  ),
};

const AppIcon = ({ name, className = '', size = 18 }) => {
  const icon = ICON_PATHS[name] || ICON_PATHS.spark;

  return (
    <svg
      aria-hidden="true"
      className={`app-icon ${className}`.trim()}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}>
      {icon}
    </svg>
  );
};

export default AppIcon;
