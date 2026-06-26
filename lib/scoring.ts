import type { Domain, DomainScores, Level, Question, QuizResult, SelfAnswer } from './types'

const D7_MAX_RAW = 5

const SELF_ANSWER_POINTS: Record<SelfAnswer, number> = {
  sim: 2,
  parcialmente: 1,
  nao: 0,
}

const LEVEL_THRESHOLDS: Array<{ min: number; level: Level }> = [
  { min: 75, level: 'especialista' },
  { min: 50, level: 'senior' },
  { min: 25, level: 'pleno' },
  { min: 0, level: 'junior' },
]

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

  return Math.round((correct / domainQuestions.length) * 20 * 10) / 10
}

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

export function normalizeD7Score(rawScore: number): number {
  return Math.round((rawScore / D7_MAX_RAW) * 20 * 10) / 10
}

export function calculateTotal(domainScores: DomainScores): number {
  const domainTotal = Object.values(domainScores).reduce((a, b) => a + b, 0)
  return Math.min(100, Math.round(domainTotal * 10) / 10)
}

export function determineFinalLevel(totalScore: number): Level {
  for (const { min, level } of LEVEL_THRESHOLDS) {
    if (totalScore >= min) return level
  }
  return 'junior'
}

export function identifyStrengths(domainScores: DomainScores): Domain[] {
  const THRESHOLD = 20 * 0.7
  return (Object.keys(domainScores) as (keyof DomainScores)[]).filter(
    d => domainScores[d] >= THRESHOLD
  )
}

export function identifyGaps(domainScores: DomainScores): Domain[] {
  const THRESHOLD = 20 * 0.5
  return (Object.keys(domainScores) as (keyof DomainScores)[]).filter(
    d => domainScores[d] < THRESHOLD
  )
}

export function scoreSelfAssessment(selfAnswers: Record<string, SelfAnswer>): number {
  return Object.values(selfAnswers).reduce((sum, ans) => sum + SELF_ANSWER_POINTS[ans], 0)
}

export function selfAssessmentLevel(score: number): Level {
  if (score >= 30) return 'especialista'
  if (score >= 20) return 'senior'
  if (score >= 10) return 'pleno'
  return 'junior'
}

export function calculateQuizResult(
  answers: Record<string, string>,
  selfAnswers: Record<string, SelfAnswer>,
  questions: Question[]
): QuizResult {
  const domainScores: DomainScores = {
    D1: scoreDomain('D1', answers, questions),
    D2: scoreDomain('D2', answers, questions),
    D3: scoreDomain('D3', answers, questions),
    D4: scoreDomain('D4', answers, questions),
    D5: scoreDomain('D5', answers, questions),
  }

  const totalScore = calculateTotal(domainScores)
  const d7RawScore = scoreD7Raw(answers, questions)
  const d7NormalizedScore = normalizeD7Score(d7RawScore)
  const saScore = scoreSelfAssessment(selfAnswers)

  return {
    finalLevel: determineFinalLevel(totalScore),
    totalScore,
    domainScores,
    d7RawScore,
    d7NormalizedScore,
    strengths: identifyStrengths(domainScores),
    gaps: identifyGaps(domainScores),
    selfAssessmentScore: saScore,
    selfAssessmentLevel: selfAssessmentLevel(saScore),
  }
}
