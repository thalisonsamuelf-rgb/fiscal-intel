import { Bell, MessageSquare, Download, ChevronDown, Building2 } from 'lucide-react'
import { C } from '../../theme/brand'
import { useAppStore } from '../../store/useAppStore'

export default function Header() {
  const { company, alertCount, copilotOpen, setCopilotOpen } = useAppStore()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#fff',
      borderBottom: `1px solid ${C.gray2}`,
      padding: '0 32px',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      boxShadow: '0 1px 4px rgba(0,40,69,0.06)',
    }}>
      {/* Empresa selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.gray2}` }}>
        <Building2 size={14} color={C.mid} />
        <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>{company.name}</span>
        <ChevronDown size={13} color={C.gray3} />
      </div>

      {/* Regime badge */}
      <div style={{
        padding: '3px 10px', borderRadius: 999,
        background: C.greenBg, color: '#047857',
        fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
      }}>
        {company.regime}
      </div>

      <div style={{ flex: 1 }} />

      {/* Competência */}
      <div style={{ fontSize: 12, color: C.gray4, fontWeight: 500 }}>
        Competência:
        <span style={{ fontWeight: 700, color: C.dark, marginLeft: 4 }}>Dez / 2025</span>
      </div>

      {/* Export */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 14px', borderRadius: 8,
        border: `1px solid ${C.gray2}`,
        background: '#fff', cursor: 'pointer',
        fontSize: 12, fontWeight: 600, color: C.dark,
      }} onClick={() => window.print()}>
        <Download size={13} />
        Exportar
      </button>

      {/* Alertas */}
      <button style={{
        position: 'relative',
        width: 36, height: 36, borderRadius: 8,
        border: `1px solid ${C.gray2}`,
        background: '#fff', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Bell size={16} color={C.dark} />
        {alertCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: C.red, color: '#fff',
            fontSize: 9, fontWeight: 800, borderRadius: 999,
            padding: '1px 5px', minWidth: 16, textAlign: 'center',
            border: '2px solid #fff',
          }}>{alertCount}</span>
        )}
      </button>

      {/* Copilot */}
      <button
        onClick={() => setCopilotOpen(!copilotOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 14px', borderRadius: 8,
          background: copilotOpen ? C.mid : C.dark,
          border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#fff',
          transition: 'background 0.2s',
        }}>
        <MessageSquare size={13} />
        Copilot
      </button>
    </header>
  )
}
