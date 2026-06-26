import type { DomainScores, Level, QuizResult, Role } from './types'

const DOMAIN_LABELS: Record<keyof DomainScores, string> = {
  D1: 'Pipelines & Arquitetura',
  D2: 'SQL, Python & Processamento',
  D3: 'Modelagem & Semântica Analítica',
  D4: 'Governança, Qualidade & CI/CD',
  D5: 'Análise de Negócios & Requisitos',
}

const DOMAIN_MEANINGS: Record<keyof DomainScores, string> = {
  D1: 'Projetar e operar pipelines de dados confiáveis e escaláveis',
  D2: 'Domínio de SQL, Python e frameworks de processamento distribuído',
  D3: 'Estruturar dados para análise eficiente com semântica clara',
  D4: 'Governança, qualidade, segurança e CI/CD em projetos de dados',
  D5: 'Traduzir necessidades de negócio em soluções de dados com impacto',
}

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  junior: 'Profissional em início de carreira com fundamentos técnicos em consolidação. Foco em ganhar autonomia e ampliar o repertório de ferramentas e práticas.',
  pleno: 'Profissional com boa base técnica, capaz de conduzir projetos com supervisão reduzida e contribuir ativamente em decisões técnicas da equipe.',
  senior: 'Profissional com domínio técnico avançado, referência para o time e capaz de liderar projetos complexos de ponta a ponta com autonomia total.',
  especialista: 'Referência técnica da área com visão estratégica e capacidade de definir arquitetura, padrões organizacionais e direção de dados da empresa.',
}

const NEXT_STEPS_BY_LEVEL: Record<Level, string[]> = {
  junior: [
    'Consolide os fundamentos: SQL, Python básico e conceitos de pipelines batch e streaming',
    'Busque projetos práticos no time — mesmo os menores entregam aprendizado real',
    'Prepare-se para a certificação DP-900 ou AZ-900 como validação dos fundamentos',
  ],
  pleno: [
    'Aprofunde o domínio de processamento distribuído (ex: Spark, Databricks) e modelagem dimensional',
    'Assuma ownership de um pipeline ou domínio de dados end-to-end no time',
    'Prepare-se para DP-600 (Fabric Analytics Engineer) ou DP-700 (Fabric Data Engineer)',
  ],
  senior: [
    'Desenvolva habilidades de arquitetura: lakehouse, data mesh, governança em escala',
    'Mentoreie profissionais juniores e plenos — é o melhor jeito de solidificar o próprio conhecimento',
    'Prepare-se para DP-203 ou Databricks Data Engineer Professional',
  ],
  especialista: [
    'Contribua para a estratégia de dados da organização — defina padrões, roadmap e cultura de dados',
    'Publique conteúdo técnico, lidere comunidades ou talks internos para ampliar impacto',
    'Explore certificações avançadas como Databricks Professional ou DP-700 + DP-600 combinados',
  ],
}

const CERTS_BY_LEVEL: Record<Level, string[]> = {
  junior: ['AZ-900 (Azure Fundamentals)', 'DP-900 (Azure Data Fundamentals)', 'PL-900 (Power Platform Fundamentals)'],
  pleno: ['DP-600 (Fabric Analytics Engineer)', 'DP-700 (Fabric Data Engineer)'],
  senior: ['DP-203 (Azure Data Engineer Associate)', 'Databricks Data Engineer Associate'],
  especialista: ['DP-700 + DP-600 (Fabric Full Stack)', 'Databricks Data Engineer Professional', 'PL-400 (Power Automate Developer)', 'DP-203 (Azure Data Engineer Associate)'],
}

const D7_INTERPRETATION = (raw: number) => {
  if (raw <= 1) return 'Lacunas críticas em gestão de projetos'
  if (raw <= 3) return 'Conhecimento parcial'
  if (raw === 4) return 'Bom entendimento'
  return 'Domínio completo'
}

