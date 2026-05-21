import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import AIReasonCard from '../../components/ai/AIReasonCard'
import { gradients, C } from '../../theme/brand'
import { Upload, FileText, Calculator, CheckCircle, Clock, AlertTriangle, Package } from 'lucide-react'
import { fmt } from '../../utils/formatters'

const processos = [
  { di: '25/004.521-7', invoice: 'INV-2025-0089', produto: 'Sistema HIPRO — 3 unidades', status: 'calculando', valor: 284500, data: '18/05/2026' },
  { di: '25/003.891-2', invoice: 'INV-2025-0076', produto: 'Visbody RS — 5 unidades',   status: 'concluido',  valor: 156200, data: '05/05/2026' },
  { di: '25/003.102-0', invoice: 'INV-2025-0061', produto: 'UNYQUE PRO — 8 unidades',   status: 'pendente',  valor: 312800, data: '28/04/2026' },
]

const statusConfig = {
  calculando: { label: 'Calculando',  color: C.amber, bg: C.amberBg, Icon: Clock },
  concluido:  { label: 'Concluído',   color: C.green, bg: C.greenBg, Icon: CheckCircle },
  pendente:   { label: 'Pendente',    color: C.mid,   bg: '#EFF6FF',  Icon: Clock },
  divergencia:{ label: 'Divergência', color: C.red,   bg: C.redBg,    Icon: AlertTriangle },
}

const custoDI = {
  invoiceUSD: 42300,
  cambio: 5.82,
  invoiceBRL: 246186,
  frete: 12400,
  seguro: 1850,
  afrmm: 3720,
  despAduaneiras: 4200,
  valorAduaneiro: 264370,
  ii: { aliq: 0.14, valor: 37012 },
  ipi: { aliq: 0, valor: 0 },
  pisCofinsImp: { aliq: 0.0925, valor: 27813 },
  icmsImp: { aliq: 0.12, valor: 42019 },
  totalTributos: 106844,
  custoLanded: 371214,
  custoUnitario: 123738,
}

