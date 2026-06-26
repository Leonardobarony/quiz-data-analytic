'use client'

import { useEffect } from 'react'
import { useQuiz } from '@/components/QuizProvider'
import { loadTest } from '@/lib/testLoader'
import QuestionCard from '@/components/ui/QuestionCard'
import ProgressBar from '@/components/ui/ProgressBar'

export default function TechnicalTest() {
  const { state, dispatch } = useQuiz()
  const { role, startingLevel, loadedQuestions, currentQuestionIndex, answers } = state

  useEffect(() => {
    if (!role || !startingLevel || loadedQuestions.length > 0) return
    try {
      const questions = loadTest(role, startingLevel)
      dispatch({ type: 'LOAD_QUESTIONS', questions })
    } catch (e) {
      console.error('Erro ao carregar questões:', e)
    }
  }, [role, startingLevel, loadedQuestions.length, dispatch])

  if (loadedQuestions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Carregando questões...</p>
      </div>
    )
  }

  const question = loadedQuestions[currentQuestionIndex]
  const selectedKey = answers[question.id] ?? null
  const isLast = currentQuestionIndex === loadedQuestions.length - 1
  const answeredCount = Object.keys(answers).length

  const handleAnswer = (key: string) => {
    dispatch({ type: 'ANSWER_QUESTION', questionId: question.id, optionKey: key })
  }

  const handleNext = () => {
    if (isLast) {
      dispatch({ type: 'GO_TO_STAGE', stage: 'assessment' })
    } else {
      dispatch({ type: 'NEXT_QUESTION' })
    }
  }

  const handlePrev = () => {
    dispatch({ type: 'PREV_QUESTION' })
  }

  const DOMAIN_LABELS: Record<string, string> = {
    D1: 'Pipelines & Arquitetura',
    D2: 'SQL & Processamento',
    D3: 'Modelagem & BI',
    D4: 'Governança & Segurança',
    D5: 'Cloud & Infraestrutura',
    D6: 'Power Platform',
    D7: 'Visão Estratégica',
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {DOMAIN_LABELS[question.domain] ?? question.domain}
          </span>
          <span className="text-sm text-gray-500">
            Respondidas: {answeredCount} / {loadedQuestions.length}
          </span>
        </div>
        <ProgressBar
          current={currentQuestionIndex + 1}
          total={loadedQuestions.length}
          label={`Questão ${currentQuestionIndex + 1}`}
        />
      </div>

      <QuestionCard
        question={question}
        selectedKey={selectedKey}
        onSelect={handleAnswer}
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>

        <button
          onClick={handleNext}
          disabled={!selectedKey}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isLast ? 'Finalizar Prova →' : 'Próxima →'}
        </button>
      </div>
    </div>
  )
}
