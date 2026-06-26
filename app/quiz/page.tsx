'use client'

import { QuizProvider, useQuiz } from '@/components/QuizProvider'
import RoleSelection from '@/components/stages/RoleSelection'
import ToolFilter from '@/components/stages/ToolFilter'
import TechnicalTest from '@/components/stages/TechnicalTest'
import SelfAssessment from '@/components/stages/SelfAssessment'
import Results from '@/components/stages/Results'

const STAGE_LABELS = {
  role: 'Perfil',
  tools: 'Ferramentas',
  test: 'Prova Técnica',
  assessment: 'Auto-avaliação',
  results: 'Resultado',
}

const STAGE_ORDER = ['role', 'tools', 'test', 'assessment', 'results'] as const

function QuizContent() {
  const { state } = useQuiz()
  const currentIndex = STAGE_ORDER.indexOf(state.stage)

  return (
    <div>
      {/* Stepper */}
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

      {state.stage === 'role' && <RoleSelection />}
      {state.stage === 'tools' && <ToolFilter />}
      {state.stage === 'test' && <TechnicalTest />}
      {state.stage === 'assessment' && <SelfAssessment />}
      {state.stage === 'results' && <Results />}
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
