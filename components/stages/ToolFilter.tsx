'use client'

import { useState } from 'react'
import { useQuiz } from '@/components/QuizProvider'
import { detectStartingLevel } from '@/lib/levelDetection'
import type { ToolSelection } from '@/lib/types'
import toolsData from '@/data/tools.json'

const CONFIDENCE_OPTIONS = [
  { value: 'basico', label: 'Básico', desc: 'Conheço o conceito, pouco uso prático' },
  { value: 'intermediario', label: 'Intermediário', desc: 'Uso com regularidade em projetos reais' },
  { value: 'avancado', label: 'Avançado', desc: 'Domino e mentoreio outros no uso' },
] as const

type Confidence = (typeof CONFIDENCE_OPTIONS)[number]['value']

interface GroupState {
  selectedTools: string[]
  confidence: Confidence | null
}

export default function ToolFilter() {
  const { dispatch } = useQuiz()
  const [groups, setGroups] = useState<Record<string, GroupState>>(() =>
    Object.fromEntries(toolsData.map(g => [g.id, { selectedTools: [], confidence: null }]))
  )

  const toggleTool = (groupId: string, tool: string) => {
    setGroups(prev => {
      const g = prev[groupId]
      const selected = g.selectedTools.includes(tool)
        ? g.selectedTools.filter(t => t !== tool)
        : [...g.selectedTools, tool]
      return { ...prev, [groupId]: { ...g, selectedTools: selected } }
    })
  }

  const setConfidence = (groupId: string, confidence: Confidence) => {
    setGroups(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], confidence },
    }))
  }

  const hasSelections = Object.values(groups).some(
    g => g.selectedTools.length > 0 && g.confidence
  )

  const handleContinue = () => {
    const selections: ToolSelection[] = Object.entries(groups)
      .filter(([, g]) => g.selectedTools.length > 0)
      .map(([groupId, g]) => ({
        groupId,
        selectedTools: g.selectedTools,
        confidence: g.confidence,
      }))

    for (const sel of selections) {
      dispatch({ type: 'SET_TOOL_SELECTION', groupId: sel.groupId, selectedTools: sel.selectedTools, confidence: sel.confidence })
    }

    const level = detectStartingLevel(selections)
    dispatch({ type: 'SET_STARTING_LEVEL', level })
    dispatch({ type: 'GO_TO_STAGE', stage: 'test' })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Filtro de Ferramentas</h2>
        <p className="text-gray-600 text-sm">
          Selecione as ferramentas que você usa e indique seu nível de confiança em cada grupo. Isso define o ponto de partida da sua avaliação.
        </p>
      </div>

      <div className="space-y-6">
        {toolsData.map(group => {
          const gs = groups[group.id]
          const hasToolSelected = gs.selectedTools.length > 0

          return (
            <div key={group.id} className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="font-semibold text-gray-800 mb-3">{group.name}</h3>

              <div className="flex flex-wrap gap-2 mb-4">
                {group.tools.map(tool => {
                  const active = gs.selectedTools.includes(tool)
                  return (
                    <button
                      key={tool}
                      onClick={() => toggleTool(group.id, tool)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {tool}
                    </button>
                  )
                })}
              </div>

              {hasToolSelected && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Nível de confiança no grupo:</p>
                  <div className="flex flex-wrap gap-2">
                    {CONFIDENCE_OPTIONS.map(opt => {
                      const active = gs.confidence === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setConfidence(group.id, opt.value)}
                          title={opt.desc}
                          className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                            active
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-gray-50 text-gray-600 border-gray-300 hover:border-indigo-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!hasSelections}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Iniciar Avaliação Técnica →
        </button>
      </div>
    </div>
  )
}
