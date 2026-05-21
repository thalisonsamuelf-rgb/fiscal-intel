import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import AIReasonCard from '../../components/ai/AIReasonCard'
import { gradients, C } from '../../theme/brand'
import { Upload, Search, History, AlertCircle, CheckCircle, Brain } from 'lucide-react'
import { fmt } from '../../utils/formatters'

const historicoSimilar = [
  { data: '15/11/2025', cfop: '3.102', cst: '50', natureza: 'Compra para industrialização — importação', tes: '101', confianca: 0.97 },
  { data: '08/10/2025', cfop: '3.102', cst: '50', natureza: 'Compra para industrialização — importação', tes: '101', confianca: 0.95 },
  { data: '22/09/2025', cfop: '3.102', cst: '51', natureza: 'Compra c/ transferência de crédito',        tes: '101', confianca: 0.72 },
]

const inconsistencias = [
  { tipo: 'CFOP incorreto',       descricao: 'NF 004.521 — CFOP 5.102 para operação de importação. Correto: 3.102', severity: 'high' },
  { tipo: 'CST divergente',       descricao: 'NF 004.512 — CST 00 para contribuinte do Simples. Verificar CSOSN', severity: 'medium' },
  { tipo: 'IPI sem destaque',     descricao: 'NF 004.498 — produto sujeito a IPI sem destaque. NCM 9022.12', severity: 'medium' },
  { tipo: 'PIS/COFINS — crédito', descricao: 'Potencial crédito PIS/COFINS não escriturado: R$ 4.280', severity: 'low' },
]

const sevConfig = { high: { bg: C.risk.highBg, color: C.risk.high }, medium: { bg: C.risk.mediumBg, color: C.risk.medium }, low: { bg: C.risk.lowBg, color: C.risk.low } }

export default function ApoioFiscal() {
  return (
    <PageShell>
      <PageHero
        gradient={gradients.fiscal}
        badge="Módulo 2"
        icon="🧮"
        title="Apoio ao Registro Fiscal"
        subtitle="Motor de inteligência contábil baseado no histórico da empresa — copiloto fiscal para parametrização"
        kpis={[
          { label: 'Documentos processados', value: '1.247',  sub: 'Último mês' },
          { label: 'Sugestões aceitas',      value: '94,3%',  sub: 'Taxa de aceitação AI' },
          { label: 'Inconsistências',        value: '4',      sub: 'Pendentes de revisão', subColor: '#fca5a5' },
          { label: 'Créditos identificados', value: 'R$ 28k', sub: 'Potencial não aproveitado' },
        ]}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 28 }}>

        {/* Upload / busca de documento */}
        <div className="cl-card" style={{ padding: '24px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 16 }}>
            Consultar ou Registrar Documento
          </div>

          {/* Upload area */}
          <div style={{
            border: `2px dashed ${C.gray2}`, borderRadius: 12, padding: '28px 20px',
            textAlign: 'center', cursor: 'pointer', marginBottom: 20,
            background: C.gray, transition: 'border-color 0.2s',
          }}>
            <Upload size={28} color={C.gray3} style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: C.dark, marginBottom: 4 }}>Arraste XML, SPED ou NF-e</div>
            <div style={{ fontSize: 11, color: C.gray4 }}>Suporte: XML NF-e, SPED EFD, SPED Contribuições</div>
          </div>

          {/* Busca semântica */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            border: `1px solid ${C.gray2}`, borderRadius: 10, padding: '10px 14px',
            background: '#fff',
          }}>
            <Search size={14} color={C.gray3} />
            <input
              placeholder="Buscar: 'CFOP para importação de equipamento médico'..."
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, color: C.dark, background: 'transparent' }}
            />
            <Brain size={14} color={C.mid} />
          </div>
        </div>

        {/* AI Sugestão principal */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4, marginBottom: 12 }}>
            Sugestão do Copilot Fiscal
          </div>
          <AIReasonCard
            suggestion="CFOP: 3.102 | CST: 50 | TES: 101 — Compra para industrialização (importação)"
            rationale="Com base em 47 lançamentos similares do histórico da empresa — mesma NCM (9022.12), fornecedor internacional, operação de compra para revenda com ICMS ST. A IA identificou padrão consistente."
            baseLegal="RICMS/MG — Anexo XV; CFOP 3.102: entrada de mercadoria importada destinada ao ativo ou consumo"
            confidence={0.97}
            historico="Último registro idêntico: NF 004.510 em 15/11/2025"
          />
        </div>
      </div>

      {/* Tabela histórico similar */}
      <div className="cl-card" style={{ padding: '24px', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <History size={16} color={C.mid} />
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4 }}>
            Histórico de Registros Similares
          </div>
        </div>
        <table className="fi-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>CFOP</th>
              <th>CST</th>
              <th>Natureza de Operação</th>
              <th>TES</th>
              <th style={{ textAlign: 'center' }}>Similaridade</th>
            </tr>
          </thead>
          <tbody>
            {historicoSimilar.map((h, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{h.data}</td>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: C.mid }}>{h.cfop}</span></td>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{h.cst}</span></td>
                <td style={{ fontSize: 12, color: C.gray4 }}>{h.natureza}</td>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{h.tes}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                    <div style={{ width: 60, height: 4, borderRadius: 999, background: C.gray2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${h.confianca * 100}%`, background: h.confianca > 0.9 ? C.green : C.amber, borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: h.confianca > 0.9 ? C.green : C.amber }}>
                      {Math.round(h.confianca * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inconsistências */}
      <div className="cl-card" style={{ padding: '24px', marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertCircle size={16} color={C.amber} />
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.gray4 }}>
            Painel de Inconsistências Detectadas
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: C.amber, background: C.amberBg, padding: '2px 10px', borderRadius: 999 }}>
            {inconsistencias.length} pendentes
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inconsistencias.map((inc, i) => {
            const cfg = sevConfig[inc.severity]
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px 14px', borderRadius: 10,
                background: cfg.bg, border: `1px solid ${cfg.color}30`,
                borderLeft: `3px solid ${cfg.color}`,
              }}>
                <AlertCircle size={14} color={cfg.color} style={{ marginTop: 1, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 2 }}>{inc.tipo}</div>
                  <div style={{ fontSize: 12, color: C.gray4 }}>{inc.descricao}</div>
                </div>
                <button style={{
                  padding: '4px 12px', borderRadius: 6, border: `1px solid ${cfg.color}`,
                  background: '#fff', color: cfg.color, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}>Resolver</button>
              </div>
            )
          })}
        </div>
      </div>
    </PageShell>
  )
}
