import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'
import { C } from '../../theme/brand'
import { riskLabel, riskColor } from '../../utils/formatters'

const icons = {
  critical: XCircle,
  high:     AlertTriangle,
  medium:   AlertTriangle,
  low:      CheckCircle,
  none:     Info,
}

const bgColors = {
  critical: C.risk.criticalBg,
  high:     C.risk.highBg,
  medium:   C.risk.mediumBg,
  low:      C.risk.lowBg,
  none:     C.risk.noneBg,
}

export default function RiskCard({ level = 'medium', title, description, imposto, valor, onClick }) {
  const Icon = icons[level] || Info
  const color = riskColor(level)
  const bg = bgColors[level]

  return (
    <div
      onClick={onClick}
      style={{
        background: bg,
        border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 12,
        padding: '14px 16px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Icon size={16} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{title}</span>
            <span className="risk-badge" style={{ background: `${color}18`, color }}>
              {riskLabel(level)}
            </span>
          </div>
          {description && (
            <p style={{ fontSize: 12, color: C.gray4, lineHeight: 1.5 }}>{description}</p>
          )}
          {(imposto || valor) && (
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              {imposto && <span style={{ fontSize: 11, fontWeight: 700, color: C.gray4, textTransform: 'uppercase' }}>{imposto}</span>}
              {valor && <span style={{ fontSize: 12, fontWeight: 700, color }}>{valor}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
