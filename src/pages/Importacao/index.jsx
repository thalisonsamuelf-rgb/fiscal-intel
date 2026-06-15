import { useState, useCallback, useRef } from 'react'
import PageShell from '../../components/layout/PageShell'
import PageHero from '../../components/layout/PageHero'
import { gradients, C } from '../../theme/brand'
import * as XLSX from 'xlsx'
import {
  Upload, FileSpreadsheet, CheckCircle, Loader2,
  Download, Zap, X, AlertTriangle, RotateCcw, Info,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// NCM RATES — alíquotas e bases de cálculo por NCM
// II: % sobre CIF
// IPI: % sobre (CIF + II)
// PIS/COFINS: alíquota normal × fator de redução (dispositivos médicos = 10%)
// ICMS: zerado para dispositivos médicos importados
// ─────────────────────────────────────────────────────────────────────────────
const NCM_RATES = {
  '90189099': { ii: 0.144, ipi: 0.052, pisNorm: 0.021, pisRed: 0.10, cofinsNorm: 0.0965, cofinsRed: 0.10, icms: 0 },
  '90189090': { ii: 0.144, ipi: 0.052, pisNorm: 0.021, pisRed: 0.10, cofinsNorm: 0.0965, cofinsRed: 0.10, icms: 0 },
  default:    { ii: 0.000, ipi: 0.000, pisNorm: 0.021, pisRed: 1.00, cofinsNorm: 0.0965, cofinsRed: 1.00, icms: 0 },
}

function getNcmRates(ncm) {
  const key = String(ncm).replace(/\./g, '').replace(/\s/g, '')
  return NCM_RATES[key] || NCM_RATES.default
}

// ─────────────────────────────────────────────────────────────────────────────
// RATEIO ENGINE
// Base de rateio = CIF por item (FOB + Frete + Seguro já alocados na DUIMP)
// Despesas acessórias distribuídas pela proporção CIF item / CIF total
// ─────────────────────────────────────────────────────────────────────────────
function computeRateio(calcItems, notaFech) {
  if (!calcItems || calcItems.length === 0) return []

  const totalCIF = calcItems.reduce((s, it) => s + it.cifBRL, 0)

  const despTotal =
    (notaFech?.tus         || 0) +
    (notaFech?.armazenagem || 0) +
    (notaFech?.lpco        || 0) +
    (notaFech?.dape        || 0) +
    (notaFech?.freteRod    || 0) +
    (notaFech?.dta         || 0) +
    (notaFech?.expediente  || 0)

  return calcItems.map(item => {
    const ratio  = totalCIF > 0 ? item.cifBRL / totalCIF : 1 / calcItems.length
    const rates  = getNcmRates(item.ncm)

    const ii     = item.cifBRL * rates.ii
    const ipi    = (item.cifBRL + ii) * rates.ipi
    const pis    = item.cifBRL * rates.pisNorm  * rates.pisRed
    const cofins = item.cifBRL * rates.cofinsNorm * rates.cofinsRed
    const icms   = 0
    const desp   = despTotal * ratio

    const custoTotal = item.cifBRL + ii + ipi + pis + cofins + icms + desp
    const custoUnit  = item.qty > 0 ? custoTotal / item.qty : custoTotal

    return { ...item, ratio, ii, ipi, pis, cofins, icms, desp, custoTotal, custoUnit, taxTotal: ii + ipi + pis + cofins }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF TEXT EXTRACTION (pdfjs-dist via CDN worker)
// ─────────────────────────────────────────────────────────────────────────────
let _pdfjs = null
async function getPdfJs() {
  if (_pdfjs) return _pdfjs
  _pdfjs = await import('pdfjs-dist')
  _pdfjs.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${_pdfjs.version}/pdf.worker.min.js`
  return _pdfjs
}

async function extractPdfText(file) {
  const lib = await getPdfJs()
  const buf = await file.arrayBuffer()
  const pdf = await lib.getDocument({ data: buf }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(it => it.str).join(' ') + '\n'
  }
  return text
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSERS
// ─────────────────────────────────────────────────────────────────────────────
const toBRL = s => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0

function parseDuimp(text) {
  const g = p => { const m = text.match(p); return m?.[1] || '' }
  const n = p => toBRL(g(p))
  return {
    nRef:      g(/N\/REF[.\s]*:\s*(\S+)/),
    duimp:     g(/Extrato da D(?:uimp|UIMP)\s+([\w-]+)/i) || g(/26BR[\w-]+/),
    awb:       g(/BL\s*\/\s*AWB\s*HOUSE[.\s]*:\s*(\d+)/),
    taxa:      parseFloat(g(/TAXA[.\s]*:\s*\d+\s+DOLAR[^0-9]+([\d.]+)/)) || 0,
    embarque:  g(/EMISS[ÃA]O\s+CONHECIMENTO[.\s]*:\s*([\d/]+)/),
    fobBRL:    n(/TOTAL\s+FOB[.\s]*:\s*R\$\s*([\d,.]+)/),
    fobUSD:    n(/TOTAL\s+FOB[.\s]*:.*?USD\s*([\d,.]+)/),
    freteBRL:  n(/TOTAL\s+FRETE[.\s]*:\s*R\$\s*([\d,.]+)/),
    freteUSD:  n(/TOTAL\s+FRETE[.\s]*:.*?USD\s*([\d,.]+)/),
    seguroBRL: n(/TOTAL\s+SEGURO[.\s]*:\s*R\$\s*([\d,.]+)/),
    seguroUSD: n(/TOTAL\s+SEGURO[.\s]*:.*?USD\s*([\d,.]+)/),
    cifBRL:    n(/VALOR\s+ADUANEIRO[.\s]*:\s*R\$\s*([\d,.]+)/),
    cifUSD:    n(/VALOR\s+ADUANEIRO[.\s]*:.*?USD\s*([\d,.]+)/),
    ii:        n(/II\s*\(\d+\)[.\s]*:\s*R\$\s*([\d,.]+)/),
    ipi:       n(/IPI\s*\(\d+\)[.\s]*:\s*R\$\s*([\d,.]+)/),
    pis:       n(/PIS\/PASEP\s*\(\d+\)[.\s]*:\s*R\$\s*([\d,.]+)/),
    cofins:    n(/COFINS\s*\(\d+\)[.\s]*:\s*R\$\s*([\d,.]+)/),
    tus:       n(/TUS\s*\(\d+\)[.\s]*:\s*R\$\s*([\d,.]+)/),
  }
}

function parseNotaFechamento(text) {
  const n = p => { const m = text.match(p); return m ? toBRL(m[1]) : 0 }
  const lineVal = keyword => {
    const re = new RegExp(keyword + '[^\\d]+((?:[\\d]+[.,]){1,}[\\d]{2})', 'i')
    return n(re)
  }
  return {
    freteInt:     lineVal('FRETE INTERNACIONAL'),
    lpco:         lineVal('LPCO'),
    armazenagem:  lineVal('ARMAZENAGEM'),
    dape:         lineVal('DAPE'),
    freteRod:     lineVal('FRETE RODOVI'),
    dta:          n(/\bDTA\b[^\d]+([\d,.]+)/),
    expediente:   lineVal('EXPEDIENTE'),
    tus:          lineVal('SISCOMEX'),
    adiantamento: n(/ADIANTAMENTO[^\d]+([\d,.]+)/),
    saldoFavor:   n(/TOTAL A FAVOR[^\d]+([\d,.]+)/),
  }
}

// A NF de entrada e o Cálculo por Item são GERADOS pela ferramenta — não são inputs

// ─────────────────────────────────────────────────────────────────────────────
// PARSER — Itens da DUIMP (extrai adições/itens do PDF da DUIMP desembaraçada)
// Estratégia 1: split por marcador "ITEM N°/Nº"
// Estratégia 2: âncoras por código de produto (M30-013)
// ─────────────────────────────────────────────────────────────────────────────
function parseDuimpItens(text) {
  const n2 = s => parseFloat(String(s || '0').replace(/\./g, '').replace(',', '.')) || 0
  const norm = text.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ')
  let found = []

  // Estratégia 1 — split por "ITEM N° 001"
  const splits = norm.split(/ITEM\s+N[°º]?\s*\.?\s*0*(\d+)/i)
  if (splits.length > 1) {
    for (let i = 1; i < splits.length; i += 2) {
      const seq = parseInt(splits[i]) || Math.ceil(i / 2)
      const seg = splits[i + 1] || ''

      const ncmM = seg.match(/\b(\d{4})[.\s]?(\d{2})[.\s]?(\d{2})[.\s]?(\d{2})\b/)
      if (!ncmM) continue
      const ncm = ncmM[1] + ncmM[2] + ncmM[3] + ncmM[4]

      const prodM = seg.match(/\b([A-Z]\d{2,3}-\d{3,4})\b/) ||
                    seg.match(/PRODUTO[:\s]+(\S+)/i)
      const produto = prodM ? prodM[1] : `ITEM${String(seq).padStart(2, '0')}`

      const qtyM = seg.match(/(\d+(?:[,.]\d+)?)\s*UN(?:IDADE)?/i) ||
                   seg.match(/QTDE?[:\s]+(\d+)/i)
      const qty = qtyM ? parseFloat(qtyM[1].replace(',', '.')) : 1

      const fobM = seg.match(/\bFOB\b[^R\d]*R\$\s*([\d.,]+)/i) ||
                   seg.match(/VLR\.?\s*FOB[^R\d]*([\d.,]+)/i)
      const fobBRL = fobM ? n2(fobM[1]) : 0

      const freteM = seg.match(/\bFRETE\b[^R\d]*R\$\s*([\d.,]+)/i) ||
                     seg.match(/\bFRETE\b[^R\d]*([\d.,]+)\s*R\$/i)
      const freteBRL = freteM ? n2(freteM[1]) : 0

      const segM = seg.match(/\bSEGURO\b[^R\d]*R\$\s*([\d.,]+)/i) ||
                   seg.match(/\bSEGURO\b[^R\d]*([\d.,]+)\s*R\$/i)
      const seguroBRL = segM ? n2(segM[1]) : 0

      if (ncm.length === 8 && (fobBRL > 0 || freteBRL > 0)) {
        found.push({ seq, produto, descricao: produto, ncm, qty, fobBRL, freteBRL, seguroBRL, cifBRL: fobBRL + freteBRL + seguroBRL })
      }
    }
  }

  // Estratégia 2 — âncoras por SKU (M30-013, S30-023)
  if (found.length === 0) {
    const skuRe = /\b([A-Z]\d{2,3}-\d{3,4})\b/g
    let m
    while ((m = skuRe.exec(norm)) !== null) {
      const seg = norm.slice(Math.max(0, m.index - 80), m.index + 500)
      const ncmM = seg.match(/(\d{4})[.\s]?(\d{2})[.\s]?(\d{2})[.\s]?(\d{2})/)
      if (!ncmM) continue
      const ncm = ncmM[1] + ncmM[2] + ncmM[3] + ncmM[4]
      const qtyM = seg.match(/(\d+)\s*UN(?:IDADE)?/i)
      const fobM = seg.match(/FOB[^R\d]*R?\$?\s*([\d.,]{5,})/i)
      const freteM = seg.match(/FRETE[^R\d]*R?\$?\s*([\d.,]{5,})/i)
      const segM = seg.match(/SEGURO[^R\d]*R?\$?\s*([\d.,]+)/i)
      const fobBRL = fobM ? n2(fobM[1]) : 0
      if (fobBRL > 0) {
        const freteBRL = freteM ? n2(freteM[1]) : 0
        const seguroBRL = segM ? n2(segM[1]) : 0
        found.push({
          seq: found.length + 1, produto: m[1], descricao: m[1], ncm,
          qty: qtyM ? parseFloat(qtyM[1]) : 1,
          fobBRL, freteBRL, seguroBRL, cifBRL: fobBRL + freteBRL + seguroBRL,
        })
      }
    }
  }

  return found
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSER — Invoice (fallback: extrai itens do PDF da Invoice/Fatura Comercial)
// Retorna itens com SKU, qty e totalUSD para rateio proporcional
// ─────────────────────────────────────────────────────────────────────────────
function parseInvoice(text) {
  const items = []
  const toUSD = s => parseFloat(String(s || '0').replace(/,/g, '')) || 0
  const norm = text.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ')
  const skuRe = /\b([A-Z]\d{2,3}-\d{3,4})\b/g
  const seen = new Set()
  let m
  while ((m = skuRe.exec(norm)) !== null) {
    if (seen.has(m[1])) continue
    seen.add(m[1])
    const seg = norm.slice(m.index, m.index + 200)
    // qty then unit price then total (USD format: 14,949.49)
    const numM = seg.match(/(\d+)\s+(\d{1,3}(?:,\d{3})*\.\d{2})\s+(\d{1,3}(?:,\d{3})*\.\d{2})/)
    if (numM) {
      const qty = parseInt(numM[1])
      const totalUSD = toUSD(numM[3]) || toUSD(numM[2]) * qty
      if (qty > 0 && totalUSD > 0) items.push({ produto: m[1], qty, totalUSD })
    }
  }
  return { items }
}

// ─────────────────────────────────────────────────────────────────────────────
// XLSX GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
const brl = v => typeof v === 'number' ? v : 0

function generateXlsx(data) {
  const { duimp: d, notaFech: nf, itens } = data
  const wb = XLSX.utils.book_new()

  const tributosDI = brl(d.ii) + brl(d.ipi) + brl(d.pis) + brl(d.cofins) + brl(d.tus)
  const despTotal  = brl(nf.armazenagem) + brl(nf.dape) + brl(nf.freteRod) +
                     brl(nf.dta) + brl(nf.lpco) + brl(nf.expediente) + brl(nf.tus)
  const totalAPG   = tributosDI + despTotal + brl(nf.freteInt)
  const ajustes    = brl(d.pis) + brl(d.cofins)
  const totalDI    = totalAPG - ajustes
  const custoTotalCalc = itens
    ? itens.reduce((s, it) => s + brl(it.custoTotal), 0)
    : brl(d.cifBRL) + tributosDI + despTotal

  // ── Cálculo por Item — gerado automaticamente da DUIMP ───────────────────
  if (itens && itens.length > 0) {
    const taxasSheet = [
      ['MOEDA', 'TAXA', 'DATA'],
      ['USD', brl(d.taxa), d.embarque || ''],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(taxasSheet), 'taxas')

    const itensHeader = [
      'NR DUIMP', 'DATA DUIMP', 'EXPORTADOR', 'PRODUTO', null,
      'DENOMINAÇÃO', null, null, null, null,
      'NCM', null, null,
      'FOB R$', 'FRETE R$', 'SEGURO R$', null, null,
      'QUANTIDADE', 'UNIDADE',
    ]
    const itensRows = [itensHeader]
    itens.forEach(it => {
      itensRows.push([
        d.duimp || '', d.embarque || '', '', it.produto, null,
        it.descricao || it.produto, null, null, null, null,
        it.ncm, null, null,
        brl(it.fobBRL), brl(it.freteBRL), brl(it.seguroBRL), null, null,
        it.qty, 'UNIDADE',
      ])
    })
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(itensRows), 'Itens')
  }

  // ── Resumo ───────────────────────────────────────────────────────────────
  const resumo = [
    [null, 'DESCRIÇÃO', 'VALOR DI', null, 'PAGAR ROTA', null, null, 'VAR. CAMBIAL', null, null, 'ACERTO ROTA'],
    [null, null, null, null, null, null, null, null, null, null, null, 'DI', 'A PG', 'AJUSTES'],
    [null, 'II', brl(d.ii), null, brl(d.ii), null, null, 0, null, null, 'IMPOSTOS', totalDI - despTotal - brl(nf.freteInt), totalAPG - despTotal - brl(nf.freteInt), ajustes],
    [null, 'IPI', brl(d.ipi), null, brl(d.ipi), null, null, 0, null, null, 'DESPESAS', despTotal, despTotal, 0],
    [null, 'PIS', 0, null, brl(d.pis), null, null, brl(d.pis), null, null, 'FRETE', brl(nf.freteInt), brl(nf.freteInt), 0],
    [null, 'COFINS', 0, null, brl(d.cofins), null, null, brl(d.cofins), null, null, 'CAPATAZIA', brl(nf.expediente), brl(nf.expediente), 0],
    [null, 'ICMS total', 0, null, null, 0, null, 0, null, null, 'TAXAS DO CE', 0, 0, 0],
    [null, 'Taxa Siscomex', brl(d.tus), null, brl(d.tus), null, null, 0, null, null, 'SEGURO', brl(d.seguroBRL), 0, -brl(d.seguroBRL)],
    [null, 'Outras despesas', despTotal, null, despTotal, null, null, 0, null, null, 'TOTAL', totalDI, totalAPG, ajustes],
    [null, 'Armazenagem', brl(nf.armazenagem), null, brl(nf.armazenagem)],
    [null, 'LPCO', brl(nf.lpco), null, brl(nf.lpco)],
    [null, 'Frete Internacional', brl(nf.freteInt), null, brl(nf.freteInt)],
    [null, 'Expediente Rota', brl(nf.expediente), null, brl(nf.expediente)],
    [null, 'Seguro', brl(d.seguroBRL), null, 0],
    [null, 'Invoice (FOB)', brl(d.fobBRL), null, brl(d.fobBRL), 0],
    [null, 'TOTAL (custo calculado)', custoTotalCalc, null, totalAPG],
    [null, 'NFs entrada', custoTotalCalc],
    [null, 'TOTAL NFs', custoTotalCalc],
    [null, 'Conferência', 0],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(resumo), 'Resumo')

  // ── DI Geral ─────────────────────────────────────────────────────────────
  const diRows = [
    [null, null, null, null, null, 'DI', null, `${d.nRef || ''} - ${d.duimp || ''}`],
    [null, null, null, null, null, 'Dolar americano', null, brl(d.taxa)],
    [null, null, null, null, null, 'Data Chegada', null, d.embarque || ''],
    [null, null, null, null, null, 'AWB', null, d.awb || ''],
    [],
    [null, 'Adição', 'SEQ', 'Produto', 'NCM', 'Descrição', 'Qtde',
     'FOB R$', 'Frete R$', 'Seguro R$', 'CIF R$', '% CIF',
     '% II', 'II R$', '% IPI', 'IPI R$', '% PIS', 'PIS R$',
     '% COFINS', 'COFINS R$', 'ICMS R$', 'Desp. Aces. R$',
     'CUSTO TOTAL R$', 'CUSTO UNIT. R$'],
  ]

  if (itens && itens.length > 0) {
    itens.forEach((it, idx) => {
      const rates = getNcmRates(it.ncm)
      diRows.push([
        null, it.adicao || 1, idx + 1, it.produto, it.ncm, it.descricao, it.qty,
        brl(it.fobBRL), brl(it.freteBRL), brl(it.seguroBRL), brl(it.cifBRL), brl(it.ratio),
        rates.ii, brl(it.ii), rates.ipi, brl(it.ipi),
        rates.pisNorm * rates.pisRed, brl(it.pis),
        rates.cofinsNorm * rates.cofinsRed, brl(it.cofins), brl(it.icms),
        brl(it.desp), brl(it.custoTotal), brl(it.custoUnit),
      ])
    })
    const totals = itens.reduce((acc, it) => ({
      fob: acc.fob + brl(it.fobBRL), frete: acc.frete + brl(it.freteBRL),
      seg: acc.seg + brl(it.seguroBRL), cif: acc.cif + brl(it.cifBRL),
      ii: acc.ii + brl(it.ii), ipi: acc.ipi + brl(it.ipi),
      pis: acc.pis + brl(it.pis), cofins: acc.cofins + brl(it.cofins),
      desp: acc.desp + brl(it.desp), ct: acc.ct + brl(it.custoTotal),
    }), { fob: 0, frete: 0, seg: 0, cif: 0, ii: 0, ipi: 0, pis: 0, cofins: 0, desp: 0, ct: 0 })
    diRows.push([
      null, null, null, 'TOTAL', null, null, null,
      totals.fob, totals.frete, totals.seg, totals.cif, 1,
      null, totals.ii, null, totals.ipi, null, totals.pis, null, totals.cofins, 0,
      totals.desp, totals.ct, null,
    ])
  } else {
    diRows.push([
      null, null, null, 'TOTAL PROCESSO', null, null, null,
      brl(d.fobBRL), brl(d.freteBRL), brl(d.seguroBRL), brl(d.cifBRL), 1,
      null, brl(d.ii), null, brl(d.ipi), null, brl(d.pis), null, brl(d.cofins), 0,
      despTotal, custoTotalCalc, null,
    ])
  }

  diRows.push(
    [],
    [null, null, null, null, null, 'DESPESAS ACESSÓRIAS', null, null, null, null, null, null, 'VALOR'],
    [null, null, null, null, null, 'Taxa Siscomex (TUS)',   null, null, null, null, null, null, brl(d.tus)],
    [null, null, null, null, null, 'Armazenagem',           null, null, null, null, null, null, brl(nf.armazenagem)],
    [null, null, null, null, null, 'LPCO ANVISA',           null, null, null, null, null, null, brl(nf.lpco)],
    [null, null, null, null, null, 'DAPE Carregamento',     null, null, null, null, null, null, brl(nf.dape)],
    [null, null, null, null, null, 'Frete Rodoviário',      null, null, null, null, null, null, brl(nf.freteRod)],
    [null, null, null, null, null, 'DTA',                   null, null, null, null, null, null, brl(nf.dta)],
    [null, null, null, null, null, 'Expediente Rota',       null, null, null, null, null, null, brl(nf.expediente)],
    [null, null, null, null, null, 'TOTAL DESPESAS',        null, null, null, null, null, null, despTotal],
    [],
    [null, null, null, null, null, 'Frete Internacional',   null, null, null, null, null, null, brl(nf.freteInt)],
    [null, null, null, null, null, 'Saldo a favor',         null, null, null, null, null, null, brl(nf.saldoFavor)],
  )
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(diRows), 'DI Geral')

  // ── Contab. ───────────────────────────────────────────────────────────────
  const ratesRef = NCM_RATES['90189099']
  const cofinsCredito = brl(d.cofins) / ratesRef.cofinsRed
  const pisCredito    = brl(d.pis)    / ratesRef.pisRed
  const equipamentos  = custoTotalCalc - brl(d.ipi)

  const contab = [
    [null, 'NF', 'Data', 'Conta contábil', 'Descrição', 'Moeda', 'Valor USD', 'D/C', 'Valor R$'],
    [null, '(a emitir)', '', '1.1.03.07.0007', 'COFINS Não Cumulativo Importação', null, null, 'D', cofinsCredito],
    [null, null, null, '1.1.03.07.0007', 'PIS Não Cumulativo Importação', null, null, 'D', pisCredito],
    [null, null, null, null, 'IPI', null, null, 'D', brl(d.ipi)],
    [null, null, null, null, 'ICMS a Recuperar', null, null, 'D', 0],
    [null, null, null, null, 'Equipamentos / Mercadorias', null, null, 'D', equipamentos],
    [null, null, null, null, 'Fornecedor Exterior (Invoice)', null, brl(d.fobUSD), 'C', -brl(d.fobBRL)],
    [null, null, null, null, 'Rota Brazil (Contas a Pagar)', null, null, 'C', -totalAPG],
    [null, null, null, '3.2.04.01.0003', 'Variação Cambial Passiva Realizada', null, null, null, brl(d.pis) + brl(d.cofins)],
  ]
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(contab), 'Contab.')

  // ── NCM ───────────────────────────────────────────────────────────────────
  const ncmRows = [
    [null, 'NCM', 'II', 'IPI', 'PIS normal', 'PIS red.', 'PIS efetiva', 'COFINS normal', 'COFINS red.', 'COFINS efetiva', 'ICMS', 'Observação'],
  ]
  const ncmsUsados = [...new Set((itens || []).map(it => it.ncm).filter(Boolean))]
  if (ncmsUsados.length === 0) ncmsUsados.push('90189099')
  for (const ncm of ncmsUsados) {
    const r = getNcmRates(ncm)
    ncmRows.push([
      null, ncm, r.ii, r.ipi,
      r.pisNorm, r.pisRed, r.pisNorm * r.pisRed,
      r.cofinsNorm, r.cofinsRed, r.cofinsNorm * r.cofinsRed,
      r.icms, 'Dispositivo médico — redução PIS/COFINS por convênio CAMEX',
    ])
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ncmRows), 'NCM')

  // ── NF Entrada — valores calculados para emissão da NF de entrada ─────────
  // Esta aba contém os dados prontos para preencher a Nota Fiscal de entrada
  const nfRows = [
    [null, 'NF ENTRADA — DADOS CALCULADOS', null, null, null, null],
    [null, 'Processo', `${d.nRef || ''} — DUIMP ${d.duimp || ''}`],
    [null, 'Taxa câmbio', brl(d.taxa), null, 'Data DUIMP', d.embarque || ''],
    [],
    [null, 'CFOP', '3.101', null, '(Compra para industrialização / uso/consumo — importação)'],
    [],
    // Cabeçalho da tabela de itens
    [null, 'Produto / SKU', 'Descrição', 'NCM', 'Qtde', 'Un',
     'Vlr Unit. R$', 'Vlr Total R$', 'IPI R$', 'BC PIS R$', 'PIS R$', 'BC COFINS R$', 'COFINS R$', 'BC ICMS R$', 'ICMS R$'],
  ]

  if (itens && itens.length > 0) {
    itens.forEach(it => {
      nfRows.push([
        null, it.produto, it.descricao, it.ncm, it.qty, 'UN',
        brl(it.custoUnit), brl(it.custoTotal),
        brl(it.ipi),
        brl(it.cifBRL), brl(it.pis),   // BC PIS = CIF, PIS = valor já reduzido
        brl(it.cifBRL), brl(it.cofins), // BC COFINS = CIF
        0, 0,                            // ICMS = zerado
      ])
    })
    nfRows.push(
      [],
      [null, null, null, null, null, null, null, 'TOTAL PRODUTOS', null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, custoTotalCalc, brl(d.ipi), null, brl(d.pis), null, brl(d.cofins), 0, 0],
    )
  } else {
    nfRows.push([
      null, 'PROCESSO CONSOLIDADO', '', '', null, null,
      null, custoTotalCalc, brl(d.ipi), brl(d.cifBRL), brl(d.pis), brl(d.cifBRL), brl(d.cofins), 0, 0,
    ])
  }

  nfRows.push(
    [],
    [null, 'TOTAIS DA NF'],
    [null, 'Valor Total dos Produtos', custoTotalCalc - brl(d.ipi)],
    [null, 'Valor do IPI', brl(d.ipi)],
    [null, 'Outras Despesas Acessórias', 0, null, '(já incorporadas ao custo dos produtos)'],
    [null, 'VALOR TOTAL DA NF', custoTotalCalc],
    [],
    [null, 'CRÉDITOS FISCAIS (lançar separado)'],
    [null, 'PIS a recuperar (crédito)', brl(d.pis) / (NCM_RATES['90189099'].pisRed), null, 'Valor cheio antes da redução'],
    [null, 'COFINS a recuperar (crédito)', brl(d.cofins) / (NCM_RATES['90189099'].cofinsRed), null, 'Valor cheio antes da redução'],
    [null, 'IPI a recuperar (se aplicável)', brl(d.ipi)],
  )
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(nfRows), 'NF Entrada')

  XLSX.writeFile(wb, `Planilha_Importacao_${d.nRef || 'output'}.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPES
// ─────────────────────────────────────────────────────────────────────────────
const DOC_TYPES = [
  { key: 'duimp',     label: 'DUIMP Desembaraçada', hint: 'RB11879 - DUIMP DESEMBARAÇADA.pdf', required: true,  ext: '.pdf', color: '#7C3AED', bg: '#f5f3ff' },
  { key: 'nota_fech', label: 'Nota de Fechamento',   hint: 'RB11879 - NOTA DE FECHAMENTO.PDF',  required: true,  ext: '.pdf', color: '#0170B9', bg: '#eff6ff' },
  { key: 'invoice',   label: 'Invoice (Fatura)',      hint: 'RB11879 - INVOICE.PDF',            required: false, ext: '.pdf', color: '#D97706', bg: '#fffbeb' },
]

function detectDocType(filename) {
  const f = filename.toLowerCase()
  if (f.includes('duimp') || f.includes('desembaraç') || f.includes('desembaraca')) return 'duimp'
  if (f.includes('fechamento')) return 'nota_fech'
  if (f.includes('invoice') || f.includes('fatura')) return 'invoice'
  return null
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function Importacao() {
  const [files, setFiles]       = useState({})
  const [parsing, setParsing]   = useState(false)
  const [extracted, setExtr]    = useState(null)
  const [errors, setErrors]     = useState({})
  const [tab, setTab]           = useState('upload')
  const [dragging, setDragging] = useState(false)

  const assignFile = useCallback((file) => {
    const type = detectDocType(file.name)
    if (type) setFiles(prev => ({ ...prev, [type]: file }))
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    Array.from(e.dataTransfer.files).forEach(assignFile)
  }, [assignFile])

  const removeFile = (key) => setFiles(prev => { const n = { ...prev }; delete n[key]; return n })

  const parseAll = async () => {
    setParsing(true); setErrors({})
    const errs = {}
    const result = { duimp: {}, notaFech: {}, itens: null }

    let duimpText = null
    if (files.duimp) {
      try {
        duimpText = await extractPdfText(files.duimp)
        result.duimp = parseDuimp(duimpText)
      } catch (e) { errs.duimp = 'Erro ao ler PDF: ' + e.message }
    }

    if (files.nota_fech) {
      try {
        const text = await extractPdfText(files.nota_fech)
        result.notaFech = parseNotaFechamento(text)
      } catch (e) { errs.nota_fech = 'Erro ao ler PDF: ' + e.message }
    }

    // Extrai itens da DUIMP (adições) — gera o Cálculo por Item automaticamente
    let items = []
    if (duimpText) {
      items = parseDuimpItens(duimpText)
    }

    // Fallback: Invoice como fonte de itens + rateio proporcional FOB
    if (items.length === 0 && files.invoice) {
      try {
        const invText = await extractPdfText(files.invoice)
        const { items: invItems } = parseInvoice(invText)
        if (invItems.length > 0 && result.duimp.taxa > 0) {
          const totalFobBRL = invItems.reduce((s, it) => s + it.totalUSD * result.duimp.taxa, 0)
          const totFrete  = result.duimp.freteBRL  || 0
          const totSeguro = result.duimp.seguroBRL || 0
          items = invItems.map((it, idx) => {
            const fobBRL   = it.totalUSD * result.duimp.taxa
            const ratio    = totalFobBRL > 0 ? fobBRL / totalFobBRL : 1 / invItems.length
            const freteBRL = totFrete  * ratio
            const seguroBRL = totSeguro * ratio
            return {
              seq: idx + 1, produto: it.produto, descricao: it.produto,
              ncm: '90189099', qty: it.qty,
              fobBRL, freteBRL, seguroBRL, cifBRL: fobBRL + freteBRL + seguroBRL,
            }
          })
        }
      } catch (_) { /* Invoice é best-effort */ }
    }

    if (items.length > 0) {
      result.itens = computeRateio(items, result.notaFech)
    }

    setErrors(errs)
    setExtr(result)
    setParsing(false)
    if (Object.keys(errs).length === 0) setTab('resumo')
  }

  const fileCount    = Object.keys(files).length
  const requiredDone = DOC_TYPES.filter(d => d.required).every(d => files[d.key])

  return (
    <PageShell>
      <PageHero
        gradient={gradients.import}
        badge="Importação & Aduana"
        icon="🚢"
        title="Upload Inteligente de Documentos"
        subtitle="Arraste DUIMP + Nota de Fechamento · o sistema extrai adições, rateia tributos por item e gera a planilha completa"
        kpis={[
          { label: 'Docs carregados', value: String(fileCount), sub: `${DOC_TYPES.filter(d => d.required).length} obrigatórios` },
          { label: 'Status', value: requiredDone ? 'Pronto' : 'Aguardando', sub: requiredDone ? '✓ ok' : 'faltam docs' },
          { label: 'Processo', value: extracted?.duimp?.nRef || '—', sub: extracted?.duimp?.duimp || 'aguardando upload' },
          {
            label: 'Custo Total Calculado',
            value: extracted?.itens
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(extracted.itens.reduce((s, it) => s + it.custoTotal, 0))
              : extracted?.duimp?.cifBRL
                ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(extracted.duimp.cifBRL)
                : '—',
            sub: extracted?.itens ? 'base para NF de entrada' : 'aguarda extração',
          },
        ]}
      />

      <div style={{ display: 'flex', gap: 4, marginTop: 20, padding: 4, background: C.gray, borderRadius: 10 }}>
        {[
          { key: 'upload', label: '📂 Upload & Parsing' },
          { key: 'resumo', label: '📊 Dados Extraídos', off: !extracted },
          { key: 'rateio', label: '🧮 Rateio por Item',  off: !extracted?.itens },
          { key: 'export', label: '⬇️ Gerar Planilha',  off: !extracted },
        ].map(t => (
          <button key={t.key} onClick={() => !t.off && setTab(t.key)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 700,
            cursor: t.off ? 'default' : 'pointer', transition: 'all .15s',
            background: tab === t.key ? '#6d28d9' : 'transparent',
            color: tab === t.key ? '#fff' : t.off ? C.gray3 : C.gray4,
            opacity: t.off ? 0.5 : 1,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === 'upload' && (
          <UploadTab
            files={files} errors={errors} parsing={parsing} dragging={dragging}
            requiredDone={requiredDone}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onFileInput={e => Array.from(e.target.files).forEach(assignFile)}
            onManualAssign={(key, file) => setFiles(prev => ({ ...prev, [key]: file }))}
            onRemove={removeFile}
            onParse={parseAll}
            onReset={() => { setFiles({}); setExtr(null); setErrors({}) }}
          />
        )}
        {tab === 'resumo' && extracted && <ResumoTab data={extracted} />}
        {tab === 'rateio' && extracted?.itens && <RateioTab data={extracted} />}
        {tab === 'export' && extracted && <ExportTab data={extracted} onExport={() => generateXlsx(extracted)} />}
      </div>
    </PageShell>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD TAB
// ─────────────────────────────────────────────────────────────────────────────
function UploadTab({ files, errors, parsing, dragging, requiredDone, onDrop, onDragOver, onDragLeave, onFileInput, onManualAssign, onRemove, onParse, onReset }) {
  const mainInputRef = useRef(null)
  const fileCount = Object.keys(files).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => mainInputRef.current?.click()}
        style={{
          gridColumn: '1 / -1', border: `2px dashed ${dragging ? '#7C3AED' : C.gray2}`,
          borderRadius: 16, padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
          background: dragging ? '#f5f3ff' : C.gray,
          boxShadow: dragging ? '0 0 0 4px #ede9fe' : 'none', transition: 'all .2s',
        }}
      >
        <input ref={mainInputRef} type="file" multiple accept=".pdf,.xlsx" style={{ display: 'none' }} onChange={onFileInput} />
        <div style={{ marginBottom: 16 }}><Upload size={44} color={dragging ? '#7C3AED' : C.gray3} /></div>
        <div style={{ fontSize: 18, fontWeight: 900, color: dragging ? '#5b21b6' : C.dark, marginBottom: 8 }}>
          {dragging ? 'Solte aqui!' : 'Arraste os documentos do processo'}
        </div>
        <div style={{ fontSize: 13, color: C.gray4, marginBottom: 20 }}>Ou clique para selecionar · suporta PDF e XLSX</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          {DOC_TYPES.map(d => (
            <span key={d.key} style={{
              padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: files[d.key] ? '#dcfce7' : d.bg,
              color: files[d.key] ? '#166534' : d.color,
              border: `1px solid ${files[d.key] ? '#86efac' : 'transparent'}`,
            }}>
              {files[d.key] ? '✓ ' : ''}{d.label}
            </span>
          ))}
        </div>
      </div>

      <div className="cl-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: C.gray4, marginBottom: 14 }}>
          Checklist de Documentos
        </div>
        {DOC_TYPES.map(cfg => {
          const file = files[cfg.key]
          const err  = errors[cfg.key]
          return (
            <div key={cfg.key} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 10, marginBottom: 6,
              background: file ? cfg.bg : err ? '#fef2f2' : C.gray,
              border: `1px solid ${file ? cfg.color + '44' : err ? '#fca5a5' : C.gray2}`,
            }}>
              {file ? <CheckCircle size={15} color={cfg.color} />
                : err ? <AlertTriangle size={15} color={C.red} />
                : <div style={{ width: 15, height: 15, border: `2px solid ${C.gray2}`, borderRadius: '50%' }} />}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>{cfg.label}</span>
                  {cfg.required && <span style={{ fontSize: 9, color: C.red, fontWeight: 800 }}>OBRIGATÓRIO</span>}
                </div>
                {file ? <div style={{ fontSize: 10, color: C.gray4 }}>{file.name}</div>
                  : err ? <div style={{ fontSize: 10, color: C.red }}>{err}</div>
                  : <div style={{ fontSize: 10, color: C.gray3 }}>{cfg.hint}</div>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {file && (
                  <button onClick={e => { e.stopPropagation(); onRemove(cfg.key) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <X size={13} color={C.gray3} />
                  </button>
                )}
                <label onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                  <input type="file" accept={cfg.ext} style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && onManualAssign(cfg.key, e.target.files[0])} />
                  <Upload size={13} color={C.gray3} />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="cl-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: C.gray4, marginBottom: 12 }}>
            Como usar
          </div>
          {[
            { step: '1', text: 'Arraste a DUIMP Desembaraçada e a Nota de Fechamento (obrigatórios) · Invoice opcional' },
            { step: '2', text: 'O sistema detecta o tipo automaticamente pelo nome do arquivo' },
            { step: '3', text: '"Extrair & Calcular" — lê os PDFs e extrai adições/itens diretamente da DUIMP' },
            { step: '4', text: 'Revise o "Rateio por Item": CIF, tributos e custo unitário gerados automaticamente' },
            { step: '5', text: '"Gerar Planilha" baixa o xlsx com Cálculo por Item + Resumo + DI Geral + NF Entrada + Contab. + NCM' },
          ].map(({ step, text }) => (
            <div key={step} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
              <div style={{
                minWidth: 22, height: 22, borderRadius: '50%', background: '#ede9fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800, color: '#6d28d9',
              }}>{step}</div>
              <div style={{ fontSize: 12, color: C.gray4, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>

        <button onClick={onParse} disabled={parsing || fileCount === 0} style={{
          padding: 14, borderRadius: 12, border: 'none', fontSize: 15, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: parsing || fileCount === 0 ? 'not-allowed' : 'pointer',
          background: fileCount === 0 ? C.gray2 : parsing ? '#ede9fe' : 'linear-gradient(90deg, #5b21b6, #7C3AED)',
          color: fileCount === 0 ? C.gray3 : parsing ? '#6d28d9' : '#fff',
        }}>
          {parsing
            ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Extraindo e calculando rateio...</>
            : <><Zap size={18} /> Extrair &amp; Calcular</>
          }
        </button>

        {fileCount > 0 && (
          <button onClick={onReset} style={{
            padding: 10, borderRadius: 10, border: `1px solid ${C.gray2}`,
            background: 'transparent', color: C.gray4, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <RotateCcw size={13} /> Limpar tudo
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RESUMO TAB
// ─────────────────────────────────────────────────────────────────────────────
const F = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)

function DataRow({ label, value, red, green, amber, bold, raw }) {
  const color = red ? C.red : green ? C.green : amber ? C.amber : bold ? C.dark : C.gray4
  const display = raw ? (value || '—') : typeof value === 'number' ? F(value) : (value || '—')
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${C.gray}`, fontSize: 12 }}>
      <span style={{ color: C.gray4 }}>{label}</span>
      <span style={{ fontFamily: display && !raw ? 'monospace' : 'inherit', fontWeight: bold ? 800 : 600, color, fontSize: 12 }}>{display}</span>
    </div>
  )
}

function ResumoTab({ data }) {
  const { duimp: d, notaFech: nf, itens } = data
  const tributos = (d.ii || 0) + (d.ipi || 0) + (d.pis || 0) + (d.cofins || 0) + (d.tus || 0)
  const custoCalc = itens
    ? itens.reduce((s, it) => s + it.custoTotal, 0)
    : (d.cifBRL || 0) + tributos + (nf.armazenagem || 0) + (nf.dape || 0) + (nf.freteRod || 0) + (nf.dta || 0) + (nf.lpco || 0) + (nf.expediente || 0) + (nf.tus || 0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Valor Aduaneiro (CIF)', value: d.cifBRL || 0, color: '#6d28d9' },
          { label: 'Total Tributos DI', value: tributos, color: C.red },
          { label: 'Frete Internacional', value: nf.freteInt || 0, color: C.amber },
          { label: 'Custo Total (base NF)', value: custoCalc, color: C.green },
        ].map(kpi => (
          <div key={kpi.label} style={{ padding: '14px 16px', borderRadius: 12, background: C.gray, border: `1px solid ${C.gray2}` }}>
            <div style={{ fontSize: 10, color: C.gray4, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 18, fontWeight: 900, fontFamily: 'monospace', color: kpi.color }}>{F(kpi.value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div className="cl-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#7C3AED', marginBottom: 12 }}>📋 DUIMP</div>
          <DataRow label="N/REF" value={d.nRef} raw />
          <DataRow label="DUIMP" value={d.duimp} raw />
          <DataRow label="AWB" value={d.awb} raw />
          <DataRow label="Embarque" value={d.embarque} raw />
          <DataRow label="Taxa USD/BRL" value={`R$ ${d.taxa || '—'}`} raw />
          <DataRow label="FOB (R$)" value={d.fobBRL || 0} />
          <DataRow label="Frete DI" value={d.freteBRL || 0} />
          <DataRow label="Seguro DI" value={d.seguroBRL || 0} />
          <DataRow label="CIF (R$)" value={d.cifBRL || 0} bold />
        </div>

        <div className="cl-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: C.red, marginBottom: 12 }}>🏛️ Tributos</div>
          <DataRow label="II (14,4% × CIF)" value={d.ii || 0} red />
          <DataRow label="IPI (5,2% × CIF+II)" value={d.ipi || 0} amber />
          <DataRow label="PIS (0,21% eff.)" value={d.pis || 0} amber />
          <DataRow label="COFINS (0,965% eff.)" value={d.cofins || 0} amber />
          <DataRow label="Taxa Siscomex" value={d.tus || 0} />
          <DataRow label="Total Tributos" value={tributos} bold red />
          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: '#fef9c3', fontSize: 10, color: '#854d0e' }}>
            NCM 9018.9099 · ICMS zerado · PIS/COFINS redução 10%
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="cl-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#059669', marginBottom: 12 }}>💰 Nota de Fechamento</div>
            <DataRow label="Frete Intl. (pago)" value={nf.freteInt || 0} />
            <DataRow label="LPCO ANVISA" value={nf.lpco || 0} />
            <DataRow label="Armazenagem" value={nf.armazenagem || 0} />
            <DataRow label="DAPE" value={nf.dape || 0} />
            <DataRow label="Frete Rodoviário" value={nf.freteRod || 0} />
            <DataRow label="DTA" value={nf.dta || 0} />
            <DataRow label="Expediente" value={nf.expediente || 0} />
            <DataRow label="Saldo a favor" value={nf.saldoFavor || 0} green bold />
          </div>
          <div className="cl-card" style={{ padding: 20, border: '1px solid #86efac', background: '#f0fdf4' }}>
            <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#166534', marginBottom: 12 }}>🧾 NF Entrada — A Emitir</div>
            <DataRow label="Valor Produtos" value={custoCalc - (d.ipi || 0)} />
            <DataRow label="IPI destacado" value={d.ipi || 0} amber />
            <DataRow label="ICMS" value={0} />
            <DataRow label="PIS (crédito base)" value={d.pis || 0} amber />
            <DataRow label="COFINS (crédito base)" value={d.cofins || 0} amber />
            <DataRow label="VALOR TOTAL DA NF" value={custoCalc} bold />
            <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: '#dcfce7', fontSize: 10, color: '#166534' }}>
              Valores prontos na aba "NF Entrada" do xlsx gerado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// RATEIO TAB
// ─────────────────────────────────────────────────────────────────────────────
function RateioTab({ data }) {
  const { itens, notaFech: nf } = data
  if (!itens || itens.length === 0) return null

  const despTotal =
    (nf?.tus || 0) + (nf?.armazenagem || 0) + (nf?.lpco || 0) +
    (nf?.dape || 0) + (nf?.freteRod || 0) + (nf?.dta || 0) + (nf?.expediente || 0)

  const totalCIF    = itens.reduce((s, it) => s + it.cifBRL, 0)
  const totalCustoT = itens.reduce((s, it) => s + it.custoTotal, 0)
  const pct = v => ((v || 0) * 100).toFixed(2) + '%'

  return (
    <div>
      <div style={{ padding: '12px 16px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 20, fontSize: 12, color: '#1e40af' }}>
        <strong>Critério de rateio:</strong> Tributos e despesas acessórias distribuídos pelo <strong>CIF de cada item</strong> (FOB + Frete + Seguro individualmente alocados na DUIMP). NCM 9018.9099 · II=14,4% · IPI=5,2% · PIS/COFINS com redução 10% · ICMS=0.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${itens.length}, 1fr)`, gap: 16, marginBottom: 24 }}>
        {itens.map((it, i) => (
          <div key={i} className="cl-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 900, color: C.dark }}>{it.produto}</div>
                <div style={{ fontSize: 11, color: C.gray4 }}>{it.descricao}</div>
                <div style={{ fontSize: 11, color: C.gray3 }}>NCM {it.ncm} · {it.qty} un</div>
              </div>
              <div style={{ padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: '#ede9fe', color: '#6d28d9' }}>
                {pct(it.ratio)} do CIF
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <ItemRow label="FOB (R$)"           value={it.fobBRL} />
              <ItemRow label="Frete alocado"       value={it.freteBRL} />
              <ItemRow label="Seguro alocado"      value={it.seguroBRL} />
              <ItemRow label="CIF total item"      value={it.cifBRL} bold />
              <div style={{ borderTop: `1px dashed ${C.gray2}`, margin: '4px 0' }} />
              <ItemRow label="II (14,4% × CIF)"      value={it.ii}     red />
              <ItemRow label="IPI (5,2% × CIF+II)"   value={it.ipi}    amber />
              <ItemRow label="PIS (0,21% × CIF)"     value={it.pis}    amber />
              <ItemRow label="COFINS (0,965% × CIF)" value={it.cofins} amber />
              <ItemRow label="ICMS"                  value={0} />
              <div style={{ borderTop: `1px dashed ${C.gray2}`, margin: '4px 0' }} />
              <ItemRow label={`Desp. (${pct(it.ratio)} × ${F(despTotal)})`} value={it.desp} />
              <div style={{ height: 4 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: '#f5f3ff' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#5b21b6' }}>Custo Total</span>
                <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'monospace', color: '#5b21b6' }}>{F(it.custoTotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: '#dcfce7' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#166534' }}>Custo Unit. ({it.qty} un)</span>
                <span style={{ fontSize: 14, fontWeight: 900, fontFamily: 'monospace', color: '#166534' }}>{F(it.custoUnit)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cl-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: C.gray4, marginBottom: 14 }}>
          Comparativo Custo Landed — Todos os Itens
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: C.gray }}>
                {['Produto', 'Qtde', 'CIF R$', '% CIF', 'Tributos R$', 'Despesas R$', 'Custo Total R$', 'Custo Unit. R$'].map((h, hi) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: hi === 0 ? 'left' : 'right', fontWeight: 700, color: C.gray4, borderBottom: `1px solid ${C.gray2}`, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itens.map((it, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.gray}` }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: C.dark }}>{it.produto}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: C.gray4 }}>{it.qty}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace' }}>{F(it.cifBRL)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: C.gray4 }}>{pct(it.ratio)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: C.red }}>{F(it.taxTotal)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', color: C.amber }}>{F(it.desp)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#6d28d9' }}>{F(it.custoTotal)}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: C.green }}>{F(it.custoUnit)}</td>
                </tr>
              ))}
              <tr style={{ background: C.gray }}>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: C.dark }}>TOTAL</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>—</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800 }}>{F(totalCIF)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>100%</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: C.red }}>{F(itens.reduce((s, it) => s + it.taxTotal, 0))}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: C.amber }}>{F(despTotal)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: '#6d28d9' }}>{F(totalCustoT)}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ItemRow({ label, value, bold, red, amber }) {
  const color = red ? C.red : amber ? C.amber : bold ? C.dark : C.gray4
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color }}>
      <span>{label}</span>
      <span style={{ fontFamily: 'monospace', fontWeight: bold ? 800 : 500 }}>{F(value)}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT TAB
// ─────────────────────────────────────────────────────────────────────────────
function ExportTab({ data, onExport }) {
  const { duimp: d, notaFech: nf, itens } = data
  const custoCalc = itens
    ? itens.reduce((s, it) => s + it.custoTotal, 0)
    : (d.cifBRL || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680, margin: '0 auto' }}>
      <div className="cl-card" style={{ padding: 32, textAlign: 'center' }}>
        <FileSpreadsheet size={52} color="#7C3AED" style={{ margin: '0 auto 16px' }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: C.dark, marginBottom: 8 }}>Planilha Pronta para Download</div>
        <div style={{ fontSize: 13, color: C.gray4, marginBottom: 4 }}>
          Processo: <strong>{d?.nRef || '—'}</strong> · DUIMP: <strong>{d?.duimp || '—'}</strong>
        </div>
        <div style={{ fontSize: 13, color: C.gray4, marginBottom: 24 }}>
          Custo Total Calculado: <strong>{F(custoCalc)}</strong>
          {itens && <> · <strong>{itens.length} itens</strong> com custo unitário rateado</>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28, textAlign: 'left' }}>
          {[
            ...(itens ? [
              { tab: 'taxas',          desc: 'Taxa de câmbio USD/BRL extraída da DUIMP', icon: '💱', highlight2: true },
              { tab: 'Itens',          desc: `${itens.length} itens com FOB, Frete e Seguro alocados (gerado da DUIMP)`, icon: '📦', highlight2: true },
            ] : []),
            { tab: 'Resumo',    desc: 'Composição + Acerto ROTA (DI vs A PG vs Ajustes)', icon: '📊' },
            { tab: 'DI Geral',  desc: `${itens ? `${itens.length} linhas por item` : 'Totais consolidados'} · tributos e custo unit.`, icon: '🧮' },
            { tab: 'NF Entrada',desc: 'Valores calculados prontos para emitir a NF de entrada', icon: '🧾', highlight: true },
            { tab: 'Contab.',   desc: 'Lançamentos D/C prontos para ERP', icon: '📒' },
            { tab: 'NCM',       desc: 'Alíquotas com fórmulas documentadas', icon: '📋' },
          ].map(item => (
            <div key={item.tab} style={{
              padding: '12px 14px', borderRadius: 10,
              background: item.highlight ? '#f0fdf4' : item.highlight2 ? '#eff6ff' : C.gray,
              border: `1px solid ${item.highlight ? '#86efac' : item.highlight2 ? '#bfdbfe' : C.gray2}`,
            }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>
                {item.icon} <strong style={{ color: item.highlight ? '#166534' : item.highlight2 ? '#1e40af' : 'inherit' }}>{item.tab}</strong>
              </div>
              <div style={{ fontSize: 11, color: item.highlight ? '#166534' : item.highlight2 ? '#1e40af' : C.gray4 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        <button onClick={onExport} style={{
          width: '100%', padding: 16, borderRadius: 12, border: 'none',
          background: 'linear-gradient(90deg, #5b21b6, #7C3AED)',
          color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 4px 24px rgba(109,40,217,.35)',
        }}>
          <Download size={20} />
          Baixar Planilha_Importacao_{d?.nRef || 'output'}.xlsx
        </button>

        <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'left' }}>
          <Info size={11} style={{ display: 'inline', marginRight: 4, color: '#1e40af' }} />
          <span style={{ fontSize: 11, color: '#1e40af' }}>
            {itens
              ? <>As abas <strong>taxas</strong> e <strong>Itens</strong> foram <strong>geradas automaticamente</strong> da DUIMP — equivalem ao "Cálculo por Item" com FOB, Frete e Seguro alocados por adição.</>
              : <>Carregue a <strong>DUIMP</strong> e o <strong>Invoice</strong> para obter o cálculo por item automaticamente — nenhum xlsx manual necessário.</>
            }
          </span>
        </div>
      </div>
    </div>
  )
}
