// ─────────────────────────────────────────────────────────────────────────────
// GERADOR DE PLANILHA — layout premium (exceljs)
// Paleta de marca Contourline, bandas de título, cards de KPI, formato R$,
// bordas, zebra striping e painéis congelados.
// ─────────────────────────────────────────────────────────────────────────────
import ExcelJS from 'exceljs'

const brl = v => (typeof v === 'number' && isFinite(v) ? v : 0)

const NCM_RATES = {
  '90189099': { ii: 0.144, ipi: 0.052, pisNorm: 0.021, pisRed: 0.10, cofinsNorm: 0.0965, cofinsRed: 0.10, icms: 0 },
  '90189090': { ii: 0.144, ipi: 0.052, pisNorm: 0.021, pisRed: 0.10, cofinsNorm: 0.0965, cofinsRed: 0.10, icms: 0 },
  default:    { ii: 0.000, ipi: 0.000, pisNorm: 0.021, pisRed: 1.00, cofinsNorm: 0.0965, cofinsRed: 1.00, icms: 0 },
}
const getNcmRates = ncm => NCM_RATES[String(ncm).replace(/\D/g, '')] || NCM_RATES.default

// ── Paleta (ARGB) ────────────────────────────────────────────────────────────
const C = {
  primary: 'FF5B21B6', primary2: 'FF7C3AED', light: 'FFEDE9FE', light2: 'FFF5F3FF',
  ink: 'FF1F2937', gray: 'FF6B7280', line: 'FFE5E7EB', white: 'FFFFFFFF',
  green: 'FF166534', greenBg: 'FFDCFCE7', red: 'FFB91C1C', amber: 'FFB45309',
  blue: 'FF1E40AF', blueBg: 'FFEFF6FF', zebra: 'FFFAFAFB',
}
const MONEY = '"R$"\\ #,##0.00'
const MONEYU = '"US$"\\ #,##0.00'
const PCT = '0.00%'
const thin = { style: 'thin', color: { argb: C.line } }
const box = { top: thin, left: thin, bottom: thin, right: thin }
const fillOf = argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } })

// Banda de título (linhas 1-2) ocupando `span` colunas
function titleBand(ws, title, sub, span) {
  ws.mergeCells(1, 1, 1, span)
  const t = ws.getCell(1, 1)
  t.value = title
  t.font = { bold: true, size: 16, color: { argb: C.white }, name: 'Calibri' }
  t.fill = fillOf(C.primary)
  t.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(1).height = 30
  ws.mergeCells(2, 1, 2, span)
  const s = ws.getCell(2, 1)
  s.value = sub
  s.font = { size: 10, color: { argb: C.white }, name: 'Calibri' }
  s.fill = fillOf(C.primary2)
  s.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(2).height = 18
}

// Cabeçalho de seção (faixa roxa clara)
function sectionRow(ws, rowIdx, label, span) {
  ws.mergeCells(rowIdx, 1, rowIdx, span)
  const c = ws.getCell(rowIdx, 1)
  c.value = label
  c.font = { bold: true, size: 11, color: { argb: C.primary } }
  c.fill = fillOf(C.light)
  c.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 }
  ws.getRow(rowIdx).height = 20
}

// Cabeçalho de tabela
function headerRow(ws, rowIdx, headers, opts = {}) {
  const r = ws.getRow(rowIdx)
  headers.forEach((h, i) => {
    const c = r.getCell(i + 1)
    c.value = h
    c.font = { bold: true, size: 10, color: { argb: C.white } }
    c.fill = fillOf(opts.fill || C.primary2)
    c.alignment = { vertical: 'middle', horizontal: i === 0 ? 'left' : 'center', wrapText: true, indent: i === 0 ? 1 : 0 }
    c.border = box
  })
  r.height = 28
}

