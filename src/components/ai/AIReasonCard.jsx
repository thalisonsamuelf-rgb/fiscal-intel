import { Brain, BookOpen, History, TrendingUp } from 'lucide-react'
import { C } from '../../theme/brand'

export default function AIReasonCard({ suggestion, rationale, baseLegal, confidence = 0.82, historico, onAccept, onReject }) {
  const pct = Math.round(confidence * 100)
  const confColor = confidence >= 0.8 ? C.green : confidence >= 0.6 ? C.amber : C.red

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
      border: `1px solid #bae6fd`,
      borderRadius: 14,
      padding: '18px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* AI badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `linear-gradient(135deg, ${C.mid}, ${C.light})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain size={14} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.mid, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Sugestão do Copilot Fiscal
          </div>
          <div style={{ fontSize: 10, color: C.gray4 }}>Sempre revise antes de aplicar</div>
        </div>

        {/* Confiança */}
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: confColor }}>{pct}% confiança</div>
          <div style={{ width: 80, height: 4, borderRadius: 999, background: C.gray2, overflow: 'hidden', marginTop: 3 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: confColor, borderRadius: 999, transition: 'width 0.8s' }} />
          </div>
        </div>
      </div>

      {/* Sugestão */}
      <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 10, lineHeight: 1.4 }}>
        {suggestion}
      </div>

      {/* Racional */}
      {rationale && (
        <div style={{ fontSize: 13, color: C.gray4, lineHeight: 1.6, marginBottom: 12 }}>
          {rationale}
        </div>
      )}

      {/* Base legal */}
      {baseLegal && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 8,
          background: 'rgba(1,112,185,0.08)', borderRadius: 8,
          padding: '8px 12px', marginBottom: 10,
        }}>
          <BookOpen size={13} color={C.mid} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: C.mid, fontWeight: 500 }}>{baseLegal}</span>
        </div>
      )}

      {/* Histórico similar */}
      {historico && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(5,150,105,0.08)', borderRadius: 8,
          padding: '6px 12px', marginBottom: 14,
        }}>
          <History size={12} color={C.green} />
          <span style={{ fontSize: 11, color: '#047857', fontWeight: 500 }}>{historico}</span>
        </div>
      )}

      {/* Ações */}
      {(onAccept || onReject) && (
        <div style={{ display: 'flex', gap: 8 }}>
          {onAccept && (
            <button onClick={onAccept} style={{
              flex: 1, padding: '8px', borderRadius: 8, border: 'none',
              background: C.mid, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Aplicar sugestão
            </button>
          )}
          {onReject && (
            <button onClick={onReject} style={{
              flex: 1, padding: '8px', borderRadius: 8,
              border: `1px solid ${C.gray2}`, background: '#fff',
              color: C.gray4, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Ignorar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
