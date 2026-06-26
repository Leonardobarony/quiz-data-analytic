import type { DomainScores, Level, QuizResult, Role } from './types'

const DOMAIN_LABELS: Record<keyof DomainScores, string> = {
  D1: 'Pipelines & Arquitetura',
  D2: 'SQL, Python & Processamento',
  D3: 'Modelagem & Semântica Analítica',
  D4: 'Governança, Qualidade & CI/CD',
  D5: 'Análise de Negócios & Requisitos',
}

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
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

interface PDFData {
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
  const margin = 20
  let y = 20

  const addLine = (text: string, fontSize = 10, bold = false, color = '#000000') => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const hex = color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    doc.setTextColor(r, g, b)
    const lines = doc.splitTextToSize(text, pageW - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * (fontSize * 0.4) + 2
  }

  const addSpacer = (h = 4) => { y += h }
  const addDivider = () => {
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, pageW - margin, y)
    y += 4
  }

  // Header
  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, pageW, 35, 'F')
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Quiz Data Analytics', margin, 15)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('Avaliação de Maturidade Profissional', margin, 23)
  y = 45

  // Dados do profissional
  if (userName) addLine(`Profissional: ${userName}`, 10, true)
  if (userSquad) addLine(`Squad / Equipe: ${userSquad}`, 10)
  if (userTechLevel) addLine(`Nível técnico informado: ${userTechLevel}`, 10)
  addLine(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10)
  addLine(`Perfil: ${role === 'DA' ? 'Analista de Dados (DA)' : 'Engenheiro de Dados (DE)'}`, 10)
  addSpacer()
  addDivider()

  // Resultado principal
  addLine('RESULTADO FINAL', 14, true, '#1E40AF')
  addSpacer(2)
  addLine(`Nível: ${LEVEL_LABELS[result.finalLevel]}`, 13, true)
  addLine(`Score Total: ${result.totalScore.toFixed(1)} / 100`, 11)
  addLine(`D7 – Gestão de Projetos: ${result.d7RawScore} / 5 — ${D7_INTERPRETATION(result.d7RawScore)}`, 10)
  addSpacer()
  addDivider()

  // Scores por domínio
  addLine('SCORES POR DOMÍNIO', 12, true, '#1E40AF')
  addSpacer(2)
  const domains: (keyof DomainScores)[] = ['D1', 'D2', 'D3', 'D4', 'D5']
  for (const d of domains) {
    const score = result.domainScores[d]
    const pct = Math.round((score / 20) * 100)
    addLine(`${DOMAIN_LABELS[d]}: ${score.toFixed(1)} / 20  (${pct}%)`, 10)
  }
  addSpacer()
  addDivider()

  // Pontos fortes e lacunas
  if (result.strengths.length > 0) {
    addLine('PONTOS FORTES (≥ 70% do máximo)', 11, true, '#166534')
    for (const d of result.strengths) {
      addLine(`  • ${DOMAIN_LABELS[d as keyof DomainScores]}`, 10)
    }
    addSpacer(2)
  }

  if (result.gaps.length > 0) {
    addLine('LACUNAS PRIORITÁRIAS (< 50% do máximo)', 11, true, '#991B1B')
    for (const d of result.gaps) {
      addLine(`  • ${DOMAIN_LABELS[d as keyof DomainScores]}`, 10)
    }
    addSpacer(2)
  }

  addDivider()

  // Auto-avaliação
  addLine('AUTO-AVALIAÇÃO DE COMPETÊNCIAS', 12, true, '#1E40AF')
  addSpacer(2)
  addLine(`Score: ${result.selfAssessmentScore} / 40`, 10)
  addLine(`Nível percebido: ${LEVEL_LABELS[result.selfAssessmentLevel]}`, 10)
  addSpacer()
  addDivider()

  // Certificações
  addLine('CERTIFICAÇÕES RECOMENDADAS', 12, true, '#1E40AF')
  addSpacer(2)
  const certs = CERTS_BY_LEVEL[result.finalLevel]
  for (const cert of certs) addLine(`  • ${cert}`, 10)
  addSpacer()
  addDivider()

  // Rodapé
  addLine('Gerado por Quiz Data Analytics — Avaliação de Maturidade Profissional', 8, false, '#6B7280')

  const fileName = `resultado-quiz-data-analytics-${result.finalLevel}-${Date.now()}.pdf`
  doc.save(fileName)
}
