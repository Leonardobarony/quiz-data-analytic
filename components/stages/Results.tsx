'use client'

import { useState } from 'react'
import { useQuiz } from '@/components/QuizProvider'
import LevelBadge from '@/components/ui/LevelBadge'
import RadarChart from '@/components/ui/RadarChart'
import type { DomainScores, Level } from '@/lib/types'

const DOMAIN_LABELS: Record<keyof DomainScores, string> = {
  D1: 'Pipelines & Arquitetura',
  D2: 'SQL, Python & Processamento',
  D3: 'Modelagem & Semântica Analítica',
  D4: 'Governança, Qualidade & CI/CD',
  D5: 'Análise de Negócios & Requisitos',
}

const DOMAIN_MEANINGS: Record<keyof DomainScores, string> = {
  D1: 'Projetar e operar pipelines de dados confiáveis e escaláveis',
  D2: 'Domínio de SQL, Python e frameworks de processamento distribuído',
  D3: 'Estruturar dados para análise eficiente com semântica clara',
  D4: 'Governança, qualidade, segurança e CI/CD em projetos de dados',
  D5: 'Traduzir necessidades de negócio em soluções de dados com impacto',
}

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

const LEVEL_DESCRIPTIONS: Record<Level, string> = {
  junior: 'Profissional em início de carreira com fundamentos técnicos em consolidação. Foco em ganhar autonomia e ampliar o repertório de ferramentas e práticas.',
  pleno: 'Profissional com boa base técnica, capaz de conduzir projetos com supervisão reduzida e contribuir ativamente em decisões técnicas da equipe.',
  senior: 'Profissional com domínio técnico avançado, referência para o time e capaz de liderar projetos complexos de ponta a ponta com autonomia total.',
  especialista: 'Referência técnica da área com visão estratégica e capacidade de definir arquitetura, padrões organizacionais e direção de dados da empresa.',
}

const CERTS_BY_LEVEL: Record<Level, string[]> = {
  junior: ['AZ-900 (Azure Fundamentals)', 'DP-900 (Azure Data Fundamentals)', 'PL-900 (Power Platform Fundamentals)'],
  pleno: ['DP-600 (Fabric Analytics Engineer)', 'DP-700 (Fabric Data Engineer)'],
  senior: ['DP-203 (Azure Data Engineer Associate)', 'Databricks Data Engineer Associate'],
  especialista: ['DP-700 + DP-600 (Fabric Full Stack)', 'Databricks Data Engineer Professional', 'PL-400 (Power Automate Developer)', 'DP-203 (Azure Data Engineer Associate)'],
}

const D7_INTERPRETATION = (raw: number) => {
  if (raw <= 1) return 'Lacunas críticas em gestão de projetos e consultoria'
  if (raw <= 3) return 'Conhecimento parcial — oportunidade de desenvolvimento'
  if (raw === 4) return 'Bom entendimento de gestão de projetos'
  return 'Domínio completo de gestão de projetos e consultoria'
}

const NEXT_STEPS_BY_LEVEL: Record<Level, string[]> = {
  junior: [
    'Consolide os fundamentos: SQL, Python básico e conceitos de pipelines batch e streaming',
    'Busque projetos práticos no time — mesmo os menores entregam aprendizado real',
    'Prepare-se para a certificação DP-900 ou AZ-900 como validação dos fundamentos',
  ],
  pleno: [
    'Aprofunde o domínio de processamento distribuído (ex: Spark, Databricks) e modelagem dimensional',
    'Assuma ownership de um pipeline ou domínio de dados end-to-end no time',
    'Prepare-se para DP-600 (Fabric Analytics Engineer) ou DP-700 (Fabric Data Engineer)',
  ],
  senior: [
    'Desenvolva habilidades de arquitetura: lakehouse, data mesh, governança em escala',
    'Mentoreie profissionais juniores e plenos — é o melhor jeito de solidificar o próprio conhecimento',
    'Prepare-se para DP-203 ou Databricks Data Engineer Professional',
  ],
  especialista: [
    'Contribua para a estratégia de dados da organização — defina padrões, roadmap e cultura de dados',
    'Publique conteúdo técnico, lidere comunidades ou talks internos para ampliar impacto',
    'Explore certificações avançadas como Databricks Professional ou DP-700 + DP-600 combinados',
  ],
}

