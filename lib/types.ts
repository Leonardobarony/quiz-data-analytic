export type Role = 'DA' | 'DE'
export type Level = 'junior' | 'pleno' | 'senior' | 'especialista'
export type Domain = 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'D6' | 'D7'
export type SelfAnswer = 'sim' | 'parcialmente' | 'nao'

export interface Option {
  key: string
  text: string
  correct?: boolean
}

export interface Question {
  id: string
  domain: Domain
  level: Level | 'flat'
  text: string
  options: Option[]
}

export interface ToolGroup {
  id: string
  name: string
  tools: string[]
}

export interface ToolSelection {
  groupId: string
  selectedTools: string[]
  confidence: 'basico' | 'intermediario' | 'avancado' | null
}

export interface Competency {
  id: string
  text: string
  type: string
}

export interface CompetencyGroup {
  level: Level
  items: Competency[]
}

export interface FixedTest {
  role: Role
  level: Level
  questionIds: string[]
}

export interface DomainScores {
  D1: number
  D2: number
  D3: number
  D4: number
  D5: number
  D6: number
}

export interface QuizResult {
  finalLevel: Level
  totalScore: number
  domainScores: DomainScores
  d7RawScore: number
  d7NormalizedScore: number
  toolFilterScore: number
  strengths: Domain[]
  gaps: Domain[]
  selfAssessmentScore: number
  selfAssessmentLevel: Level
}

export type QuizStage = 'role' | 'tools' | 'test' | 'assessment' | 'results'

export interface QuizState {
  stage: QuizStage
  role: Role | null
  toolSelections: ToolSelection[]
  startingLevel: Level | null
  currentQuestionIndex: number
  answers: Record<string, string>
  selfAnswers: Record<string, SelfAnswer>
  result: QuizResult | null
  loadedQuestions: Question[]
}

export type QuizAction =
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'SET_TOOL_SELECTION'; groupId: string; selectedTools: string[]; confidence: ToolSelection['confidence'] }
  | { type: 'SET_STARTING_LEVEL'; level: Level }
  | { type: 'LOAD_QUESTIONS'; questions: Question[] }
  | { type: 'ANSWER_QUESTION'; questionId: string; optionKey: string }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'SET_SELF_ANSWER'; competencyId: string; answer: SelfAnswer }
  | { type: 'SET_RESULT'; result: QuizResult }
  | { type: 'GO_TO_STAGE'; stage: QuizStage }
  | { type: 'RESET' }
