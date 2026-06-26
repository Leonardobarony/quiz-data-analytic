'use client'

import type { Question } from '@/lib/types'

interface Props {
  question: Question
  selectedKey: string | null
  onSelect: (key: string) => void
  showCorrect?: boolean
}

export default function QuestionCard({ question, selectedKey, onSelect, showCorrect = false }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <p className="text-gray-800 font-medium text-base leading-relaxed mb-6" id={`question-${question.id}`}>
        {question.text}
      </p>
      <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${question.id}`}>
        {question.options.map((opt) => {
          const isSelected = selectedKey === opt.key
          const isCorrect = showCorrect && opt.correct
          const isWrong = showCorrect && isSelected && !opt.correct

          let base = 'flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer '
          if (isCorrect) base += 'border-green-400 bg-green-50 text-green-800'
          else if (isWrong) base += 'border-red-400 bg-red-50 text-red-800'
          else if (isSelected) base += 'border-blue-500 bg-blue-50 text-blue-800'
          else base += 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'

          return (
            <button
              key={opt.key}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Opção ${opt.key}: ${opt.text}`}
              className={base}
              onClick={() => onSelect(opt.key)}
              disabled={showCorrect}
            >
              <span className="flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-current" aria-hidden="true">
                {opt.key}
              </span>
              <span className="text-sm leading-relaxed">{opt.text}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
