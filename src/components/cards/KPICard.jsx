import { C } from '../../theme/brand'

export default function KPICard({ label, value, sub, subColor, accent, icon, trend }) {
  const accentColor = accent || C.mid
  return (
    <div className="cl-card" style={{ padding: '20px 22px', background: '#fff', borderRadius: 16, border: `1px solid ${C.gray2}`, boxShadow: '0 2px 8px rgba(0,40,69,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.gray4 }}>
          {label}
        </div>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${accentColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor, fontSize: 15,
          }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.dark, letterSpacing: '-0.5px', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12, marginTop: 6, color: subColor || C.gray4, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
          {trend && <span>{trend > 0 ? '↑' : '↓'}</span>}
          {sub}
        </div>
      )}
      <div style={{ height: 3, borderRadius: 999, background: C.gray2, marginTop: 14, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${C.dark}, ${accentColor})`, width: '70%', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  )
}
