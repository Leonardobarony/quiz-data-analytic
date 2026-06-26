'use client'

import { Component, type ReactNode } from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

export class QuizErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[QuizErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Algo deu errado</h2>
          <p className="text-sm text-gray-500 mb-6">
            {this.state.error?.message ?? 'Erro inesperado. Tente reiniciar o quiz.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
