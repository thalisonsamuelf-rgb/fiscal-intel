import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Newspaper, BookOpen, Ship, ShieldCheck,
  RefreshCw, Bell, MessageSquare, Lock, Users, Settings, ChevronRight
} from 'lucide-react'
import { gradients, C } from '../../theme/brand'
import { useAppStore } from '../../store/useAppStore'

const navGroups = [
  {
    label: 'Inteligência Fiscal',
    items: [
      { to: '/',              label: 'Painel CFO',            icon: LayoutDashboard, accent: C.mid },
      { to: '/newsletter',    label: 'Newsletter & Intelig.', icon: Newspaper,       accent: C.mid },
      { to: '/apoio-fiscal',  label: 'Apoio ao Registro',     icon: BookOpen,        accent: C.green },
      { to: '/importacao',    label: 'Importação & Aduana',   icon: Ship,            accent: C.purple },
      { to: '/validacao',     label: 'Validação de Impostos', icon: ShieldCheck,     accent: '#EA580C' },
      { to: '/reforma',       label: 'Simulador Reforma',     icon: RefreshCw,       accent: C.light },
    ],
  },
  {
    label: 'Operacional',
    items: [
      { to: '/alertas',  label: 'Alertas Fiscais',    icon: Bell,           accent: C.amber, badge: 7 },
      { to: '/copilot',  label: 'Copilot Fiscal',     icon: MessageSquare,  accent: C.mid },
    ],
  },
  {
    label: 'Governança',
    items: [
      { to: '/auditoria', label: 'Auditoria & Logs',       icon: Lock,     accent: C.dark },
      { to: '/usuarios',  label: 'Usuários & Permissões',  icon: Users,    accent: C.dark },
      { to: '/config',    label: 'Configurações',          icon: Settings, accent: C.gray3 },
    ],
  },
]

export default function Sidebar() {
  const { company, alertCount } = useAppStore()

  return (
    <aside className="no-print" style={{
      width: 228,
      minHeight: '100vh',
      background: gradients.hero,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Logo + título */}
      <div style={{ padding: '28px 20px 16px' }}>
        <div style={{
          fontSize: 15,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.3px',
          lineHeight: 1.2,
        }}>
          Fiscal Intel
        </div>
        <div style={{
          marginTop: 4, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}>
          Inteligência Tributária
        </div>

        {/* Empresa */}
        <div style={{
          marginTop: 14,
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          padding: '8px 10px',
          cursor: 'pointer',
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Empresa
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {company.name}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
            {company.regime}
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ flex: 1, padding: '0 10px' }}>
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="nav-group">{group.label}</div>
            {group.items.map(({ to, label, icon: Icon, badge }) => (
              <NavLink key={to} to={to} end={to === '/'} className="nav-link"
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px',
                  borderRadius: 10,
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.white : 'rgba(255,255,255,0.55)',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  marginBottom: 1,
                  borderLeft: isActive ? '3px solid rgba(255,255,255,0.5)' : '3px solid transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={isActive ? 2.2 : 1.7} />
                    <span style={{ flex: 1 }}>{label}</span>
                    {badge > 0 && (
                      <span style={{
                        background: C.red, color: '#fff', fontSize: 10, fontWeight: 700,
                        borderRadius: 999, padding: '1px 6px', minWidth: 18, textAlign: 'center',
                      }}>{badge}</span>
                    )}
                    {isActive && !badge && <ChevronRight size={11} style={{ opacity: 0.4 }} />}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '12px 16px 20px' }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Competência
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.88)', marginTop: 2 }}>
            Dezembro / 2025
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            Último processamento: hoje
          </div>
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 12, textAlign: 'center' }}>
          © 2025 Fiscal Intel · v1.0
        </div>
      </div>
    </aside>
  )
}
