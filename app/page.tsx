import Link from 'next/link'

const STEPS = [
  { num: '1', title: 'Escolha seu perfil', desc: 'Analista de Dados (DA) ou Engenheiro de Dados (DE)' },
  { num: '2', title: 'Filtro de ferramentas', desc: 'Selecione as ferramentas que você domina e seu nível de confiança' },
  { num: '3', title: 'Prova técnica', desc: '35 questões adaptadas ao seu perfil e nível detectado' },
  { num: '4', title: 'Auto-avaliação', desc: '20 competências — Sim, Parcialmente ou Não' },
  { num: '5', title: 'Resultado', desc: 'Score por domínio, radar de habilidades, gaps e certificações' },
]

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="text-6xl mb-6">📊</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Quiz Data Analytics
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Avalie sua maturidade profissional como Analista ou Engenheiro de Dados.
        </p>
        <p className="text-sm text-gray-500">
          35 questões técnicas · 6 domínios · Score 0–100 · Resultado com radar e certificações recomendadas
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Como funciona</h2>
        <ol className="space-y-3">
          {STEPS.map(step => (
            <li key={step.num} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {step.num}
              </span>
              <div>
                <p className="text-sm font-medium text-gray-800">{step.title}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="text-center">
        <Link
          href="/quiz"
          className="inline-block px-10 py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          Iniciar Avaliação →
        </Link>
        <p className="mt-4 text-xs text-gray-400">~20 minutos · Sem cadastro · Gratuito</p>
      </div>
    </div>
  )
}