export function buildWorkbook(data) {
  const { duimp: d, notaFech: nf, itens } = data
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Fiscal Intel — Contourline'
  wb.company = 'Contourline Equipamentos Médicos'

  const tributosDI = brl(d.ii) + brl(d.ipi) + brl(d.pis) + brl(d.cofins) + brl(d.tus)
  const despTotal = brl(nf.armazenagem) + brl(nf.dape) + brl(nf.freteRod) +
    brl(nf.dta) + brl(nf.lpco) + brl(nf.expediente) + brl(nf.tus)
  const totalAPG = tributosDI + despTotal + brl(nf.freteInt)
  const ajustes = brl(d.pis) + brl(d.cofins)
  const totalDI = totalAPG - ajustes
  const custoTotalCalc = itens
    ? itens.reduce((s, it) => s + brl(it.custoTotal), 0)
    : brl(d.cifBRL) + tributosDI + despTotal
  const proc = `${d.nRef || '—'}  ·  DUIMP ${d.duimp || '—'}`

  // ═══════════════════════════════════════════════════════════════════════════
  // 1) RESUMO (capa)
  // ═══════════════════════════════════════════════════════════════════════════
  const ws = wb.addWorksheet('Resumo', {
    views: [{ showGridLines: false }],
    properties: { defaultColWidth: 16 },
  })
  ws.columns = [
    { width: 3 }, { width: 26 }, { width: 18 }, { width: 4 },
    { width: 26 }, { width: 18 }, { width: 4 }, { width: 22 }, { width: 18 },
  ]
  titleBand(ws, 'FISCAL INTEL — Planilha de Importação', `Processo ${proc}`, 9)

  // bloco de info do processo
  ws.getCell('B4').value = 'Importador'
  ws.getCell('B4').font = { size: 9, color: { argb: C.gray }, bold: true }
  ws.getCell('B5').value = 'CONTOURLINE EQUIP. MÉDICOS'
  ws.getCell('B5').font = { size: 11, bold: true, color: { argb: C.ink } }
  ws.getCell('E4').value = 'Taxa câmbio (USD)'
  ws.getCell('E4').font = { size: 9, color: { argb: C.gray }, bold: true }
  ws.getCell('E5').value = brl(d.taxa)
  ws.getCell('E5').numFmt = '#,##0.0000'
  ws.getCell('E5').font = { size: 11, bold: true, color: { argb: C.ink } }
  ws.getCell('H4').value = 'Data DUIMP / AWB'
  ws.getCell('H4').font = { size: 9, color: { argb: C.gray }, bold: true }
  ws.getCell('H5').value = `${d.embarque || '—'}  ·  ${d.awb || '—'}`
  ws.getCell('H5').font = { size: 11, bold: true, color: { argb: C.ink } }

  // KPI cards (linha 7-9)
  const kpis = [
    { label: 'VALOR ADUANEIRO (CIF)', value: brl(d.cifBRL), color: C.primary },
    { label: 'TRIBUTOS DI', value: tributosDI, color: C.red },
    { label: 'DESPESAS + FRETE', value: despTotal + brl(nf.freteInt), color: C.amber },
    { label: 'CUSTO TOTAL (BASE NF)', value: custoTotalCalc, color: C.green },
  ]
  const kpiCols = [[2, 3], [5, 6], [8, 9], [2, 3]] // segunda linha reaproveita
  // Dispor 4 cards em 2 colunas × 2 linhas para caber no grid
  const kpiPos = [{ r: 7, c1: 2, c2: 3 }, { r: 7, c1: 5, c2: 6 }, { r: 7, c1: 8, c2: 9 }, { r: 10, c1: 2, c2: 3 }]
  void kpiCols
  kpis.forEach((k, i) => {
    const p = kpiPos[i]
    ws.mergeCells(p.r, p.c1, p.r, p.c2)
    const lab = ws.getCell(p.r, p.c1)
    lab.value = k.label
    lab.font = { size: 8, bold: true, color: { argb: C.gray } }
    lab.fill = fillOf(C.light2)
    lab.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    lab.border = { top: box.top, left: box.left, right: box.right }
    ws.mergeCells(p.r + 1, p.c1, p.r + 1, p.c2)
    const val = ws.getCell(p.r + 1, p.c1)
    val.value = k.value
    val.numFmt = MONEY
    val.font = { size: 15, bold: true, color: { argb: k.color } }
    val.fill = fillOf(C.light2)
    val.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 }
    val.border = { bottom: box.bottom, left: box.left, right: box.right }
    ws.getRow(p.r).height = 16
    ws.getRow(p.r + 1).height = 24
  })

  // Composição de tributos (tabela)
  let row = 13
  sectionRow(ws, row, 'Composição de Tributos & Despesas', 9); row++
  headerRow(ws, row, ['Descrição', 'Valor DI', 'Pagar Rota'], { fill: C.primary2 })
  // estende header até col 6
  ;[4, 5, 6].forEach(c => { const cc = ws.getCell(row, c); cc.fill = fillOf(C.primary2); cc.border = box })
  ws.mergeCells(row, 2, row, 3); ws.mergeCells(row, 4, row, 6)
  ws.getCell(row, 2).value = 'Valor DI'; ws.getCell(row, 4).value = 'Pagar Rota'
  ws.getCell(row, 4).alignment = { horizontal: 'center', vertical: 'middle' }
  ws.getCell(row, 4).font = { bold: true, size: 10, color: { argb: C.white } }
  row++
  const comp = [
    ['II (Imposto de Importação)', brl(d.ii), brl(d.ii)],
    ['IPI', brl(d.ipi), brl(d.ipi)],
    ['PIS', 0, brl(d.pis)],
    ['COFINS', 0, brl(d.cofins)],
    ['Taxa Siscomex (TUS)', brl(d.tus), brl(d.tus)],
    ['Armazenagem', brl(nf.armazenagem), brl(nf.armazenagem)],
    ['LPCO ANVISA', brl(nf.lpco), brl(nf.lpco)],
    ['DAPE / Frete Rod. / DTA', brl(nf.dape) + brl(nf.freteRod) + brl(nf.dta), brl(nf.dape) + brl(nf.freteRod) + brl(nf.dta)],
    ['Expediente Rota', brl(nf.expediente), brl(nf.expediente)],
    ['Frete Internacional', brl(nf.freteInt), brl(nf.freteInt)],
  ]
  const compStart = row
  comp.forEach((c, i) => {
    const r = ws.getRow(row)
    r.getCell(1).value = c[0]
    r.getCell(1).alignment = { indent: 1 }
    ws.mergeCells(row, 2, row, 3); r.getCell(2).value = c[1]; r.getCell(2).numFmt = MONEY
    ws.mergeCells(row, 4, row, 6); r.getCell(4).value = c[2]; r.getCell(4).numFmt = MONEY
    const zebra = i % 2 === 1
    ;[1, 2, 3, 4, 5, 6].forEach(col => {
      const cc = r.getCell(col)
      cc.border = box
      if (zebra) cc.fill = fillOf(C.zebra)
      if (col === 1) cc.font = { size: 10, color: { argb: C.ink } }
      else cc.font = { size: 10, color: { argb: C.ink } }
    })
    r.getCell(2).alignment = { horizontal: 'right' }
    r.getCell(4).alignment = { horizontal: 'right' }
    row++
  })
  // total
  {
    const r = ws.getRow(row)
    r.getCell(1).value = 'TOTAL'
    ws.mergeCells(row, 2, row, 3); r.getCell(2).value = { formula: `SUM(B${compStart}:B${row - 1})` }; r.getCell(2).numFmt = MONEY
    ws.mergeCells(row, 4, row, 6); r.getCell(4).value = { formula: `SUM(D${compStart}:D${row - 1})` }; r.getCell(4).numFmt = MONEY
    ;[1, 2, 3, 4, 5, 6].forEach(col => {
      const cc = r.getCell(col)
      cc.fill = fillOf(C.light)
      cc.font = { bold: true, size: 11, color: { argb: C.primary } }
      cc.border = { ...box, top: { style: 'medium', color: { argb: C.primary } } }
    })
    r.getCell(2).alignment = { horizontal: 'right' }
    r.getCell(4).alignment = { horizontal: 'right' }
    r.height = 22
  }
  ws.views = [{ showGridLines: false, state: 'frozen', ySplit: 2 }]

  // ═══════════════════════════════════════════════════════════════════════════
  // 2) CÁLCULO POR ITEM (estrela)
  // ═══════════════════════════════════════════════════════════════════════════
  if (itens && itens.length > 0) {
    const wi = wb.addWorksheet('Cálculo por Item', { views: [{ showGridLines: false }] })
    wi.columns = [
      { width: 5 }, { width: 16 }, { width: 12 }, { width: 7 },
      { width: 15 }, { width: 14 }, { width: 13 }, { width: 15 },
      { width: 13 }, { width: 13 }, { width: 12 }, { width: 12 },
      { width: 14 }, { width: 16 }, { width: 15 },
    ]
    const span = 15
    titleBand(wi, 'CÁLCULO POR ITEM', `Rateio de tributos e despesas por CIF · ${proc}`, span)
    const H = ['#', 'Produto', 'NCM', 'Qtde', 'FOB R$', 'Frete R$', 'Seguro R$', 'CIF R$',
      'II R$', 'IPI R$', 'PIS R$', 'COFINS R$', 'Desp. R$', 'CUSTO TOTAL R$', 'CUSTO UNIT. R$']
    headerRow(wi, 4, H)
    let r = 5
    itens.forEach((it, i) => {
      const rr = wi.getRow(r)
      const vals = [it.seq || i + 1, it.produto, it.ncm, it.qty,
        brl(it.fobBRL), brl(it.freteBRL), brl(it.seguroBRL), brl(it.cifBRL),
        brl(it.ii), brl(it.ipi), brl(it.pis), brl(it.cofins), brl(it.desp),
        brl(it.custoTotal), brl(it.custoUnit)]
      vals.forEach((v, ci) => {
        const cc = rr.getCell(ci + 1)
        cc.value = v
        cc.border = box
        if (i % 2 === 1) cc.fill = fillOf(C.zebra)
        if (ci >= 4) { cc.numFmt = MONEY; cc.alignment = { horizontal: 'right' } }
        else cc.alignment = { horizontal: ci === 1 ? 'left' : 'center', indent: ci === 1 ? 1 : 0 }
        cc.font = { size: 10, color: { argb: C.ink } }
        if (ci === 13) cc.font = { size: 10, bold: true, color: { argb: C.primary } }
        if (ci === 14) cc.font = { size: 10, bold: true, color: { argb: C.green } }
        if (ci === 1) cc.font = { size: 10, bold: true, color: { argb: C.ink } }
      })
      rr.height = 18
      r++
    })
    // totais
    const tr = wi.getRow(r)
    const sumCols = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
    tr.getCell(1).value = 'TOTAL'
    wi.mergeCells(r, 1, r, 4)
    sumCols.forEach(col => {
      const L = String.fromCharCode(64 + col)
      const cc = tr.getCell(col)
      cc.value = { formula: `SUM(${L}5:${L}${r - 1})` }
      cc.numFmt = MONEY
      cc.alignment = { horizontal: 'right' }
    })
    for (let col = 1; col <= span; col++) {
      const cc = tr.getCell(col)
      cc.fill = fillOf(C.light)
      cc.font = { bold: true, size: 10, color: { argb: C.primary } }
      cc.border = { ...box, top: { style: 'medium', color: { argb: C.primary } } }
    }
    tr.getCell(1).alignment = { horizontal: 'left', indent: 1 }
    tr.height = 22
    wi.views = [{ showGridLines: false, state: 'frozen', xSplit: 2, ySplit: 4 }]
    wi.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: span } }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3) NF ENTRADA
  // ═══════════════════════════════════════════════════════════════════════════
  const wn = wb.addWorksheet('NF Entrada', { views: [{ showGridLines: false }] })
  wn.columns = [
    { width: 4 }, { width: 18 }, { width: 30 }, { width: 12 }, { width: 7 },
    { width: 15 }, { width: 16 }, { width: 13 }, { width: 13 }, { width: 13 },
  ]
  const spanN = 10
  titleBand(wn, 'NF DE ENTRADA — VALORES CALCULADOS', `CFOP 3.101 · ${proc}`, spanN)
  let rn = 4
  sectionRow(wn, rn, 'Itens para emissão da NF', spanN); rn++
  headerRow(wn, rn, ['', 'Produto / SKU', 'Descrição', 'NCM', 'Qtde', 'Vlr Unit. R$', 'Vlr Total R$', 'IPI R$', 'PIS R$', 'COFINS R$'])
  rn++
  const nfItens = (itens && itens.length > 0)
    ? itens.map(it => ['', it.produto, it.descricao || it.produto, it.ncm, it.qty, brl(it.custoUnit), brl(it.custoTotal), brl(it.ipi), brl(it.pis), brl(it.cofins)])
    : [['', 'PROCESSO CONSOLIDADO', '', '', '', '', custoTotalCalc, brl(d.ipi), brl(d.pis), brl(d.cofins)]]
  const nfStart = rn
  nfItens.forEach((v, i) => {
    const rr = wn.getRow(rn)
    v.forEach((val, ci) => {
      const cc = rr.getCell(ci + 1)
      cc.value = val
      cc.border = box
      if (i % 2 === 1) cc.fill = fillOf(C.zebra)
      if (ci >= 5) { cc.numFmt = MONEY; cc.alignment = { horizontal: 'right' } }
      else cc.alignment = { horizontal: ci <= 2 ? 'left' : 'center', indent: ci <= 2 ? 1 : 0 }
      cc.font = { size: 10, color: { argb: C.ink } }
      if (ci === 1) cc.font = { size: 10, bold: true, color: { argb: C.ink } }
    })
    rn++
  })
  // total produtos
  {
    const rr = wn.getRow(rn)
    rr.getCell(2).value = 'TOTAL PRODUTOS'
    wn.mergeCells(rn, 2, rn, 6)
    ;[7, 8, 9, 10].forEach(col => {
      const L = String.fromCharCode(64 + col)
      rr.getCell(col).value = { formula: `SUM(${L}${nfStart}:${L}${rn - 1})` }
      rr.getCell(col).numFmt = MONEY
      rr.getCell(col).alignment = { horizontal: 'right' }
    })
    for (let col = 2; col <= spanN; col++) {
      const cc = rr.getCell(col)
      cc.fill = fillOf(C.greenBg)
      cc.font = { bold: true, size: 10, color: { argb: C.green } }
      cc.border = { ...box, top: { style: 'medium', color: { argb: C.green } } }
    }
    rr.getCell(2).alignment = { horizontal: 'left', indent: 1 }
    rr.height = 20
    rn++
  }
  rn++
  sectionRow(wn, rn, 'Totais da NF', spanN); rn++
  const totaisNf = [
    ['Valor Total dos Produtos', custoTotalCalc - brl(d.ipi)],
    ['Valor do IPI (destacado)', brl(d.ipi)],
    ['VALOR TOTAL DA NF', custoTotalCalc],
  ]
  totaisNf.forEach((t, i) => {
    const rr = wn.getRow(rn)
    wn.mergeCells(rn, 2, rn, 6); rr.getCell(2).value = t[0]
    wn.mergeCells(rn, 7, rn, 8); rr.getCell(7).value = t[1]; rr.getCell(7).numFmt = MONEY
    const last = i === totaisNf.length - 1
    ;[2, 3, 4, 5, 6, 7, 8].forEach(col => {
      const cc = rr.getCell(col)
      cc.border = box
      cc.fill = fillOf(last ? C.light : C.zebra)
      cc.font = { size: 10, bold: last, color: { argb: last ? C.primary : C.ink } }
    })
    rr.getCell(2).alignment = { indent: 1 }
    rr.getCell(7).alignment = { horizontal: 'right' }
    rn++
  })
  rn++
  sectionRow(wn, rn, 'Créditos Fiscais (lançar separado)', spanN); rn++
  const cred = [
    ['PIS a recuperar (crédito)', brl(d.pis) / (NCM_RATES['90189099'].pisRed)],
    ['COFINS a recuperar (crédito)', brl(d.cofins) / (NCM_RATES['90189099'].cofinsRed)],
    ['IPI a recuperar (se aplicável)', brl(d.ipi)],
  ]
  cred.forEach(t => {
    const rr = wn.getRow(rn)
    wn.mergeCells(rn, 2, rn, 6); rr.getCell(2).value = t[0]
    wn.mergeCells(rn, 7, rn, 8); rr.getCell(7).value = t[1]; rr.getCell(7).numFmt = MONEY
    ;[2, 3, 4, 5, 6, 7, 8].forEach(col => { const cc = rr.getCell(col); cc.border = box; cc.font = { size: 10, color: { argb: C.amber } } })
    rr.getCell(2).alignment = { indent: 1 }
    rr.getCell(7).alignment = { horizontal: 'right' }
    rn++
  })
  wn.views = [{ showGridLines: false, state: 'frozen', ySplit: 2 }]

  // ═══════════════════════════════════════════════════════════════════════════
  // 4) CONTAB.
  // ═══════════════════════════════════════════════════════════════════════════
  const wc = wb.addWorksheet('Contab.', { views: [{ showGridLines: false }] })
  wc.columns = [{ width: 4 }, { width: 18 }, { width: 38 }, { width: 8 }, { width: 16 }, { width: 16 }]
  const spanC = 6
  titleBand(wc, 'LANÇAMENTOS CONTÁBEIS', `Débito / Crédito · ${proc}`, spanC)
  headerRow(wc, 4, ['', 'Conta contábil', 'Descrição', 'D/C', 'Valor USD', 'Valor R$'])
  const ratesRef = NCM_RATES['90189099']
  const lanc = [
    ['1.1.03.07.0007', 'COFINS Não Cumulativo Importação', 'D', null, brl(d.cofins) / ratesRef.cofinsRed],
    ['1.1.03.07.0007', 'PIS Não Cumulativo Importação', 'D', null, brl(d.pis) / ratesRef.pisRed],
    ['', 'IPI a recuperar', 'D', null, brl(d.ipi)],
    ['', 'Equipamentos / Mercadorias', 'D', null, custoTotalCalc - brl(d.ipi)],
    ['', 'Fornecedor Exterior (Invoice)', 'C', brl(d.fobUSD), -brl(d.fobBRL)],
    ['', 'Rota Brazil (Contas a Pagar)', 'C', null, -totalAPG],
    ['3.2.04.01.0003', 'Variação Cambial Passiva', '', null, brl(d.pis) + brl(d.cofins)],
  ]
  let rc = 5
  lanc.forEach((l, i) => {
    const rr = wc.getRow(rc)
    rr.getCell(2).value = l[0]
    rr.getCell(3).value = l[1]
    rr.getCell(4).value = l[2]
    rr.getCell(5).value = l[3]; if (l[3] != null) rr.getCell(5).numFmt = MONEYU
    rr.getCell(6).value = l[4]; rr.getCell(6).numFmt = MONEY
    ;[1, 2, 3, 4, 5, 6].forEach(col => {
      const cc = rr.getCell(col)
      cc.border = box
      if (i % 2 === 1) cc.fill = fillOf(C.zebra)
      cc.font = { size: 10, color: { argb: l[4] < 0 ? C.red : C.ink } }
    })
    rr.getCell(2).alignment = { indent: 1 }
    rr.getCell(3).alignment = { indent: 1 }
    rr.getCell(4).alignment = { horizontal: 'center' }
    rr.getCell(4).font = { size: 10, bold: true, color: { argb: l[2] === 'D' ? C.green : l[2] === 'C' ? C.red : C.gray } }
    rr.getCell(5).alignment = { horizontal: 'right' }
    rr.getCell(6).alignment = { horizontal: 'right' }
    rc++
  })
  wc.views = [{ showGridLines: false, state: 'frozen', ySplit: 4 }]

  // ═══════════════════════════════════════════════════════════════════════════
  // 5) NCM (alíquotas)
  // ═══════════════════════════════════════════════════════════════════════════
  const wnc = wb.addWorksheet('NCM', { views: [{ showGridLines: false }] })
  wnc.columns = [{ width: 4 }, { width: 14 }, { width: 10 }, { width: 10 }, { width: 12 }, { width: 12 }, { width: 13 }, { width: 13 }, { width: 36 }]
  const spanNc = 9
  titleBand(wnc, 'ALÍQUOTAS POR NCM', 'Bases de cálculo aplicadas', spanNc)
  headerRow(wnc, 4, ['', 'NCM', 'II', 'IPI', 'PIS efet.', 'COFINS efet.', 'ICMS', 'Tipo', 'Observação'])
  const ncmsUsados = [...new Set((itens || []).map(it => it.ncm).filter(Boolean))]
  if (ncmsUsados.length === 0) ncmsUsados.push('90189099')
  let rnc = 5
  ncmsUsados.forEach((ncm, i) => {
    const r = getNcmRates(ncm)
    const rr = wnc.getRow(rnc)
    const vals = ['', ncm, r.ii, r.ipi, r.pisNorm * r.pisRed, r.cofinsNorm * r.cofinsRed, r.icms, 'Disp. médico', 'Redução PIS/COFINS por convênio CAMEX']
    vals.forEach((v, ci) => {
      const cc = rr.getCell(ci + 1)
      cc.value = v
      cc.border = box
      if (i % 2 === 1) cc.fill = fillOf(C.zebra)
      cc.font = { size: 10, color: { argb: C.ink } }
      if (ci >= 2 && ci <= 6) { cc.numFmt = PCT; cc.alignment = { horizontal: 'center' } }
      if (ci === 1) cc.font = { size: 10, bold: true, color: { argb: C.primary } }
      if (ci === 8) cc.font = { size: 9, italic: true, color: { argb: C.gray } }
    })
    rnc++
  })
  wnc.views = [{ showGridLines: false, state: 'frozen', ySplit: 4 }]

  return wb
}

// Gera e dispara o download no browser
export async function generateXlsx(data) {
  const wb = buildWorkbook(data)
  const buf = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Planilha_Importacao_${data.duimp?.nRef || 'output'}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