function nextLevelInfo(score: number): { label: string; pts: number } | null {
  if (score < 25) return { label: 'Pleno', pts: Math.ceil(25 - score) }
  if (score < 50) return { label: 'Sênior', pts: Math.ceil(50 - score) }
  if (score < 75) return { label: 'Especialista', pts: Math.ceil(75 - score) }
  return null
}

export interface PDFData {
  role: Role
  result: QuizResult
  userName?: string
  userSquad?: string
  userTechLevel?: string
}

export async function exportToPDF({ role, result, userName, userSquad, userTechLevel }: PDFData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const pageH = 297
  const margin = 18
  const contentW = pageW - margin * 2
  let y = 20

  // ── helpers ──────────────────────────────────────────────────────────────

  const checkPage = (needed = 10) => {
    if (y + needed > pageH - 15) {
      doc.addPage()
      y = 18
    }
  }

  const setColor = (hex: string) => {
    const h = hex.replace('#', '')
    doc.setTextColor(
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16)
    )
  }

  const addText = (text: string, fontSize = 10, bold = false, color = '#111827') => {
    checkPage(fontSize * 0.5 + 4)
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    setColor(color)
    const lines = doc.splitTextToSize(text, contentW) as string[]
    doc.text(lines, margin, y)
    y += lines.length * (fontSize * 0.42) + 1.5
  }

  const addSpacer = (h = 4) => { y += h }

  const addDivider = (color = '#E5E7EB') => {
    checkPage(6)
    const hex = color.replace('#', '')
    doc.setDrawColor(
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    )
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  const addSectionTitle = (title: string) => {
    checkPage(12)
    addSpacer(2)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    setColor('#1E40AF')
    doc.text(title.toUpperCase(), margin, y)
    y += 5
    addDivider('#BFDBFE')
  }

  // Barra horizontal visual (para score geral e domínios)
  const addBar = (
    pct: number,        // 0-100
    barW = contentW,
    barH = 4,
    trackColor: [number,number,number] = [229,231,235],
    fillColor: [number,number,number] = [37,99,235]
  ) => {
    checkPage(barH + 4)
    doc.setFillColor(...trackColor)
    doc.roundedRect(margin, y, barW, barH, 1, 1, 'F')
    if (pct > 0) {
      doc.setFillColor(...fillColor)
      doc.roundedRect(margin, y, (barW * Math.min(pct, 100)) / 100, barH, 1, 1, 'F')
    }
    y += barH
  }

  // ── CAPA / HEADER ────────────────────────────────────────────────────────

  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, pageW, 38, 'F')

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Quiz Data Analytics', margin, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(191, 219, 254)
  doc.text('Avaliação de Maturidade em Dados & Analytics', margin, 24)

  doc.setFontSize(9)
  doc.setTextColor(147, 197, 253)
  doc.text(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }), margin, 32)

  y = 48

  // ── DADOS DO PROFISSIONAL ────────────────────────────────────────────────

  if (userName || userSquad || userTechLevel) {
    doc.setFillColor(249, 250, 251)
    doc.roundedRect(margin, y, contentW, 24, 2, 2, 'F')
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentW, 24, 2, 2, 'S')

    const lineY = y + 7
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    setColor('#111827')
    if (userName) doc.text(userName, margin + 4, lineY)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    setColor('#6B7280')
    const sub = [
      role === 'DA' ? 'Analista de Dados' : 'Engenheiro de Dados',
      userSquad,
      userTechLevel,
    ].filter(Boolean).join('  ·  ')
    doc.text(sub, margin + 4, lineY + 6)

    y += 30
  } else {
    addText(`Perfil: ${role === 'DA' ? 'Analista de Dados (DA)' : 'Engenheiro de Dados (DE)'}`, 10)
    addSpacer(2)
  }

  // ── RESULTADO FINAL ──────────────────────────────────────────────────────

  addSectionTitle('Resultado Final')

  // Badge de nível
  const levelLabel = LEVEL_LABELS[result.finalLevel]
  const badgeColors: Record<Level, [number,number,number]> = {
    junior:      [219, 234, 254],
    pleno:       [199, 210, 254],
    senior:      [233, 213, 255],
    especialista:[237, 233, 254],
  }
  const badgeTextColors: Record<Level, string> = {
    junior:      '#1D4ED8',
    pleno:       '#4338CA',
    senior:      '#7C3AED',
    especialista:'#6D28D9',
  }

  checkPage(20)
  doc.setFillColor(...badgeColors[result.finalLevel])
  doc.roundedRect(margin, y, 38, 10, 2, 2, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setColor(badgeTextColors[result.finalLevel])
  doc.text(levelLabel, margin + 19, y + 6.5, { align: 'center' })

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  setColor('#1D4ED8')
  doc.text(`${result.totalScore.toFixed(1)}`, margin + 44, y + 8)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  setColor('#6B7280')
  doc.text('/ 100 pts', margin + 65, y + 8)

  y += 14

  // Descrição do nível
  addText(LEVEL_DESCRIPTIONS[result.finalLevel], 9, false, '#374151')
  addSpacer(3)

  // Barra de progresso geral com marcadores
  checkPage(16)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  setColor('#9CA3AF')
  const marks = [0, 25, 50, 75, 100]
  for (const m of marks) {
    const x = margin + (contentW * m) / 100
    doc.text(String(m), x, y, { align: m === 0 ? 'left' : m === 100 ? 'right' : 'center' })
  }
  y += 3

  addBar(result.totalScore, contentW, 5, [229, 231, 235], [59, 130, 246])

  // Linhas de threshold
  for (const m of [25, 50, 75]) {
    const x = margin + (contentW * m) / 100
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.2)
    doc.line(x, y - 5, x, y)
  }

  addSpacer(4)

  // Distância ao próximo nível
  const next = nextLevelInfo(result.totalScore)
  if (next) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    setColor('#2563EB')
    doc.text(`Faltam ${next.pts} pts para o nível ${next.label}`, margin, y)
    y += 5
  } else {
    doc.setFontSize(9)
    setColor('#16A34A')
    doc.text('Você atingiu o nível máximo — Especialista', margin, y)
    y += 5
  }

  addSpacer(3)

  // ── ANÁLISE POR DOMÍNIO ──────────────────────────────────────────────────

  addSectionTitle('Análise por Domínio')

  const domains: (keyof DomainScores)[] = ['D1', 'D2', 'D3', 'D4', 'D5']

  for (const d of domains) {
    checkPage(18)
    const score = result.domainScores[d]
    const pct = Math.round((score / 20) * 100)
    const isStrength = result.strengths.includes(d)
    const isGap = result.gaps.includes(d)

    // Label + score
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    setColor('#111827')
    doc.text(DOMAIN_LABELS[d], margin, y)

    const scoreText = `${score.toFixed(1)} / 20`
    doc.setFont('helvetica', 'bold')
    doc.text(scoreText, pageW - margin, y, { align: 'right' })

    // Tag forte/gap
    if (isStrength) {
      doc.setFontSize(7)
      setColor('#16A34A')
      doc.text('✓ Forte', pageW - margin - 22, y)
    } else if (isGap) {
      doc.setFontSize(7)
      setColor('#DC2626')
      doc.text('⚠ Gap', pageW - margin - 22, y)
    }

    y += 4

    // Barra colorida por domínio
    const fillRgb: [number,number,number] = isStrength
      ? [34, 197, 94]
      : isGap
      ? [248, 113, 113]
      : [59, 130, 246]
    addBar(pct, contentW, 3.5, [229, 231, 235], fillRgb)

    addSpacer(1)
    // Significado do domínio
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    setColor('#9CA3AF')
    doc.text(DOMAIN_MEANINGS[d], margin, y)
    y += 5
    addSpacer(1)
  }

  // D7
  checkPage(14)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  setColor('#111827')
  doc.text('D7 – Gestão de Projetos & Consultoria', margin, y)
  doc.text(`${result.d7RawScore} / 5`, pageW - margin, y, { align: 'right' })
  y += 4
  addBar((result.d7RawScore / 5) * 100, contentW, 3.5, [229, 231, 235], [99, 102, 241])
  addSpacer(1)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  setColor('#9CA3AF')
  doc.text(D7_INTERPRETATION(result.d7RawScore), margin, y)
  y += 5

  addSpacer(2)

  // ── PONTOS FORTES & LACUNAS ──────────────────────────────────────────────

  if (result.strengths.length > 0 || result.gaps.length > 0) {
    addSectionTitle('Pontos Fortes & Lacunas')

    if (result.strengths.length > 0) {
      addText('Pontos Fortes  (≥ 70% do máximo)', 9, true, '#166534')
      for (const d of result.strengths) {
        checkPage(6)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        setColor('#15803D')
        doc.text(`  •  ${DOMAIN_LABELS[d as keyof DomainScores]}`, margin, y)
        y += 5
      }
      addSpacer(2)
    }

    if (result.gaps.length > 0) {
      addText('Lacunas Prioritárias  (< 50% do máximo)', 9, true, '#991B1B')
      for (const d of result.gaps) {
        checkPage(6)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'normal')
        setColor('#B91C1C')
        doc.text(`  •  ${DOMAIN_LABELS[d as keyof DomainScores]}`, margin, y)
        y += 5
      }
      addSpacer(2)
    }
  }

  // ── AUTO-AVALIAÇÃO ───────────────────────────────────────────────────────

  addSectionTitle('Auto-avaliação de Competências')

  checkPage(14)
  addText(`Score: ${result.selfAssessmentScore} / 40`, 9, false, '#374151')
  addText(`Nível percebido: ${LEVEL_LABELS[result.selfAssessmentLevel]}`, 9, false, '#374151')
  addBar((result.selfAssessmentScore / 40) * 100, contentW, 3.5, [229, 231, 235], [99, 102, 241])

  if (result.selfAssessmentLevel !== result.finalLevel) {
    addSpacer(2)
    const msg = result.selfAssessmentScore > (result.totalScore / 100 * 40)
      ? 'Sua percepção está acima do score técnico — foque nas lacunas identificadas.'
      : 'Você pode estar subestimando seu potencial — os gaps são trabalháveis com foco.'
    addText(msg, 8, false, '#6B7280')
  }

  addSpacer(2)

  // ── PRÓXIMOS PASSOS ──────────────────────────────────────────────────────

  addSectionTitle('Próximos Passos Recomendados')

  const steps = NEXT_STEPS_BY_LEVEL[result.finalLevel]
  for (let i = 0; i < steps.length; i++) {
    checkPage(14)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    setColor('#1E40AF')
    doc.text(`${i + 1}.`, margin, y)
    doc.setFont('helvetica', 'normal')
    setColor('#1E3A8A')
    const lines = doc.splitTextToSize(steps[i], contentW - 8) as string[]
    doc.text(lines, margin + 6, y)
    y += lines.length * 4.5 + 3
  }

  // ── CERTIFICAÇÕES ────────────────────────────────────────────────────────

  addSectionTitle('Certificações Recomendadas')

  for (const cert of CERTS_BY_LEVEL[result.finalLevel]) {
    checkPage(7)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    setColor('#374151')
    doc.text(`→  ${cert}`, margin, y)
    y += 5.5
  }

  // ── RODAPÉ EM TODAS AS PÁGINAS ───────────────────────────────────────────

  const totalPages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    setColor('#9CA3AF')
    doc.text(
      `Quiz Data Analytics — Avaliação de Maturidade Profissional`,
      margin,
      pageH - 8
    )
    doc.text(`${p} / ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' })
  }

  const fileName = `resultado-quiz-${result.finalLevel}-${Date.now()}.pdf`
  doc.save(fileName)
}
