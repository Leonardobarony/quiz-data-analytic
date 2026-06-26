'use client'

import { useQuiz } from '@/components/QuizProvider'
import { calculateQuizResult } from '@/lib/scoring'
import type { SelfAnswer } from '@/lib/types'
import competenciesData from '@/data/competencies.json'

const ANSWER_OPTIONS: Array<{ value: SelfAnswer; label: string; color: string }> = [
  { value: 'sim', label: 'Sim', color: 'bg-green-600 text-white border-green-600' },
  { value: 'parcialmente', label: 'Parcialmente', color: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'nao', label: 'Não', color: 'bg-red-500 text-white border-red-500' },
]

const LEVEL_LABELS: Record<string, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

export default function SelfAssessment() {
  const { state, dispatch } = useQuiz()
  const { selfAnswers, answers, loadedQuestions, toolSelections } = state

  const totalCompetencies = competenciesData.reduce((acc, g) => acc + g.items.length, 0)
  const answered = Object.keys(selfAnswers).length
  const allAnswered = answered === totalCompetencies

  const handleAnswer = (id: string, answer: SelfAnswer) => {
    dispatch({ type: 'SET_SELF_ANSWER', competencyId: id, answer })
  }

  const handleFinish = () => {
    const result = calculateQuizResult(answers, selfAnswers, loadedQuestions, toolSelections)
    dispatch({ type: 'SET_RESULT', result })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Auto-avaliação de Competências</h2>
        <p className="text-gray-600 text-sm mb-3">
          Para cada competência abaixo, indique se você a domina. Seja honesto — isso complementa sua avaliação técnica.
        </p>
        <p className="text-sm text-blue-600 font-medium">
          Respondidas: {answered} / {totalCompetencies}
        </p>
      </div>

      <div className="space-y-8">
        {competenciesData.map(group => (
          <div key={group.level}>
            <h3 className="text-base font-semibold text-gray-700 mb-3 pb-1 border-b border-gray-200">
              Nível {LEVEL_LABELS[group.level]}
            </h3>
            <div className="space-y-3">
              {group.items.map(item => {
                const current = selfAnswers[item.id]
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-sm text-gray-800 mb-3 leading-relaxed">{item.text}</p>
                    <div className="flex gap-2">
                      {ANSWER_OPTIONS.map(opt => {
                        const active = current === opt.value
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleAnswer(item.id, opt.value)}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                              active
                                ? opt.color
                                : 'border-gray-200 text-gray-600 bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleFinish}
          disabled={!allAnswered}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Ver Resultado →
        </button>
      </div>
    </div>
  )
}
