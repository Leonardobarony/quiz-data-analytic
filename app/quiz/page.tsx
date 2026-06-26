'use client'

import { lazy, Suspense } from 'react'
import { QuizProvider, useQuiz } from '@/components/QuizProvider'
import { QuizErrorBoundary } from '@/components/QuizErrorBoundary'

const ProfileForm = lazy(() => import('@/components/stages/ProfileForm'))
const LevelSelection = lazy(() => import('@/components/stages/LevelSelection'))
const TechnicalTest = lazy(() => import('@/components/stages/TechnicalTest'))
const SelfAssessment = lazy(() => import('@/components/stages/SelfAssessment'))
const Results = lazy(() => import('@/components/stages/Results'))

const STAGE_LABELS = {
  profile: 'Perfil',
  level: 'Nível',
  test: 'Prova Técnica',
  assessment: 'Auto-avaliação',
  results: 'Resultado',
}

const STAGE_ORDER = ['profile', 'level', 'test', 'assessment', 'results'] as const

function StageFallback() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function QuizContent() {
  const { state } = useQuiz()
  const currentIndex = STAGE_ORDER.indexOf(state.stage)

  return (
    <div>
      {state.stage !== 'results' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-center gap-1">
              {STAGE_ORDER.filter(s => s !== 'results').map((stage, i) => {
                const active = state.stage === stage
                const done = currentIndex > i
                return (
                  <div key={stage} className="flex items-center gap-1">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        active
                          ? 'bg-blue-600 text-white'
                          : done
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {STAGE_LABELS[stage]}
                    </span>
                    {i < 3 && <span className="text-gray-300 text-xs">›</span>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <QuizErrorBoundary>
        <Suspense fallback={<StageFallback />}>
          {state.stage === 'profile' && <ProfileForm />}
          {state.stage === 'level' && <LevelSelection />}
          {state.stage === 'test' && <TechnicalTest />}
          {state.stage === 'assessment' && <SelfAssessment />}
          {state.stage === 'results' && <Results />}
        </Suspense>
      </QuizErrorBoundary>
    </div>
  )
}

export default function QuizPage() {
  return (
    <QuizProvider>
      <QuizContent />
    </QuizProvider>
  )
}
