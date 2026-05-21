import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import { gradients, C } from '../../theme/brand'
import { Newspaper, ExternalLink, Filter, Bell, TrendingUp, AlertTriangle, DollarSign, Truck } from 'lucide-react'

const news = [
  {
    id: 1, date: '20/05/2026', source: 'Receita Federal', urgency: 'high',
    impact: ['fiscal', 'financeiro'],
    title: 'IN RFB 2.228/2025 — Novas regras de habilitação para importação de equipamentos médicos com redução II',
    summary: 'A Instrução Normativa estabelece procedimento simplificado de habilitação para importadores de equipamentos de diagnóstico médico com NCMs específicos, mantendo redução de II a 0% até 31/12/2026.',
    ncms: ['9018.90', '9022.12'],
    impactoFinanceiro: 'Positivo — redução de custo de importação estimada em R$ 120k/ano',
    risco: 'low',
  },
  {
    id: 2, date: '19/05/2026', source: 'CONFAZ', urgency: 'critical',
    impact: ['fiscal', 'aduaneiro'],
    title: 'Convênio ICMS 45/2026 — Alteração da base de cálculo ICMS-ST para equipamentos estéticos em MG',
    summary: 'O CONFAZ publicou alteração no Convênio 45/2026 modificando a MVA para equipamentos estéticos importados. Nova MVA: 48% (anterior: 35%). Vigência: 01/06/2026.',
    ncms: ['9018.19', '8543.70'],
    impactoFinanceiro: 'Negativo — aumento de custo estimado em R$ 280k no acumulado 2026',
    risco: 'critical',
  },
  {
    id: 3, date: '18/05/2026', source: 'CAMEX', urgency: 'medium',
    impact: ['aduaneiro'],
    title: 'Ex-tarifário aprovado para Sistema Visbody — Resolução GECEX 456/2026',
    summary: 'Aprovado ex-tarifário para scanner corporal Visbody com alíquota de II 0%, substituindo a alíquota regular de 14%. Código Ex: 0001.',
    ncms: ['9031.80'],
    impactoFinanceiro: 'Positivo — redução imediata no custo de importação Visbody',
    risco: 'low',
  },
  {
    id: 4, date: '17/05/2026', source: 'Diário Oficial', urgency: 'medium',
    impact: ['fiscal'],
    title: 'Reforma Tributária — Publicado cronograma de transição CBS para 2027',
    summary: 'Decreto 12.341/2026 define alíquota-teste CBS em 0,9% a partir de 01/01/2027, com aproveitamento de crédito financeiro integral e extinção progressiva do PIS/COFINS.',
    ncms: [],
    impactoFinanceiro: 'Neutro em 2026; impacto a mapear para 2027',
    risco: 'medium',
  },
  {
    id: 5, date: '15/05/2026', source: 'Anvisa', urgency: 'low',
    impact: ['aduaneiro', 'regulatório'],
    title: 'RDC 664/2026 — Simplificação de licenciamento de importação para Classe II',
    summary: 'A Anvisa publicou novo fluxo de LI para equipamentos médicos Classe II, reduzindo prazo de análise de 45 para 20 dias úteis.',
    ncms: ['9018.90', '9022.29'],
    impactoFinanceiro: 'Positivo — redução de prazo de desembaraço',
    risco: 'none',
  },
]

const urgencyConfig = {
  critical: { color: C.risk.critical, bg: C.risk.criticalBg, label: 'Crítico' },
  high:     { color: C.risk.high,     bg: C.risk.highBg,     label: 'Alto' },
  medium:   { color: C.risk.medium,   bg: C.risk.mediumBg,   label: 'Médio' },
  low:      { color: C.risk.low,      bg: C.risk.lowBg,      label: 'Baixo' },
}

const impactIcons = { fiscal: DollarSign, financeiro: TrendingUp, aduaneiro: Truck, regulatório: AlertTriangle }

export default function Newsletter() {
  return (
    <PageShell>
      <PageHero
        gradient={gradients.newsletter}
        badge="Módulo 1"
        icon="📡"
        title="Newsletter & Inteligência de Mercado"
        subtitle="Monitoramento automático de legislação tributária, aduaneira e regulatória do segmento médico"
        kpis={[
          { label: 'Atualizações hoje',   value: '5',      sub: '2 críticas' },
          { label: 'NCMs monitoradas',    value: '23',     sub: 'Equipamentos médicos' },
          { label: 'Fontes ativas',       value: '8',      sub: 'RFB, CONFAZ, CAMEX...' },
          { label: 'Alertas pendentes',   value: '4',      sub: 'Ação requerida', subColor: '#fca5a5' },
        ]}
      />

      {/* Filtros */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.gray4 }}>
          Filtrar por:
        </div>
        {['Todos', 'Receita Federal', 'CONFAZ', 'CAMEX', 'Anvisa', 'Diário Oficial'].map(f => (
          <button key={f} style={{
            padding: '5px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: f === 'Todos' ? C.mid : '#fff',
            color: f === 'Todos' ? '#fff' : C.gray4,
            border: `1px solid ${f === 'Todos' ? C.mid : C.gray2}`,
          }}>{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={14} color={C.gray4} />
          <span style={{ fontSize: 12, color: C.gray4 }}>Alertas ativos</span>
        </div>
      </div>

      {/* Feed de notícias */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {news.map(item => {
          const urg = urgencyConfig[item.urgency]
          return (
            <div key={item.id} className="cl-card" style={{ padding: '20px 24px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.gray4 }}>{item.date}</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: 'rgba(1,112,185,0.1)', color: C.mid,
                    }}>{item.source}</span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: urg.bg, color: urg.color,
                    }}>{urg.label}</span>
                    {item.impact.map(imp => {
                      const Icon = impactIcons[imp] || DollarSign
                      return (
                        <span key={imp} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 600,
                          background: C.gray, color: C.gray4, textTransform: 'capitalize',
                        }}>
                          <Icon size={10} />
                          {imp}
                        </span>
                      )
                    })}
                  </div>

                  {/* Título */}
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 8, lineHeight: 1.4 }}>
                    {item.title}
                  </div>

                  {/* Resumo IA */}
                  <p style={{ fontSize: 13, color: C.gray4, lineHeight: 1.6, marginBottom: 10 }}>
                    {item.summary}
                  </p>

                  {/* NCMs + impacto financeiro */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    {item.ncms.length > 0 && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {item.ncms.map(ncm => (
                          <span key={ncm} style={{
                            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                            background: C.dark, color: '#fff', fontFamily: 'monospace',
                          }}>NCM {ncm}</span>
                        ))}
                      </div>
                    )}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12, fontWeight: 600,
                      color: item.impactoFinanceiro.startsWith('Positivo') ? C.green
                           : item.impactoFinanceiro.startsWith('Negativo') ? C.red : C.amber,
                    }}>
                      {item.impactoFinanceiro.startsWith('Positivo') ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {item.impactoFinanceiro}
                    </div>
                  </div>
                </div>

                <ExternalLink size={16} color={C.gray3} style={{ marginTop: 4, flexShrink: 0 }} />
              </div>
            </div>
          )
        })}
      </div>
    </PageShell>
  )
}

function TrendingDown({ size, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  )
}
