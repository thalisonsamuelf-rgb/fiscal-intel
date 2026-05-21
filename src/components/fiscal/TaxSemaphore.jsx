import { C } from '../../theme/brand'

const config = {
  green: { label: 'Em conformidade', dot: '#059669', bg: '#ECFDF5', text: '#047857' },
  amber: { label: 'Atenção requerida', dot: '#D97706', bg: '#FFFBEB', text: '#92400e' },
  red:   { label: 'Risco crítico',    dot: '#DC2626', bg: '#FEF2F2', text: '#991b1b' },
}

export default function TaxSemaphore({ status = 'amber', label, size = 'md' }) {
  const cfg = config[status] || config.amber
  const isLg = size === 'lg'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: isLg ? 8 : 6,
      background: cfg.bg,
      border: `1px solid ${cfg.dot}30`,
      borderRadius: 999,
      padding: isLg ? '6px 16px' : '4px 12px',
    }}>
      <span style={{
        width: isLg ? 10 : 8, height: isLg ? 10 : 8,
        borderRadius: '50%',
        background: cfg.dot,
        display: 'block',
        boxShadow: `0 0 0 3px ${cfg.dot}30`,
        animation: status === 'red' ? 'pulse 1.5s infinite' : 'none',
      }} />
      <span style={{ fontSize: isLg ? 13 : 11, fontWeight: 700, color: cfg.text, letterSpacing: '0.04em' }}>
        {label || cfg.label}
      </span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  )
}
