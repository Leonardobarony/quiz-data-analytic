'use client'

import { useState } from 'react'
import { useQuiz } from '@/components/QuizProvider'
import LevelBadge from '@/components/ui/LevelBadge'
import RadarChart from '@/components/ui/RadarChart'
import type { Domain, DomainScores, Level } from '@/lib/types'

const DOMAIN_LABELS: Record<Domain, string> = {
  D1: 'Pipelines & Arquitetura',
  D2: 'SQL, Python & Processamento',
  D3: 'Modelagem & Semântica Analítica',
  D4: 'Governança, Qualidade & Segurança',
  D5: 'Cloud, Infraestrutura & Plataformas',
  D6: 'Power Platform & Low-Code',
  D7: 'Visão Estratégica & Mercado',
}

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

const CERTS_BY_LEVEL: Record<Level, string[]> = {
  junior: ['DP-900 (Azure Data Fundamentals)', 'PL-900 (Power Platform Fundamentals)', 'AZ-900 (Azure Fundamentals)'],
  pleno: ['PL-300 (Power BI Data Analyst)', 'DP-203 (Azure Data Engineer Associate)', 'DP-600 (Fabric Analytics Engineer)', 'Databricks Associate Developer for Spark'],
  senior: ['DP-700 (Fabric Data Engineer)', 'AWS Certified Data Engineer – Associate', 'Databricks Data Engineer Professional', 'Google Professional Data Engineer'],
  especialista: ['DP-600 + DP-700 (Fabric Full Stack)', 'Databricks Certified Data Engineer Professional', 'AWS Certified Data Analytics Specialty', 'dbt Analytics Engineering Certification'],
}

export default function Results() {
  const { state, dispatch } = useQuiz()
  const { result, role } = state
  const [feedbackText, setFeedbackText] = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)

  if (!result) return null

  const domains: (keyof DomainScores)[] = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6']

  const handleFeedback = async () => {
    setLoadingFeedback(true)
    setFeedbackText('')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result, role }),
      })
      if (!res.body) return
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        const { value, done: d } = await reader.read()
        done = d
        if (value) setFeedbackText(prev => prev + decoder.decode(value))
      }
    } catch (e) {
      setFeedbackText('Erro ao gerar feedback. Verifique a chave da API.')
    } finally {
      setLoadingFeedback(false)
    }
  }

  const handlePDF = async () => {
    setLoadingPDF(true)
    try {
      const { exportToPDF } = await import('@/lib/pdfExport')
      await exportToPDF({ role: role!, result })
    } finally {
      setLoadingPDF(false)
    }
  }

  const handleReset = () => dispatch({ type: 'RESET' })

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 mb-2">Resultado da Avaliação</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {role === 'DA' ? 'Analista de Dados' : 'Engenheiro de Dados'}
        </h1>
        <div className="flex items-center justify-center gap-4">
          <LevelBadge level={result.finalLevel} size="lg" />
          <span className="text-2xl font-bold text-blue-700">
            {result.totalScore.toFixed(1)} <span className="text-base font-normal text-gray-500">/ 100 pts</span>
          </span>
        </div>
      </div>

      {/* Radar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Score por Domínio</h2>
        <RadarChart domainScores={result.domainScores} />
      </div>

      {/* Scores detalhados */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Scores Detalhados</h2>
        <div className="space-y-3">
          {domains.map(d => {
            const score = result.domainScores[d]
            const pct = Math.round((score / 15) * 100)
            const isStrength = result.strengths.includes(d)
            const isGap = result.gaps.includes(d)
            return (
              <div key={d} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-52 truncate">{DOMAIN_LABELS[d]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${isStrength ? 'bg-green-500' : isGap ? 'bg-red-400' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 w-16 text-right">
                  {score.toFixed(1)} / 15
                </span>
                {isStrength && <span className="text-xs text-green-600">✓ Forte</span>}
                {isGap && <span className="text-xs text-red-500">⚠ Gap</span>}
              </div>
            )
          })}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-700 w-52">D7 – Visão Estratégica</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-indigo-400 transition-all"
                style={{ width: `${(result.d7RawScore / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-16 text-right">
              {result.d7RawScore} / 5
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700 w-52">Filtro de Ferramentas</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-amber-400 transition-all"
                style={{ width: `${(result.toolFilterScore / 10) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 w-16 text-right">
              {result.toolFilterScore.toFixed(1)} / 10
            </span>
          </div>
        </div>
      </div>

      {/* Pontos fortes e gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {result.strengths.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <h3 className="font-semibold text-green-800 mb-2">✓ Pontos Fortes</h3>
            <ul className="text-sm text-green-700 space-y-1">
              {result.strengths.map(d => <li key={d}>• {DOMAIN_LABELS[d]}</li>)}
            </ul>
          </div>
        )}
        {result.gaps.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-semibold text-red-800 mb-2">⚠ Lacunas Prioritárias</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {result.gaps.map(d => <li key={d}>• {DOMAIN_LABELS[d]}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Auto-avaliação */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-2">Auto-avaliação de Competências</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Score: {result.selfAssessmentScore} / 40</span>
          <span className="text-gray-400">·</span>
          <LevelBadge level={result.selfAssessmentLevel} size="sm" />
          {result.selfAssessmentLevel !== result.finalLevel && (
            <span className="text-xs text-gray-500">
              (percepção: {LEVEL_LABELS[result.selfAssessmentLevel]} / avaliação: {LEVEL_LABELS[result.finalLevel]})
            </span>
          )}
        </div>
      </div>

      {/* Certificações recomendadas */}
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

      {/* Feedback da IA — visível apenas quando NEXT_PUBLIC_ENABLE_AI_FEEDBACK=true */}
      {process.env.NEXT_PUBLIC_ENABLE_AI_FEEDBACK === 'true' && feedbackText && (
        <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
          <h3 className="font-semibold text-indigo-800 mb-3">✨ Feedback Personalizado</h3>
          <div className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{feedbackText}</div>
        </div>
      )}
    </div>
  )
}
