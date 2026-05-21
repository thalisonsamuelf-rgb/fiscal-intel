import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import TaxSemaphore from '../../components/fiscal/TaxSemaphore'
import { gradients, C } from '../../theme/brand'
import { fmt } from '../../utils/formatters'
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react'
import ReactApexChart from 'react-apexcharts'
import { apexBase } from '../../theme/brand'

const apuracoes = [
  { imposto: 'ICMS',        base: 2370000, apurado: 284400, validado: 284400, delta: 0,      status: 'ok',   risco: 0 },
  { imposto: 'ICMS-ST',     base: 480000,  apurado: 52800,  validado: 51200,  delta: -1600,  status: 'warn', risco: 30 },
  { imposto: 'DIFAL',       base: 285000,  apurado: 34200,  validado: 28000,  delta: -6200,  status: 'warn', risco: 45 },
  { imposto: 'PIS',         base: 2370000, apurado: 35550,  validado: 35550,  delta: 0,      status: 'ok',   risco: 0 },
  { imposto: 'COFINS',      base: 2370000, apurado: 163530, validado: 163530, delta: 0,      status: 'ok',   risco: 0 },
  { imposto: 'IPI',         base: 196000,  apurado: 12400,  validado: 12400,  delta: 0,      status: 'ok',   risco: 0 },
  { imposto: 'ISS',         base: 89000,   apurado: 8900,   validado: 0,      delta: -8900,  status: 'fail', risco: 90 },
  { imposto: 'IRPJ',        base: 430000,  apurado: 143000, validado: 130000, delta: -13000, status: 'warn', risco: 25 },
  { imposto: 'CSLL',        base: 430000,  apurado: 51480,  validado: 51480,  delta: 0,      status: 'ok',   risco: 0 },
]

const statusMap = {
  ok:   { label: 'Validado',    color: C.green, bg: C.greenBg, Icon: CheckCircle },
  warn: { label: 'Pendência',   color: C.amber, bg: C.amberBg, Icon: AlertTriangle },
  fail: { label: 'Crítico',     color: C.red,   bg: C.redBg,   Icon: XCircle },
}

const scoreGauge = {
  series: [68],
  options: {
    ...apexBase,
    chart: { ...apexBase.chart, type: 'radialBar', height: 220 },
    plotOptions: {
      radialBar: {
        hollow: { size: '60%' },
        dataLabels: {
          name: { show: true, fontSize: '13px', color: C.gray4, offsetY: 20 },
          value: { fontSize: '36px', fontWeight: 900, color: C.dark, offsetY: -16, formatter: v => `${v}` },
        },
        track: { background: C.gray2 },
      },
    },
    fill: { type: 'gradient', gradient: { shade: 'dark', type: 'horizontal', gradientToColors: [C.light], stops: [0, 100] } },
    colors: [C.mid],
    labels: ['Score de Risco'],
  },
}

export default function Validacao() {
  const totalDivergencias = apuracoes.reduce((s, r) => s + Math.abs(r.delta), 0)
  const falhas = apuracoes.filter(r => r.status === 'fail').length
  const alertas = apuracoes.filter(r => r.status === 'warn').length

  return (
    <PageShell>
      <PageHero
        gradient={gradients.validacao}
        badge="Módulo 4"
        icon="✅"
        title="Validação de Apuração de Impostos"
        subtitle="Auditor fiscal automatizado — cruzamento SPED, XML e apuração com score de risco tributário"
        kpis={[
          { label: 'Score de risco',   value: '68/100', sub: 'Risco médio-alto', subColor: '#fca5a5' },
          { label: 'Divergências',     value: fmt.currency(totalDivergencias, 0), sub: `${falhas} críticas`, subColor: '#fca5a5' },
          { label: 'Tributos validados', value: `${apuracoes.filter(r=>r.status==='ok').length}/${apuracoes.length}`, sub: 'Em conformidade' },
          { label: 'Carga total',      value: fmt.currency(apuracoes.reduce((s,r)=>s+r.apurado,0), 0), sub: 'Dez/2025' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 24, marginTop: 28 }}>

        {/* Score gauge */}
        <div className="cl-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 8, textAlign: 'center' }}>
            Score Tributário
          </div>
          <ReactApexChart type="radialBar" series={scoreGauge.series} options={scoreGauge.options} height={220} />
          <TaxSemaphore status="amber" label="Atenção requerida" />
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            {[
              { label: 'ISS não recolhido',  pts: 25, color: C.red },
              { label: 'DIFAL em aberto',    pts: 15, color: C.amber },
              { label: 'IRPJ estimativa',    pts: 10, color: C.amber },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                <span style={{ fontSize: 11, color: C.gray4 }}>{item.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: item.color }}>-{item.pts}pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabela de apuração */}
        <div className="cl-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 16 }}>
            Validação por Tributo — Dez / 2025
          </div>
          <table className="fi-table">
            <thead>
              <tr>
                <th>Imposto</th>
                <th style={{ textAlign: 'right' }}>Base de Cálculo</th>
                <th style={{ textAlign: 'right' }}>Apurado</th>
                <th style={{ textAlign: 'right' }}>Validado</th>
                <th style={{ textAlign: 'right' }}>Divergência</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {apuracoes.map(row => {
                const cfg = statusMap[row.status]
                const Icon = cfg.Icon
                return (
                  <tr key={row.imposto}>
                    <td style={{ fontWeight: 700 }}>{row.imposto}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, color: C.gray4 }}>{fmt.currency(row.base, 0)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{fmt.currency(row.apurado, 0)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12 }}>{fmt.currency(row.validado, 0)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: row.delta !== 0 ? C.red : C.green }}>
                      {row.delta !== 0 ? fmt.currency(Math.abs(row.delta), 0) : '✓'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 999,
                        background: cfg.bg, color: cfg.color,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        <Icon size={11} />
                        {cfg.label}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
