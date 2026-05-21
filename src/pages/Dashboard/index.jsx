import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import TaxSemaphore from '../../components/fiscal/TaxSemaphore'
import RiskCard from '../../components/cards/RiskCard'
import AIReasonCard from '../../components/ai/AIReasonCard'
import { gradients, C } from '../../theme/brand'
import { fmt } from '../../utils/formatters'
import {
  Newspaper, BookOpen, Ship, ShieldCheck, RefreshCw,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Clock
} from 'lucide-react'

const impostos = [
  { imposto: 'ICMS',        status: 'green',  apurado: 284500,  pago: 284500,  divergencia: 0 },
  { imposto: 'PIS/COFINS',  status: 'amber',  apurado: 96300,   pago: 87200,   divergencia: 9100 },
  { imposto: 'IPI',         status: 'green',  apurado: 12400,   pago: 12400,   divergencia: 0 },
  { imposto: 'IRPJ',        status: 'amber',  apurado: 143000,  pago: 130000,  divergencia: 13000 },
  { imposto: 'CSLL',        status: 'green',  apurado: 51480,   pago: 51480,   divergencia: 0 },
  { imposto: 'ISS',         status: 'red',    apurado: 8900,    pago: 0,       divergencia: 8900 },
  { imposto: 'DIFAL',       status: 'amber',  apurado: 34200,   pago: 28000,   divergencia: 6200 },
]

const topRisks = [
  { level: 'high',   title: 'ISS Assistência Técnica não recolhido',  imposto: 'ISS',       valor: 'R$ 8.900' },
  { level: 'medium', title: 'PIS/COFINS — divergência de R$ 9.100',   imposto: 'PIS/COFINS',valor: 'R$ 9.100' },
  { level: 'medium', title: 'DIFAL interestadual em aberto',           imposto: 'DIFAL',     valor: 'R$ 6.200' },
  { level: 'low',    title: 'IRPJ — diferença estimativa vs provisão', imposto: 'IRPJ',      valor: 'R$ 13.000' },
]

const modulesStatus = [
  { label: 'Newsletter',      icon: Newspaper,    alerts: 4, color: C.mid,     path: '/newsletter' },
  { label: 'Apoio Fiscal',    icon: BookOpen,     alerts: 2, color: C.green,   path: '/apoio-fiscal' },
  { label: 'Importação',      icon: Ship,         alerts: 1, color: C.purple,  path: '/importacao' },
  { label: 'Validação',       icon: ShieldCheck,  alerts: 3, color: '#EA580C', path: '/validacao' },
  { label: 'Reforma Trib.',   icon: RefreshCw,    alerts: 0, color: C.light,   path: '/reforma' },
]

export default function Dashboard() {
  return (
    <PageShell>
      <PageHero
        gradient={gradients.hero}
        badge="Painel CFO"
        icon="📊"
        title="Inteligência Fiscal & Tributária"
        subtitle="Visão consolidada de compliance, risco tributário e apuração de impostos — Dez/2025"
        kpis={[
          { label: 'Carga Tributária',   value: 'R$ 630k',  sub: 'Competência Dez/2025' },
          { label: 'Score de Risco',     value: '68/100',   sub: '↑ 4pts vs Nov', subColor: '#fb923c' },
          { label: 'Divergências',       value: 'R$ 37k',   sub: '4 pendências', subColor: '#fca5a5' },
          { label: 'Conformidade',       value: '71%',      sub: '5/7 impostos ok', subColor: '#86efac' },
        ]}
      />

      {/* Semáforo geral */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 28, marginBottom: 24 }}>
        <TaxSemaphore status="amber" label="Atenção: 2 pendências críticas" size="lg" />
        <span style={{ fontSize: 12, color: C.gray4 }}>Última atualização: hoje às 08:32</span>
      </div>

      {/* Grid principal */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>

        {/* Painel de impostos */}
        <div className="cl-card" style={{ padding: '22px 24px' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 2 }}>
              Apuração de Impostos
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Dez / 2025 — Status por tributo</div>
          </div>

          <table className="fi-table">
            <thead>
              <tr>
                <th>Imposto</th>
                <th style={{ textAlign: 'right' }}>Apurado</th>
                <th style={{ textAlign: 'right' }}>Pago</th>
                <th style={{ textAlign: 'right' }}>Divergência</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {impostos.map(row => (
                <tr key={row.imposto}>
                  <td style={{ fontWeight: 600 }}>{row.imposto}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{fmt.currency(row.apurado)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{fmt.currency(row.pago)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: row.divergencia > 0 ? C.red : C.green, fontWeight: row.divergencia > 0 ? 700 : 400 }}>
                    {row.divergencia > 0 ? fmt.currency(row.divergencia) : '—'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <TaxSemaphore status={row.status} label={row.status === 'green' ? 'OK' : row.status === 'amber' ? 'Pendente' : 'Crítico'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Riscos principais */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4 }}>
            Top Riscos Fiscais
          </div>
          {topRisks.map((r, i) => (
            <RiskCard key={i} {...r} />
          ))}
        </div>
      </div>

      {/* Módulos status + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 24, marginTop: 24 }}>

        {/* Status dos módulos */}
        <div className="cl-card" style={{ padding: '22px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 16 }}>
            Status dos Módulos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {modulesStatus.map(mod => {
              const Icon = mod.icon
              return (
                <div key={mod.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: C.gray, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${mod.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={15} color={mod.color} />
                  </div>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: C.dark }}>{mod.label}</span>
                  {mod.alerts > 0 ? (
                    <span style={{
                      background: mod.alerts >= 3 ? C.risk.criticalBg : C.risk.mediumBg,
                      color: mod.alerts >= 3 ? C.risk.critical : C.risk.medium,
                      fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '2px 8px',
                    }}>{mod.alerts} alertas</span>
                  ) : (
                    <CheckCircle size={14} color={C.green} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* AI suggestion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4 }}>
            Copilot Fiscal — Recomendações
          </div>
          <AIReasonCard
            suggestion="ISS sobre Assistência Técnica deve ser recolhido para BH — competência Dez/2025"
            rationale="Identificamos 3 NFs de serviço de manutenção sem recolhimento de ISS. O município de Belo Horizonte tributa serviços de assistência técnica sob o item 14.01 da LC 116/2003, com alíquota de 2%."
            baseLegal="LC 116/2003 art. 1º, item 14.01 — Lista de Serviços; Decreto BH 15.213/2013"
            confidence={0.94}
            historico="3 lançamentos similares em Set/2025 com ISS recolhido"
          />
          <AIReasonCard
            suggestion="Crédito de PIS/COFINS sobre despesas aduaneiras da DI 25/001234-7 não aproveitado"
            rationale="Despesas portuárias e AFRMM geram crédito PIS/COFINS para empresas no regime não-cumulativo (Lucro Real). Identificamos R$ 9.100 de crédito potencial não escriturado."
            baseLegal="Lei 10.637/2002 art. 3º, II e Lei 10.833/2003 art. 3º, II — insumos importação"
            confidence={0.79}
            historico="Crédito aproveitado na DI 25/000891-2 em Out/2025"
          />
        </div>
      </div>
    </PageShell>
  )
}
