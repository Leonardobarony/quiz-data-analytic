'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { QuizAction, QuizState, ToolSelection } from '@/lib/types'

const initialState: QuizState = {
  stage: 'role',
  role: null,
  toolSelections: [],
  startingLevel: null,
  currentQuestionIndex: 0,
  answers: {},
  selfAnswers: {},
  result: null,
  loadedQuestions: [],
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_ROLE':
      return { ...state, role: action.role }

    case 'SET_TOOL_SELECTION': {
      const existing = state.toolSelections.find(s => s.groupId === action.groupId)
      const updated: ToolSelection = {
        groupId: action.groupId,
        selectedTools: action.selectedTools,
        confidence: action.confidence,
      }
      if (existing) {
        return {
          ...state,
          toolSelections: state.toolSelections.map(s =>
            s.groupId === action.groupId ? updated : s
          ),
        }
      }
      return { ...state, toolSelections: [...state.toolSelections, updated] }
    }

    case 'SET_STARTING_LEVEL':
      return { ...state, startingLevel: action.level }

    case 'LOAD_QUESTIONS':
      return { ...state, loadedQuestions: action.questions, currentQuestionIndex: 0 }

    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.optionKey },
      }

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.min(
          state.currentQuestionIndex + 1,
          state.loadedQuestions.length - 1
        ),
      }

    case 'PREV_QUESTION':
      return {
        ...state,
        currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
      }

    case 'SET_SELF_ANSWER':
      return {
        ...state,
        selfAnswers: { ...state.selfAnswers, [action.competencyId]: action.answer },
      }

    case 'SET_RESULT':
      return { ...state, result: action.result, stage: 'results' }

    case 'GO_TO_STAGE':
      return { ...state, stage: action.stage }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

interface QuizContextValue {
  state: QuizState
  dispatch: React.Dispatch<QuizAction>
}

const QuizContext = createContext<QuizContextValue | null>(null)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)
  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz deve ser usado dentro de QuizProvider')
  return ctx
}
