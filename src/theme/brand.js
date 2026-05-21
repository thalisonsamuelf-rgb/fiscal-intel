// Design system herdado do contourline-dashboard + tokens fiscais
export const C = {
  dark:    '#002845',
  mid:     '#0170B9',
  light:   '#0288D1',
  white:   '#FFFFFF',
  bg:      '#FAFAFA',
  gray:    '#F3F4F6',
  gray2:   '#E5E7EB',
  gray3:   '#9CA3AF',
  gray4:   '#6B7280',
  green:   '#059669',
  greenBg: '#ECFDF5',
  red:     '#DC2626',
  redBg:   '#FEF2F2',
  amber:   '#D97706',
  amberBg: '#FFFBEB',
  purple:  '#7C3AED',
  purpleBg:'#F5F3FF',

  // Tokens fiscais
  risk: {
    critical: '#DC2626',
    criticalBg: '#FEF2F2',
    high:     '#EA580C',
    highBg:   '#FFF7ED',
    medium:   '#D97706',
    mediumBg: '#FFFBEB',
    low:      '#059669',
    lowBg:    '#ECFDF5',
    none:     '#6B7280',
    noneBg:   '#F9FAFB',
  },
  compliance: {
    ok:      '#059669',
    warn:    '#D97706',
    fail:    '#DC2626',
    pending: '#0170B9',
  },
  modules: {
    newsletter:  '#0170B9',
    apoioFiscal: '#059669',
    importacao:  '#7C3AED',
    validacao:   '#EA580C',
    reforma:     '#0288D1',
  },
}

export const gradients = {
  hero:      `linear-gradient(160deg, ${C.dark} 0%, ${C.mid} 60%, ${C.light} 100%)`,
  brand:     `linear-gradient(90deg, ${C.dark}, ${C.mid})`,
  success:   `linear-gradient(90deg, #047857, ${C.green})`,
  accent:    `linear-gradient(90deg, ${C.mid}, ${C.light})`,
  risk:      `linear-gradient(90deg, #DC2626, #EA580C)`,
  newsletter:`linear-gradient(160deg, #001f3f 0%, ${C.mid} 60%, ${C.light} 100%)`,
  fiscal:    `linear-gradient(160deg, #00301a 0%, #047857 60%, ${C.green} 100%)`,
  import:    `linear-gradient(160deg, #3b0764 0%, #7C3AED 60%, #a78bfa 100%)`,
  validacao: `linear-gradient(160deg, #431407 0%, #EA580C 60%, #fb923c 100%)`,
  reforma:   `linear-gradient(160deg, ${C.dark} 0%, #0170B9 40%, ${C.light} 100%)`,
}

export const shadows = {
  card:     '0 2px 8px rgba(0,40,69,0.08)',
  cardHover:'0 12px 40px rgba(0,40,69,0.18)',
  heroCard: '0 8px 32px rgba(0,40,69,0.15)',
}

export const apexBase = {
  chart: {
    fontFamily: "'Inter', sans-serif",
    toolbar:    { show: false },
    animations: { enabled: true, speed: 400 },
    background: 'transparent',
  },
  grid: {
    borderColor: '#E5E7EB',
    strokeDashArray: 3,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 2, right: 4 },
  },
  tooltip: {
    theme: 'light',
    style: { fontFamily: "'Inter', sans-serif", fontSize: '12px' },
  },
  legend: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    markers: { size: 6 },
  },
}

export const modules = [
  { id: 'dashboard',   label: 'Painel CFO',            color: C.dark },
  { id: 'newsletter',  label: 'Newsletter & Intelig.',  color: C.modules.newsletter },
  { id: 'apoio-fiscal',label: 'Apoio ao Registro',      color: C.modules.apoioFiscal },
  { id: 'importacao',  label: 'Importação & Aduana',    color: C.modules.importacao },
  { id: 'validacao',   label: 'Validação de Impostos',  color: C.modules.validacao },
  { id: 'reforma',     label: 'Reforma Tributária',     color: C.modules.reforma },
]
