// Small stroke icons drawn inline, so the dashboard ships no icon library.
type IconProps = { size?: number };

const svg = (size: number, path: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {path}
  </svg>
);

export const SearchIcon = ({ size = 18 }: IconProps) =>
  svg(
    size,
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>,
  );

export const FilterIcon = ({ size = 16 }: IconProps) =>
  svg(size, <path d="M4 5h16l-6 7.5V19l-4 1.5v-8z" />);

export const CloseIcon = ({ size = 16 }: IconProps) => svg(size, <path d="M6 6l12 12M18 6 6 18" />);

export const EyeIcon = ({ size = 18 }: IconProps) =>
  svg(
    size,
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  );

export const EyeOffIcon = ({ size = 18 }: IconProps) =>
  svg(
    size,
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.4-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>,
  );

export const CalendarIcon = ({ size = 16 }: IconProps) =>
  svg(
    size,
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>,
  );