export default function Importacao() {
  return (
    <PageShell>
      <PageHero
        gradient={gradients.import}
        badge="Módulo 3"
        icon="🚢"
        title="Importação & Aduana"
        subtitle="OCR inteligente de DI/DUIMP, cálculo automático de custo landed e geração de nota fiscal de importação"
        kpis={[
          { label: 'Processos ativos', value: '3',         sub: '1 em cálculo' },
          { label: 'Custo landed DI atual', value: 'R$ 371k', sub: 'HIPRO — 3 un.' },
          { label: 'Tributos totais',  value: 'R$ 107k',   sub: '28,8% do custo' },
          { label: 'Câmbio aplicado',  value: 'R$ 5,82',   sub: 'USD/BRL' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: 24, marginTop: 28 }}>

        {/* Upload DI */}
        <div>
          <div className="cl-card" style={{ padding: '24px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 14 }}>
              Importar Documentos
            </div>
            {[
              { label: 'DI / DUIMP (PDF)', icon: FileText, status: 'uploaded' },
              { label: 'Invoice',           icon: FileText, status: 'uploaded' },
              { label: 'Packing List',      icon: Package,  status: 'uploaded' },
              { label: 'BL / AWB',          icon: FileText, status: 'pending' },
              { label: 'Planilha de Custos',icon: FileText, status: 'pending' },
            ].map(doc => (
              <div key={doc.label} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 8, marginBottom: 6,
                background: doc.status === 'uploaded' ? C.greenBg : C.gray,
                border: `1px solid ${doc.status === 'uploaded' ? '#a7f3d0' : C.gray2}`,
              }}>
                <doc.icon size={13} color={doc.status === 'uploaded' ? C.green : C.gray3} />
                <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: C.dark }}>{doc.label}</span>
                {doc.status === 'uploaded'
                  ? <CheckCircle size={13} color={C.green} />
                  : <Upload size={13} color={C.gray3} />
                }
              </div>
            ))}
            <button style={{
              width: '100%', marginTop: 12, padding: '10px', borderRadius: 10,
              background: `linear-gradient(90deg, #5b21b6, #7C3AED)`,
              color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>
              Processar OCR & Calcular
            </button>
          </div>

          {/* AI sugestão nota fiscal */}
          <AIReasonCard
            suggestion="TES sugerida: 910 — Entrada por importação direta, com crédito ICMS e PIS/COFINS"
            rationale="Base: equipamento médico (NCM 9022.12), empresa Lucro Real, MG. Crédito integral de PIS/COFINS importação previsto em lei."
            baseLegal="Lei 10.637/2002 art. 3°; RICMS/MG art. 75 — crédito ICMS importação"
            confidence={0.92}
          />
        </div>

        {/* Memória de cálculo */}
        <div className="cl-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Calculator size={16} color={C.purple} />
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4 }}>
              Composição de Custo — DI 25/004.521-7 (HIPRO × 3)
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {/* Coluna base */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gray4, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.08em' }}>
                Base de cálculo
              </div>
              {[
                { label: 'Invoice (USD)',         value: `USD ${fmt.number(custoDI.invoiceUSD)}` },
                { label: 'Câmbio',               value: `R$ ${custoDI.cambio.toFixed(4)}` },
                { label: 'Invoice (BRL)',          value: fmt.currency(custoDI.invoiceBRL, 0) },
                { label: 'Frete internacional',   value: fmt.currency(custoDI.frete, 0) },
                { label: 'Seguro',               value: fmt.currency(custoDI.seguro, 0) },
                { label: 'AFRMM',                value: fmt.currency(custoDI.afrmm, 0) },
                { label: 'Despesas aduaneiras',  value: fmt.currency(custoDI.despAduaneiras, 0) },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.gray}`, fontSize: 12 }}>
                  <span style={{ color: C.gray4 }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: C.dark, fontFamily: 'monospace' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: `2px solid ${C.gray2}`, marginTop: 4, fontSize: 13, fontWeight: 800, color: C.dark }}>
                <span>Valor Aduaneiro</span>
                <span style={{ fontFamily: 'monospace' }}>{fmt.currency(custoDI.valorAduaneiro, 0)}</span>
              </div>
            </div>

            {/* Coluna tributos */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.gray4, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.08em' }}>
                Tributos incidentes
              </div>
              {[
                { label: `II (${(custoDI.ii.aliq*100).toFixed(0)}%)`,           value: fmt.currency(custoDI.ii.valor, 0),          color: C.red },
                { label: `IPI (${(custoDI.ipi.aliq*100).toFixed(0)}%)`,         value: custoDI.ipi.valor === 0 ? 'Isento' : fmt.currency(custoDI.ipi.valor, 0), color: C.green },
                { label: `PIS/COFINS Imp (9,25%)`,                              value: fmt.currency(custoDI.pisCofinsImp.valor, 0), color: C.amber },
                { label: `ICMS Importação (12%)`,                               value: fmt.currency(custoDI.icmsImp.valor, 0),     color: C.amber },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.gray}`, fontSize: 12 }}>
                  <span style={{ color: C.gray4 }}>{row.label}</span>
                  <span style={{ fontWeight: 700, color: row.color, fontFamily: 'monospace' }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: `2px solid ${C.gray2}`, marginTop: 4, fontSize: 13, fontWeight: 800, color: C.red }}>
                <span>Total Tributos</span>
                <span style={{ fontFamily: 'monospace' }}>{fmt.currency(custoDI.totalTributos, 0)}</span>
              </div>

              <div style={{ marginTop: 16, padding: '12px 14px', borderRadius: 10, background: `linear-gradient(135deg, #f5f3ff, #ede9fe)`, border: `1px solid #c4b5fd` }}>
                <div style={{ fontSize: 11, color: '#6d28d9', fontWeight: 600, marginBottom: 4 }}>Custo Landed Total</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#4c1d95', letterSpacing: '-0.5px' }}>{fmt.currency(custoDI.custoLanded, 0)}</div>
                <div style={{ fontSize: 11, color: '#7c3aed', marginTop: 4 }}>Custo unitário: {fmt.currency(custoDI.custoUnitario, 0)}/un</div>
              </div>
            </div>
          </div>

          <button style={{
            width: '100%', padding: '11px', borderRadius: 10,
            background: `linear-gradient(90deg, ${C.dark}, ${C.mid})`,
            color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
          }}>
            Gerar Espelho da Nota Fiscal de Importação
          </button>
        </div>
      </div>

      {/* Processos ativos */}
      <div className="cl-card" style={{ padding: '24px', marginTop: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 16 }}>
          Processos de Importação Ativos
        </div>
        <table className="fi-table">
          <thead>
            <tr>
              <th>DI / DUIMP</th>
              <th>Invoice</th>
              <th>Produto</th>
              <th>Data DI</th>
              <th style={{ textAlign: 'right' }}>Valor CIF</th>
              <th style={{ textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {processos.map(p => {
              const cfg = statusConfig[p.status]
              return (
                <tr key={p.di} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: C.mid }}>{p.di}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.invoice}</td>
                  <td style={{ fontWeight: 600 }}>{p.produto}</td>
                  <td style={{ fontSize: 12, color: C.gray4 }}>{p.data}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{fmt.currency(p.valor, 0)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}
