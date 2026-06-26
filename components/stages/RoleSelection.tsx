'use client'

import { useQuiz } from '@/components/QuizProvider'
import type { Role } from '@/lib/types'

const ROLES: Array<{ id: Role; title: string; subtitle: string; description: string; emoji: string }> = [
  {
    id: 'DA',
    title: 'Analista de Dados',
    subtitle: 'Data Analyst',
    emoji: '📊',
    description:
      'Foco em modelagem dimensional, BI, Power Platform, SQL e comunicação de insights. Avaliação com ênfase em D3 (Modelagem & BI) e D6 (Power Platform).',
  },
  {
    id: 'DE',
    title: 'Engenheiro de Dados',
    subtitle: 'Data Engineer',
    emoji: '⚙️',
    description:
      'Foco em pipelines, arquitetura, processamento distribuído, cloud e infraestrutura. Avaliação com ênfase em D1 (Pipelines) e D5 (Cloud & Plataformas).',
  },
]

export default function RoleSelection() {
  const { state, dispatch } = useQuiz()

  const handleSelect = (role: Role) => {
    dispatch({ type: 'SET_ROLE', role })
    dispatch({ type: 'GO_TO_STAGE', stage: 'tools' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Qual é o seu perfil profissional?
        </h1>
        <p className="text-gray-600 text-base">
          Selecione o perfil mais próximo da sua atuação para receber a avaliação correta.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => handleSelect(role.id)}
            className="group flex flex-col items-start text-left p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="text-5xl mb-4">{role.emoji}</span>
            <span className="text-xl font-bold text-gray-900 group-hover:text-blue-700">
              {role.title}
            </span>
            <span className="text-sm text-gray-500 mb-3">{role.subtitle}</span>
            <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
