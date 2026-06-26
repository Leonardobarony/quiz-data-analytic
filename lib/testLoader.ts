import type { FixedTest, Level, Question, Role } from './types'

// Importações estáticas dos dados JSON
import daJr from '@/data/tests/da-jr.json'
import daPl from '@/data/tests/da-pl.json'
import daSn from '@/data/tests/da-sn.json'
import daEsp from '@/data/tests/da-esp.json'
import deJr from '@/data/tests/de-jr.json'
import dePl from '@/data/tests/de-pl.json'
import deSn from '@/data/tests/de-sn.json'
import deEsp from '@/data/tests/de-esp.json'

import d1 from '@/data/questions/d1.json'
import d2 from '@/data/questions/d2.json'
import d3 from '@/data/questions/d3.json'
import d4 from '@/data/questions/d4.json'
import d5 from '@/data/questions/d5.json'
import d6 from '@/data/questions/d6.json'
import d7 from '@/data/questions/d7.json'

const TEST_MAP: Record<string, FixedTest> = {
  'DA-junior': daJr as FixedTest,
  'DA-pleno': daPl as FixedTest,
  'DA-senior': daSn as FixedTest,
  'DA-especialista': daEsp as FixedTest,
  'DE-junior': deJr as FixedTest,
  'DE-pleno': dePl as FixedTest,
  'DE-senior': deSn as FixedTest,
  'DE-especialista': deEsp as FixedTest,
}

const ALL_QUESTIONS: Question[] = [
  ...(d1 as Question[]),
  ...(d2 as Question[]),
  ...(d3 as Question[]),
  ...(d4 as Question[]),
  ...(d5 as Question[]),
  ...(d6 as Question[]),
  ...(d7 as Question[]),
]

const QUESTION_MAP: Map<string, Question> = new Map(
  ALL_QUESTIONS.map(q => [q.id, q])
)

/**
 * Carrega as questões do teste fixo para o role + level especificado.
 * Retorna as 35 questões na ordem definida no arquivo de teste.
 */
export function loadTest(role: Role, level: Level): Question[] {
  const key = `${role}-${level}`
  const test = TEST_MAP[key]
  if (!test) throw new Error(`Teste não encontrado: ${key}`)

  return test.questionIds.map(id => {
    const q = QUESTION_MAP.get(id)
    if (!q) throw new Error(`Questão não encontrada: ${id}`)
    return q
  })
}

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS
}
