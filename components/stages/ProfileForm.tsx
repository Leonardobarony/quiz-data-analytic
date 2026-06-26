'use client'

import { useState } from 'react'
import { useQuiz } from '@/components/QuizProvider'
import type { Role } from '@/lib/types'

const ROLES: Array<{ id: Role; title: string; subtitle: string; description: string }> = [
  {
    id: 'DA',
    title: 'Analista de Dados',
    subtitle: 'Data Analyst',
    description: 'Foco em modelagem dimensional, BI, SQL e comunicação de insights.',
  },
  {
    id: 'DE',
    title: 'Engenheiro de Dados',
    subtitle: 'Data Engineer',
    description: 'Foco em pipelines, arquitetura, processamento distribuído e cloud.',
  },
]

export default function ProfileForm() {
  const { dispatch } = useQuiz()
  const [userName, setUserName] = useState('')
  const [userSquad, setUserSquad] = useState('')
  const [userTechLevel, setUserTechLevel] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const canContinue = userName.trim().length > 0 && selectedRole !== null

  const handleSubmit = () => {
    if (!canContinue || !selectedRole) return
    dispatch({
      type: 'SET_PROFILE',
      role: selectedRole,
      userName: userName.trim(),
      userSquad: userSquad.trim(),
      userTechLevel: userTechLevel.trim(),
    })
    dispatch({ type: 'GO_TO_STAGE', stage: 'level' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Seu Perfil</h1>
        <p className="text-gray-500 text-sm">Preencha os dados abaixo para começar a avaliação</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Ex: João Silva"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Squad / Equipe <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={userSquad}
            onChange={e => setUserSquad(e.target.value)}
            placeholder="Ex: Squad de Dados, Tribe Analytics"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nível técnico atual <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={userTechLevel}
            onChange={e => setUserTechLevel(e.target.value)}
            placeholder="Ex: Analista Pleno, Engenheiro Sênior"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">
          Qual é o seu perfil profissional? <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex flex-col items-start text-left p-5 border-2 rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                selectedRole === role.id
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <span className={`text-lg font-bold mb-0.5 ${selectedRole === role.id ? 'text-blue-700' : 'text-gray-900'}`}>
                {role.title}
              </span>
              <span className="text-xs text-gray-500 mb-2">{role.subtitle}</span>
              <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
              {selectedRole === role.id && (
                <span className="mt-2 text-xs font-semibold text-blue-600">Selecionado</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canContinue}
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
      >
        Continuar para Seleção de Nível
      </button>
    </div>
  )
}
