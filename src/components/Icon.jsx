export default function Icon({ n, size = 18, color = 'currentColor', style: st }) {
  const d = {
    home:    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    list:    <><path d="M8 6h13M8 12h13M8 18h13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><circle cx="3" cy="6" r="1.2" fill={color}/><circle cx="3" cy="12" r="1.2" fill={color}/><circle cx="3" cy="18" r="1.2" fill={color}/></>,
    mic:     <><path d="M12 2a3 3 0 013 3v6a3 3 0 01-6 0V5a3 3 0 013-3z" fill="none" stroke={color} strokeWidth="1.5"/><path d="M19 10a7 7 0 01-14 0M12 19v3M8 22h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>,
    folder:  <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>,
    card:    <><rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.5"/><path d="M2 10h20" stroke={color} strokeWidth="1.5"/></>,
    target:  <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke={color} strokeWidth="1.5"/><circle cx="12" cy="12" r="2" fill={color}/></>,
    plus:    <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>,
    x:       <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>,
    check:   <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    chevd:   <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    chevr:   <path d="M9 6l6 6-6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>,
    edit:    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
    trash:   <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/></>,
    brain:   <path d="M9.5 2A2.5 2.5 0 007 4.5v.5a2.5 2.5 0 00-2.5 2.5A2.5 2.5 0 002 10a2.5 2.5 0 002.5 2.5v.5A2.5 2.5 0 007 15.5a2.5 2.5 0 002.5 2.5h5a2.5 2.5 0 002.5-2.5 2.5 2.5 0 002.5-2.5v-.5A2.5 2.5 0 0022 10a2.5 2.5 0 00-2.5-2.5V7A2.5 2.5 0 0017 4.5v-.5A2.5 2.5 0 0014.5 2h-5z" fill="none" stroke={color} strokeWidth="1.5"/>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    logout:  <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>,
    user:    <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none"/><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.5" fill="none"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display:'block', flexShrink:0, ...st }}>
      {d[n] || null}
    </svg>
  )
}
