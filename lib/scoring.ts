import type { Domain, DomainScores, Level, Question, QuizResult, SelfAnswer, ToolSelection } from './types'
import { detectStartingLevel, scoreToolFilter } from './levelDetection'

// D7 questions per test = 5; max score = 5
const D7_MAX_RAW = 5

// Pontos por resposta de auto-avaliação
const SELF_ANSWER_POINTS: Record<SelfAnswer, number> = {
  sim: 2,
  parcialmente: 1,
  nao: 0,
}

// Faixas de nível pelo score total (0-100)
const LEVEL_THRESHOLDS: Array<{ min: number; level: Level }> = [
  { min: 75, level: 'especialista' },
  { min: 50, level: 'senior' },
  { min: 25, level: 'pleno' },
  { min: 0, level: 'junior' },
]

/**
 * Retorna o score de um domínio (0–15).
 * Conta acertos entre as questões do domínio e normaliza para 15 pontos.
 */
export function scoreDomain(
  domainId: Domain,
  answers: Record<string, string>,
  questions: Question[]
): number {
  const domainQuestions = questions.filter(
    q => q.domain === domainId && q.domain !== 'D7'
  )
  if (domainQuestions.length === 0) return 0

  let correct = 0
  for (const q of domainQuestions) {
    const givenKey = answers[q.id]
    if (!givenKey) continue
    const correctOption = q.options.find(o => o.correct)
    if (correctOption && givenKey === correctOption.key) correct++
  }

  return Math.round((correct / domainQuestions.length) * 15 * 10) / 10
}

/**
 * Calcula o score bruto de D7 (0–5).
 * Conta acertos entre as 5 questões de D7 do teste.
 */
export function scoreD7Raw(
  answers: Record<string, string>,
  questions: Question[]
): number {
  const d7Questions = questions.filter(q => q.domain === 'D7')
  let correct = 0
  for (const q of d7Questions) {
    const givenKey = answers[q.id]
    if (!givenKey) continue
    const correctOption = q.options.find(o => o.correct)
    if (correctOption && givenKey === correctOption.key) correct++
  }
  return correct
}

/**
 * Normaliza o score bruto de D7 (0–5) para 0–15 para exibição proporcional.
 */
export function normalizeD7Score(rawScore: number): number {
  return Math.round((rawScore / D7_MAX_RAW) * 15 * 10) / 10
}

/**
 * Calcula o score total do quiz (0–100).
 * toolFilterScore (0–10) + soma dos scores de D1–D6 (0–15 cada) = 0–100.
 */
export function calculateTotal(domainScores: DomainScores, toolFilterScore: number): number {
  const domainTotal = Object.values(domainScores).reduce((a, b) => a + b, 0)
  return Math.min(100, Math.round((domainTotal + toolFilterScore) * 10) / 10)
}

/**
 * Determina o nível final com base no score total (0–100).
 */
export function determineFinalLevel(totalScore: number): Level {
  for (const { min, level } of LEVEL_THRESHOLDS) {
    if (totalScore >= min) return level
  }
  return 'junior'
}

/**
 * Identifica pontos fortes: domínios com score ≥ 70% do máximo (≥ 10.5 pts).
 */
export function identifyStrengths(domainScores: DomainScores): Domain[] {
  const THRESHOLD = 15 * 0.7
  return (Object.keys(domainScores) as (keyof DomainScores)[]).filter(
    d => domainScores[d] >= THRESHOLD
  )
}

/**
 * Identifica lacunas: domínios com score < 50% do máximo (< 7.5 pts).
 */
export function identifyGaps(domainScores: DomainScores): Domain[] {
  const THRESHOLD = 15 * 0.5
  return (Object.keys(domainScores) as (keyof DomainScores)[]).filter(
    d => domainScores[d] < THRESHOLD
  )
}

/**
 * Calcula o score de auto-avaliação (0–40, 20 itens × 2 pts máx).
 */
export function scoreSelfAssessment(selfAnswers: Record<string, SelfAnswer>): number {
  return Object.values(selfAnswers).reduce((sum, ans) => sum + SELF_ANSWER_POINTS[ans], 0)
}

/**
 * Determina o nível sugerido pela auto-avaliação (0–40 → 4 faixas de 10).
 */
export function selfAssessmentLevel(score: number): Level {
  if (score >= 30) return 'especialista'
  if (score >= 20) return 'senior'
  if (score >= 10) return 'pleno'
  return 'junior'
}

/**
 * Função principal: calcula o resultado completo do quiz.
 */
export function calculateQuizResult(
  answers: Record<string, string>,
  selfAnswers: Record<string, SelfAnswer>,
  questions: Question[],
  toolSelections: ToolSelection[]
): QuizResult {
  const domains: Domain[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']

  const domainScores: DomainScores = {
    D1: scoreDomain('D1', answers, questions),
    D2: scoreDomain('D2', answers, questions),
    D3: scoreDomain('D3', answers, questions),
    D4: scoreDomain('D4', answers, questions),
    D5: scoreDomain('D5', answers, questions),
    D6: scoreDomain('D6', answers, questions),
  }

  const toolFilterScore = scoreToolFilter(toolSelections)
  const totalScore = calculateTotal(domainScores, toolFilterScore)
  const d7RawScore = scoreD7Raw(answers, questions)
  const d7NormalizedScore = normalizeD7Score(d7RawScore)

  const saScore = scoreSelfAssessment(selfAnswers)

  return {
    finalLevel: determineFinalLevel(totalScore),
    totalScore,
    domainScores,
    d7RawScore,
    d7NormalizedScore,
    toolFilterScore,
    strengths: identifyStrengths(domainScores),
    gaps: identifyGaps(domainScores),
    selfAssessmentScore: saScore,
    selfAssessmentLevel: selfAssessmentLevel(saScore),
  }
}