function nextLevelInfo(score: number): { label: string; pts: number } | null {
  if (score < 25) return { label: 'Pleno', pts: Math.ceil(25 - score) }
  if (score < 50) return { label: 'Sênior', pts: Math.ceil(50 - score) }
  if (score < 75) return { label: 'Especialista', pts: Math.ceil(75 - score) }
  return null
}

export default function Results() {
  const { state, dispatch } = useQuiz()
  const { result, role, userName, userSquad, userTechLevel } = state
  const [feedbackText, setFeedbackText] = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)

  if (!result || !role) return null

  const domains: (keyof DomainScores)[] = ['D1', 'D2', 'D3', 'D4', 'D5']
  const next = nextLevelInfo(result.totalScore)

  const handleFeedback = async () => {
    setLoadingFeedback(true)
    setFeedbackText('')
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, role }),
      })
      if (!res.body) return
      reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) setFeedbackText(prev => prev + decoder.decode(value))
      }
    } catch {
      reader?.cancel()
      setFeedbackText('Erro ao gerar feedback. Verifique a chave da API.')
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handlePDF = async () => {
    setLoadingPDF(true)
    try {
      const { exportToPDF } = await import('@/lib/pdfExport')
      await exportToPDF({ role, result, userName, userSquad, userTechLevel })
    } finally {
      setLoadingPDF(false)
    }
  }

  const handleReset = () => dispatch({ type: 'RESET' })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-1">Resultado da Avaliação</p>
        {userName && (
          <p className="text-base font-semibold text-gray-800 mb-0.5">{userName}</p>
        )}
        {(userSquad || userTechLevel) && (
          <p className="text-sm text-gray-500 mb-2">
            {[userSquad, userTechLevel].filter(Boolean).join(' · ')}
          </p>
        )}
        <p className="text-sm text-gray-500 mb-3">
          {role === 'DA' ? 'Analista de Dados' : 'Engenheiro de Dados'}
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <LevelBadge level={result.finalLevel} size="lg" />
          <span className="text-2xl font-bold text-blue-700">
            {result.totalScore.toFixed(1)}{' '}
            <span className="text-base font-normal text-gray-500">/ 100 pts</span>
          </span>
        </div>
      </div>

      {/* Seção nível */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-2">
          Você está no nível {LEVEL_LABELS[result.finalLevel]}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {LEVEL_DESCRIPTIONS[result.finalLevel]}
        </p>
        {/* Barra de progresso geral */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
          <div className="relative h-3 bg-gray-100 rounded-full">
            <div
              className="h-3 rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(result.totalScore, 100)}%` }}
            />
            {[25, 50, 75].map(mark => (
              <div
                key={mark}
                className="absolute top-0 h-3 w-px bg-gray-300"
                style={{ left: `${mark}%` }}
              />
            ))}
          </div>
        </div>
        {next ? (
          <p className="text-sm text-blue-600 font-medium">
            Faltam <strong>{next.pts} pts</strong> para o nível {next.label}
          </p>
        ) : (
          <p className="text-sm text-green-600 font-medium">
            Você atingiu o nível máximo — Especialista
          </p>
        )}
      </div>

      {/* Radar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Score por Domínio</h2>
        <RadarChart domainScores={result.domainScores} />
      </div>

      {/* Scores detalhados */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Análise por Domínio</h2>
        <div className="space-y-4">
          {domains.map(d => {
            const score = result.domainScores[d]
            const pct = Math.round((score / 20) * 100)
            const isStrength = result.strengths.includes(d)
            const isGap = result.gaps.includes(d)
            return (
              <div key={d}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm font-medium text-gray-800 w-52 truncate">
                    {DOMAIN_LABELS[d]}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        isStrength ? 'bg-green-500' : isGap ? 'bg-red-400' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                    {score.toFixed(1)} / 20
                  </span>
                  {isStrength && <span className="text-xs text-green-600 font-medium w-12">✓ Forte</span>}
                  {isGap && <span className="text-xs text-red-500 font-medium w-12">⚠ Gap</span>}
                  {!isStrength && !isGap && <span className="w-12" />}
                </div>
                <p className="text-xs text-gray-400 ml-0 pl-0">{DOMAIN_MEANINGS[d]}</p>
              </div>
            )
          })}

          {/* D7 */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm font-medium text-gray-800 w-52">
                D7 – Gestão de Projetos
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-indigo-400 transition-all"
                  style={{ width: `${(result.d7RawScore / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                {result.d7RawScore} / 5
              </span>
              <span className="w-12" />
            </div>
            <p className="text-xs text-gray-400">{D7_INTERPRETATION(result.d7RawScore)}</p>
          </div>
        </div>
      </div>

      {/* Pontos fortes e gaps */}
      {(result.strengths.length > 0 || result.gaps.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {result.strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <h3 className="font-semibold text-green-800 mb-2">✓ Pontos Fortes</h3>
              <ul className="text-sm text-green-700 space-y-1">
                {result.strengths.map(d => (
                  <li key={d}>• {DOMAIN_LABELS[d as keyof DomainScores]}</li>
                ))}
              </ul>
            </div>
          )}
          {result.gaps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <h3 className="font-semibold text-red-800 mb-2">⚠ Lacunas Prioritárias</h3>
              <ul className="text-sm text-red-700 space-y-1">
                {result.gaps.map(d => (
                  <li key={d}>• {DOMAIN_LABELS[d as keyof DomainScores]}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Auto-avaliação */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Auto-avaliação de Competências</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600">Score: {result.selfAssessmentScore} / 40</span>
          <span className="text-gray-300">·</span>
          <LevelBadge level={result.selfAssessmentLevel} size="sm" />
          {result.selfAssessmentLevel !== result.finalLevel && (
            <span className="text-xs text-gray-500">
              (percepção: {LEVEL_LABELS[result.selfAssessmentLevel]} / avaliação técnica: {LEVEL_LABELS[result.finalLevel]})
            </span>
          )}
        </div>
        {result.selfAssessmentLevel !== result.finalLevel && (
          <p className="text-xs text-gray-400 mt-2">
            {result.selfAssessmentScore > (result.totalScore / 100 * 40)
              ? 'Sua percepção está acima do score técnico — mantenha a ambição, mas foque nas lacunas identificadas.'
              : 'Você pode estar subestimando seu potencial — os gaps identificados são trabalhável com foco.'}
          </p>
        )}
      </div>

      {/* Próximos Passos */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-blue-800 mb-3">Próximos Passos Recomendados</h3>
        <ul className="space-y-2.5">
          {NEXT_STEPS_BY_LEVEL[result.finalLevel].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
              <span className="font-bold text-blue-400 mt-0.5">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Certificações */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-8">
        <h3 className="font-semibold text-gray-800 mb-3">Certificações Recomendadas</h3>
        <ul className="text-sm text-gray-700 space-y-2">
          {CERTS_BY_LEVEL[result.finalLevel].map(cert => (
            <li key={cert} className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">→</span>
              <span>{cert}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handlePDF}
          disabled={loadingPDF}
          className="px-6 py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-colors"
        >
          {loadingPDF ? 'Gerando PDF...' : '⬇ Exportar PDF'}
        </button>
        {process.env.NEXT_PUBLIC_ENABLE_AI_FEEDBACK === 'true' && (
          <button
            onClick={handleFeedback}
            disabled={loadingFeedback}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loadingFeedback ? 'Gerando...' : '✨ Feedback com IA'}
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Reiniciar Quiz
        </button>
      </div>

      {process.env.NEXT_PUBLIC_ENABLE_AI_FEEDBACK === 'true' && feedbackText && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <h3 className="font-semibold text-indigo-800 mb-3">✨ Feedback Personalizado</h3>
          <div className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{feedbackText}</div>
        </div>
      )}
    </div>
  )
}
