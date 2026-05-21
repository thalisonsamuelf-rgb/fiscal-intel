import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import { gradients, C, apexBase } from '../../theme/brand'
import { fmt } from '../../utils/formatters'
import { RefreshCw, TrendingUp, TrendingDown, Info } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'

const cenarios = [
  { label: 'Faturamento', atual: 2370000, reforma: 2370000, delta: 0 },
  { label: 'PIS/COFINS → CBS/IBS', atual: -199080, reforma: -213300, delta: -14220 },
  { label: 'ICMS/ISS (extinção progressiva)', atual: -293300, reforma: -256000, delta: 37300 },
  { label: 'IPI (extinção parcial)', atual: -12400, reforma: -8200, delta: 4200 },
  { label: 'IRPJ/CSLL (sem mudança)', atual: -194480, reforma: -194480, delta: 0 },
  { label: 'Crédito financeiro (novo)', atual: 0, reforma: 45000, delta: 45000 },
  { label: 'Resultado antes IRPJ', atual: 287000, reforma: 329620, delta: 42620 },
]

const timelineTransicao = [
  { ano: '2026', fase: 'Teste CBS 0,9%', descricao: 'Período de adaptação. PIS/COFINS mantidos.', status: 'atual' },
  { ano: '2027', fase: 'CBS 2,9% + IBS inicial', descricao: 'Extinção parcial PIS/COFINS. Crédito financeiro parcial.', status: 'futuro' },
  { ano: '2028', fase: 'CBS plena + IBS 50%', descricao: 'Split payment obrigatório. ICMS reduzido 40%.', status: 'futuro' },
  { ano: '2029', fase: 'IBS pleno', descricao: 'ICMS/ISS extintos. Sistema dual CBS+IBS completo.', status: 'futuro' },
  { ano: '2032', fase: 'IS ativo', descricao: 'Imposto Seletivo pleno sobre produtos específicos.', status: 'futuro' },
]

const barOptions = {
  ...apexBase,
  chart: { ...apexBase.chart, type: 'bar', height: 280 },
  plotOptions: { bar: { borderRadius: 6, columnWidth: '50%' } },
  colors: [C.mid, '#EA580C'],
  xaxis: { categories: ['Resultado Atual', 'Com Reforma'] },
  yaxis: { labels: { formatter: v => fmt.currency(v) } },
  dataLabels: { enabled: true, formatter: v => fmt.currency(v), style: { fontSize: '11px', fontWeight: 700 } },
  legend: { show: false },
}

export default function Reforma() {
  const impactoTotal = cenarios.reduce((s, r) => s + r.delta, 0)

  return (
    <PageShell>
      <PageHero
        gradient={gradients.reforma}
        badge="Módulo 5"
        icon="🔄"
        title="Simulador da Reforma Tributária"
        subtitle="Simulação CBS/IBS/IS — impacto na margem, fluxo de caixa e EBITDA para a Contourline"
        kpis={[
          { label: 'Impacto líquido estimado', value: fmt.currency(impactoTotal), sub: impactoTotal > 0 ? 'Positivo vs atual' : 'Negativo vs atual', subColor: impactoTotal > 0 ? '#86efac' : '#fca5a5' },
          { label: 'CBS estimada (2027)',  value: '2,9%',  sub: 'Sobre faturamento bruto' },
          { label: 'IBS estimado (2027)', value: '5,8%',  sub: 'Substitui ICMS/ISS' },
          { label: 'Crédito financeiro',  value: 'R$ 45k', sub: 'Potencial 2027' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24, marginTop: 28 }}>

        {/* Tabela de cenários */}
        <div className="cl-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 16 }}>
            Comparativo: Regime Atual vs Reforma Tributária (2027)
          </div>
          <table className="fi-table">
            <thead>
              <tr>
                <th>Linha</th>
                <th style={{ textAlign: 'right' }}>Regime Atual</th>
                <th style={{ textAlign: 'right' }}>Com Reforma</th>
                <th style={{ textAlign: 'right' }}>Delta</th>
              </tr>
            </thead>
            <tbody>
              {cenarios.map((row, i) => (
                <tr key={i} style={{ background: i === cenarios.length - 1 ? C.gray : 'transparent', fontWeight: i === cenarios.length - 1 ? 800 : 400 }}>
                  <td>{row.label}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: row.atual < 0 ? C.red : C.dark }}>{fmt.currency(row.atual, 0)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: row.reforma < 0 ? C.red : C.dark }}>{fmt.currency(row.reforma, 0)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: row.delta > 0 ? C.green : row.delta < 0 ? C.red : C.gray4 }}>
                    {row.delta > 0 ? '+' : ''}{row.delta !== 0 ? fmt.currency(row.delta, 0) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Impacto consolidado */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 20,
          }}>
            {[
              { label: 'Resultado atual', value: fmt.currency(cenarios[cenarios.length-1].atual, 0), color: C.dark },
              { label: 'Com reforma',     value: fmt.currency(cenarios[cenarios.length-1].reforma, 0), color: C.mid },
              { label: 'Variação',        value: (impactoTotal > 0 ? '+' : '') + fmt.currency(impactoTotal, 0), color: impactoTotal >= 0 ? C.green : C.red },
            ].map(c => (
              <div key={c.label} style={{ padding: '14px', borderRadius: 10, background: C.gray, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.gray4, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: c.color }}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico + timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="cl-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 14 }}>
              Resultado: Atual vs Reforma
            </div>
            <ReactApexChart
              type="bar"
              series={[{ name: 'Resultado', data: [cenarios[cenarios.length-1].atual, cenarios[cenarios.length-1].reforma] }]}
              options={barOptions}
              height={200}
            />
          </div>

          {/* Timeline transição */}
          <div className="cl-card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 14 }}>
              Cronograma de Transição (LC 214/2025)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {timelineTransicao.map((item, i) => (
                <div key={i} className="timeline-item" style={{ position: 'relative', paddingLeft: 36, paddingBottom: 16 }}>
                  <div style={{
                    position: 'absolute', left: 0, top: 2,
                    width: 32, height: 32, borderRadius: '50%',
                    background: item.status === 'atual' ? C.mid : C.gray2,
                    color: item.status === 'atual' ? '#fff' : C.gray3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800,
                  }}>
                    {item.ano.slice(2)}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{item.fase}</div>
                  <div style={{ fontSize: 11, color: C.gray4, marginTop: 2 }}>{item.descricao}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
