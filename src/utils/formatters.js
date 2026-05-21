export const fmt = {
  currency: (v, dec = 1) => {
    if (v == null || isNaN(v)) return '—'
    const abs = Math.abs(v)
    const neg = v < 0 ? '-' : ''
    if (abs >= 1_000_000) return `${neg}R$ ${(abs/1_000_000).toFixed(dec)}M`
    if (abs >= 1_000)     return `${neg}R$ ${(abs/1_000).toFixed(dec)}k`
    return `${neg}R$ ${abs.toFixed(0)}`
  },
  currencyFull: (v) => {
    if (v == null || isNaN(v)) return '—'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  },
  percent: (v, dec = 1) => {
    if (v == null || isNaN(v)) return '—'
    return `${(v * 100).toFixed(dec).replace('.', ',')}%`
  },
  percentRaw: (v, dec = 2) => {
    if (v == null || isNaN(v)) return '—'
    return `${v.toFixed(dec).replace('.', ',')}%`
  },
  number: (v) => {
    if (v == null || isNaN(v)) return '—'
    return new Intl.NumberFormat('pt-BR').format(Math.round(v))
  },
  variance: (actual, budget) => {
    if (actual == null || budget == null || budget === 0) return null
    return (actual - budget) / Math.abs(budget)
  },
  date: (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('pt-BR')
  },
  cnpj: (v) => {
    if (!v) return '—'
    const s = String(v).replace(/\D/g, '').padStart(14, '0')
    return `${s.slice(0,2)}.${s.slice(2,5)}.${s.slice(5,8)}/${s.slice(8,12)}-${s.slice(12,14)}`
  },
}

export const riskColor = (level) => {
  const map = {
    critical: '#DC2626',
    high:     '#EA580C',
    medium:   '#D97706',
    low:      '#059669',
    none:     '#6B7280',
  }
  return map[level] ?? map.none
}

export const riskLabel = (level) => {
  const map = {
    critical: 'Crítico',
    high:     'Alto',
    medium:   'Médio',
    low:      'Baixo',
    none:     'Sem risco',
  }
  return map[level] ?? '—'
}

export const traffic = (actual, budget, inverse = false) => {
  if (!budget) return 'neutral'
  const r = actual / budget
  if (inverse) return r <= 1 ? 'success' : r <= 1.05 ? 'warning' : 'danger'
  return r >= 1 ? 'success' : r >= 0.9 ? 'warning' : 'danger'
}
