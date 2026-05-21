import { C } from '../../theme/brand'

export default function PageHero({ gradient, icon, badge, title, subtitle, kpis = [] }) {
  return (
    <div style={{
      background: gradient,
      borderRadius: 20,
      padding: '32px 36px 28px',
      marginBottom: kpis.length ? 0 : 28,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', right: -40, top: -40,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.05)',
      }} />
      <div style={{
        position: 'absolute', right: 60, bottom: -60,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {badge && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            padding: '4px 12px',
            fontSize: 11, fontWeight: 700, color: '#fff',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            {icon && <span style={{ fontSize: 13 }}>{icon}</span>}
            {badge}
          </div>
        )}
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.8px', lineHeight: 1.15, marginBottom: 6 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: 400, maxWidth: 540 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* KPI cards flutuantes */}
      {kpis.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${kpis.length}, 1fr)`,
          gap: 14,
          marginTop: 24,
        }}>
          {kpis.map((kpi, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 14,
              padding: '14px 18px',
            }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                {kpi.value}
              </div>
              {kpi.sub && (
                <div style={{ fontSize: 11, color: kpi.subColor || 'rgba(255,255,255,0.55)', marginTop: 3, fontWeight: 500 }}>
                  {kpi.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
