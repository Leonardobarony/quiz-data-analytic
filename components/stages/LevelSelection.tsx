'use client'

import { useQuiz } from '@/components/QuizProvider'
import type { Level } from '@/lib/types'
import { loadTest } from '@/lib/testLoader'

const LEVELS: Array<{
  id: Level
  title: string
  description: string
  range: string
  color: string
}> = [
  {
    id: 'junior',
    title: 'Júnior',
    description: 'Fundamentos técnicos em consolidação. Primeiros anos de experiência na área.',
    range: '0–24 pts',
    color: 'blue',
  },
  {
    id: 'pleno',
    title: 'Pleno',
    description: 'Boa base técnica, crescente autonomia e contribuição em decisões do time.',
    range: '25–49 pts',
    color: 'indigo',
  },
  {
    id: 'senior',
    title: 'Sênior',
    description: 'Domínio técnico avançado, liderança técnica e projetos complexos.',
    range: '50–74 pts',
    color: 'violet',
  },
  {
    id: 'especialista',
    title: 'Especialista',
    description: 'Referência da área com visão estratégica e impacto organizacional.',
    range: '75–100 pts',
    color: 'purple',
  },
]

const COLOR_MAP: Record<string, string> = {
  blue: 'border-blue-200 hover:border-blue-500 hover:bg-blue-50',
  indigo: 'border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50',
  violet: 'border-violet-200 hover:border-violet-500 hover:bg-violet-50',
  purple: 'border-purple-200 hover:border-purple-500 hover:bg-purple-50',
}

const BADGE_MAP: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
  purple: 'bg-purple-100 text-purple-700',
}

export default function LevelSelection() {
  const { state, dispatch } = useQuiz()

  const handleSelect = async (level: Level) => {
    dispatch({ type: 'SET_STARTING_LEVEL', level })
    const questions = await loadTest(state.role!, level)
    dispatch({ type: 'LOAD_QUESTIONS', questions })
    dispatch({ type: 'GO_TO_STAGE', stage: 'test' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Selecione seu Nível</h1>
        <p className="text-gray-500 text-sm">
          Escolha o nível que melhor representa onde você está hoje.
          A prova será ajustada ao seu perfil.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => handleSelect(level.id)}
            className={`flex flex-col items-start text-left p-5 bg-white border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${COLOR_MAP[level.color]}`}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xl font-bold text-gray-900">{level.title}</span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${BADGE_MAP[level.color]}`}>
                {level.range}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{level.description}</p>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Não se preocupe com a escolha — o score final é calculado independentemente do nível selecionado.
      </p>
    </div>
  )
}
