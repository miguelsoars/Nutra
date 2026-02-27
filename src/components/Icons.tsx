import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 20, className = "" }: IconProps) {
  const icons: Record<string, React.ReactNode> = {
    heart: (
      <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
    "heart-outline": (
      <path stroke="currentColor" strokeWidth="2" fill="none" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    ),
    scan: (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      </React.Fragment>
    ),
    "scan-line": (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
        <path stroke="currentColor" strokeWidth="2" d="M7 12h10" />
      </React.Fragment>
    ),
    home: <path stroke="currentColor" strokeWidth="2" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    "book-open": <path stroke="currentColor" strokeWidth="2" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zm20 0h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />,
    "user-circle": (
      <React.Fragment>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path stroke="currentColor" strokeWidth="2" d="M16 16s-1.5-2-4-2-4 2-4 2"/><circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      </React.Fragment>
    ),
    "trending-up": (
      <React.Fragment>
        <polyline stroke="currentColor" strokeWidth="2" points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline stroke="currentColor" strokeWidth="2" points="17 6 23 6 23 12" />
      </React.Fragment>
    ),
    sparkles: <path stroke="currentColor" strokeWidth="2" d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />,
    target: (
      <React.Fragment>
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
      </React.Fragment>
    ),
    "chevron-left": <path stroke="currentColor" strokeWidth="2" d="m15 18-6-6 6-6" />,
    trash2: (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2m-6 5v6m4-6v6"/>
      </React.Fragment>
    ),
    "edit-3": (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M12 20h9"/><path stroke="currentColor" strokeWidth="2" d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </React.Fragment>
    ),
    camera: (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
      </React.Fragment>
    ),
    zap: <polygon stroke="currentColor" strokeWidth="2" points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
    "rotate-ccw": (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path stroke="currentColor" strokeWidth="2" d="M3 3v5h5" />
      </React.Fragment>
    ),
    "log-out": <path stroke="currentColor" strokeWidth="2" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />,
    "shield-check": (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke="currentColor" strokeWidth="2" d="m9 12 2 2 4-4" />
      </React.Fragment>
    ),
    "eye-off": (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M9.88 9.88a3 3 0 1 0 4.24 4.24m-3.39-9.05a10.02 10.02 0 0 1 11.4 6.27m-2.11 3.54a10.05 10.05 0 0 1-13.43 0m-2.11-3.54A10.02 10.02 0 0 1 9.88 3.12M1 1l22 22" />
      </React.Fragment>
    ),
    "eye": (
      <React.Fragment>
        <path stroke="currentColor" strokeWidth="2" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      </React.Fragment>
    ),
    "loader-2": (
        <React.Fragment>
            <path stroke="currentColor" strokeWidth="2" d="M21 12a9 9 0 1 1-6.219-8.56" />
        </React.Fragment>
    )
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || null}
    </svg>
  );
}
