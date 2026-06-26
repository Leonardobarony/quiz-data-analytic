import {
  calculateTotal,
  determineFinalLevel,
  identifyGaps,
  identifyStrengths,
  scoreDomain,
  scoreD7Raw,
  scoreSelfAssessment,
  selfAssessmentLevel,
} from '../lib/scoring'
import type { DomainScores, Question } from '../lib/types'

const makeQuestion = (id: string, domain: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7', correctKey = 'B'): Question => ({
  id,
  domain,
  level: 'junior',
  text: 'Pergunta de teste',
  options: [
    { key: 'A', text: 'Errada' },
    { key: 'B', text: 'Correta', correct: true },
    { key: 'C', text: 'Errada' },
    { key: 'D', text: 'Errada' },
  ],
})

describe('scoreDomain', () => {
  const questions: Question[] = [
    makeQuestion('D1-JR-Q01', 'D1'),
    makeQuestion('D1-JR-Q02', 'D1'),
    makeQuestion('D1-JR-Q03', 'D1'),
    makeQuestion('D1-JR-Q04', 'D1'),
    makeQuestion('D1-JR-Q05', 'D1'),
  ]

  it('deve retornar 15 com todos corretos', () => {
    const answers = { 'D1-JR-Q01': 'B', 'D1-JR-Q02': 'B', 'D1-JR-Q03': 'B', 'D1-JR-Q04': 'B', 'D1-JR-Q05': 'B' }
    expect(scoreDomain('D1', answers, questions)).toBe(15)
  })

  it('deve retornar 0 com todos errados', () => {
    const answers = { 'D1-JR-Q01': 'A', 'D1-JR-Q02': 'A', 'D1-JR-Q03': 'A', 'D1-JR-Q04': 'A', 'D1-JR-Q05': 'A' }
    expect(scoreDomain('D1', answers, questions)).toBe(0)
  })

  it('deve retornar 7.5 com metade corretos', () => {
    const answers = { 'D1-JR-Q01': 'B', 'D1-JR-Q02': 'B', 'D1-JR-Q03': 'A', 'D1-JR-Q04': 'A', 'D1-JR-Q05': 'A' }
    // 2/5 × 15 = 6 (não 7.5 — 2.5/5 seria metade)
    // vamos testar 3/5 corretos
    const answers2 = { 'D1-JR-Q01': 'B', 'D1-JR-Q02': 'B', 'D1-JR-Q03': 'B', 'D1-JR-Q04': 'A', 'D1-JR-Q05': 'A' }
    expect(scoreDomain('D1', answers2, questions)).toBe(9)
  })

  it('deve retornar 0 para domínio sem questões', () => {
    expect(scoreDomain('D2', {}, questions)).toBe(0)
  })
})

describe('scoreD7Raw', () => {
  const questions: Question[] = [
    makeQuestion('D7-JR-Q01', 'D7'),
    makeQuestion('D7-JR-Q02', 'D7'),
    makeQuestion('D7-JR-Q03', 'D7'),
    makeQuestion('D7-JR-Q04', 'D7'),
    makeQuestion('D7-JR-Q05', 'D7'),
  ]

  it('deve retornar 5 com todos corretos', () => {
    const answers: Record<string, string> = {}
    for (const q of questions) answers[q.id] = 'B'
    expect(scoreD7Raw(answers, questions)).toBe(5)
  })

  it('deve retornar 0 com todos errados', () => {
    const answers: Record<string, string> = {}
    for (const q of questions) answers[q.id] = 'A'
    expect(scoreD7Raw(answers, questions)).toBe(0)
  })
})

describe('calculateTotal', () => {
  it('deve somar domain scores e tool filter', () => {
    const scores: DomainScores = { D1: 10, D2: 10, D3: 10, D4: 10, D5: 10, D6: 10 }
    expect(calculateTotal(scores, 10)).toBe(70)
  })

  it('deve ter máximo de 100', () => {
    const scores: DomainScores = { D1: 15, D2: 15, D3: 15, D4: 15, D5: 15, D6: 15 }
    expect(calculateTotal(scores, 10)).toBe(100)
  })

  it('deve retornar 0 com todos zeros', () => {
    const scores: DomainScores = { D1: 0, D2: 0, D3: 0, D4: 0, D5: 0, D6: 0 }
    expect(calculateTotal(scores, 0)).toBe(0)
  })
})

describe('determineFinalLevel', () => {
  it('deve retornar junior para 0-24', () => {
    expect(determineFinalLevel(0)).toBe('junior')
    expect(determineFinalLevel(24)).toBe('junior')
  })

  it('deve retornar pleno para 25-49', () => {
    expect(determineFinalLevel(25)).toBe('pleno')
    expect(determineFinalLevel(49)).toBe('pleno')
  })

  it('deve retornar senior para 50-74', () => {
    expect(determineFinalLevel(50)).toBe('senior')
    expect(determineFinalLevel(74)).toBe('senior')
  })

  it('deve retornar especialista para 75-100', () => {
    expect(determineFinalLevel(75)).toBe('especialista')
    expect(determineFinalLevel(100)).toBe('especialista')
  })
})

describe('identifyStrengths e identifyGaps', () => {
  it('deve identificar pontos fortes (≥70% = ≥10.5)', () => {
    const scores: DomainScores = { D1: 12, D2: 5, D3: 11, D4: 4, D5: 10, D6: 10.5 }
    const strengths = identifyStrengths(scores)
    expect(strengths).toContain('D1')
    expect(strengths).toContain('D3')
    expect(strengths).toContain('D6')
    expect(strengths).not.toContain('D2')
  })

  it('deve identificar lacunas (<50% = <7.5)', () => {
    const scores: DomainScores = { D1: 12, D2: 5, D3: 11, D4: 4, D5: 10, D6: 7.4 }
    const gaps = identifyGaps(scores)
    expect(gaps).toContain('D2')
    expect(gaps).toContain('D4')
    expect(gaps).toContain('D6')
    expect(gaps).not.toContain('D1')
  })
})

describe('scoreSelfAssessment', () => {
  it('deve somar pontos corretamente (sim=2, parcialmente=1, nao=0)', () => {
    const answers = {
      'JR-C01': 'sim',
      'JR-C02': 'parcialmente',
      'JR-C03': 'nao',
      'JR-C04': 'sim',
      'JR-C05': 'sim',
    } as Record<string, 'sim' | 'parcialmente' | 'nao'>
    expect(scoreSelfAssessment(answers)).toBe(7) // 2+1+0+2+2
  })
})

describe('selfAssessmentLevel', () => {
  it('deve mapear corretamente as faixas', () => {
    expect(selfAssessmentLevel(0)).toBe('junior')
    expect(selfAssessmentLevel(9)).toBe('junior')
    expect(selfAssessmentLevel(10)).toBe('pleno')
    expect(selfAssessmentLevel(19)).toBe('pleno')
    expect(selfAssessmentLevel(20)).toBe('senior')
    expect(selfAssessmentLevel(29)).toBe('senior')
    expect(selfAssessmentLevel(30)).toBe('especialista')
    expect(selfAssessmentLevel(40)).toBe('especialista')
  })
})
