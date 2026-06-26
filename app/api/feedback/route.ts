import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Domain, Level, QuizResult, Role } from '@/lib/types'

const DOMAIN_LABELS: Record<Domain, string> = {
  D1: 'Pipelines & Arquitetura de Dados',
  D2: 'SQL, Python & Processamento Distribuído',
  D3: 'Modelagem de Dados & Semântica Analítica',
  D4: 'Governança, Qualidade & CI/CD',
  D5: 'Análise de Negócios & Requisitos',
  D7: 'Gestão de Projetos & Requisitos de Consultoria',
}

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

function buildPrompt(result: QuizResult, role: Role): string {
  const roleLabel = role === 'DA' ? 'Analista de Dados' : 'Engenheiro de Dados'
  const level = LEVEL_LABELS[result.finalLevel]

  const VALID_DOMAINS = new Set<Domain>(['D1', 'D2', 'D3', 'D4', 'D5', 'D7'])
  const safeGaps = result.gaps.filter((d): d is Domain => VALID_DOMAINS.has(d as Domain))
  const safeStrengths = result.strengths.filter((d): d is Domain => VALID_DOMAINS.has(d as Domain))

  const gaps = safeGaps.map(d => DOMAIN_LABELS[d]).join(', ') || 'Nenhuma lacuna crítica identificada'
  const strengths = safeStrengths.map(d => DOMAIN_LABELS[d]).join(', ') || 'Nenhum ponto forte acima de 70%'

  const safeTotal = Math.max(0, Math.min(100, Number(result.totalScore) || 0))
  const safeD7 = Math.max(0, Math.min(5, Math.round(Number(result.d7RawScore) || 0)))
  const safeSelfScore = Math.max(0, Math.min(40, Math.round(Number(result.selfAssessmentScore) || 0)))

  const domainDetails = (['D1', 'D2', 'D3', 'D4', 'D5'] as const)
    .map(d => {
      const score = Math.max(0, Math.min(20, Number(result.domainScores[d]) || 0))
      return `- ${DOMAIN_LABELS[d]}: ${score.toFixed(1)}/20 (${Math.round((score / 20) * 100)}%)`
    })
    .join('\n')

  return `Você é um mentor especialista em carreiras de dados. Analise o resultado abaixo e forneça um feedback personalizado e construtivo em português do Brasil.

RESULTADO DO QUIZ:
- Perfil: ${roleLabel}
- Nível detectado: ${level}
- Score total: ${safeTotal.toFixed(1)}/100
- Score D7 (Gestão de Projetos): ${safeD7}/5

SCORES POR DOMÍNIO:
${domainDetails}

PONTOS FORTES (≥70%): ${strengths}
LACUNAS PRIORITÁRIAS (<50%): ${gaps}

AUTO-AVALIAÇÃO: ${safeSelfScore}/40 (nível percebido: ${LEVEL_LABELS[result.selfAssessmentLevel]})

Por favor, forneça:
1. Uma análise do perfil atual (2-3 frases)
2. Principais pontos fortes a valorizar
3. Plano de desenvolvimento priorizado para as lacunas identificadas (com recursos concretos)
4. Próximos passos de carreira recomendados para o nível ${level}
5. Uma mensagem motivacional final

Seja específico, prático e encorajador. Use bullet points para facilitar a leitura.`
}

function validateResult(result: unknown): result is QuizResult {
  if (!result || typeof result !== 'object') return false
  const r = result as Record<string, unknown>
  if (typeof r.totalScore !== 'number' || r.totalScore < 0 || r.totalScore > 100) return false
  if (typeof r.d7RawScore !== 'number' || r.d7RawScore < 0 || r.d7RawScore > 5) return false
  if (!r.domainScores || typeof r.domainScores !== 'object') return false
  const ds = r.domainScores as Record<string, unknown>
  for (const key of ['D1', 'D2', 'D3', 'D4', 'D5']) {
    if (typeof ds[key] !== 'number' || (ds[key] as number) < 0 || (ds[key] as number) > 20) return false
  }
  if (!['junior', 'pleno', 'senior', 'especialista'].includes(r.finalLevel as string)) return false
  if (!['junior', 'pleno', 'senior', 'especialista'].includes(r.selfAssessmentLevel as string)) return false
  if (typeof r.selfAssessmentScore !== 'number') return false
  if (!Array.isArray(r.strengths) || !Array.isArray(r.gaps)) return false
  return true
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { result, role } = body as { result: unknown; role: unknown }

    if (!validateResult(result) || !['DA', 'DE'].includes(role as string)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const validatedRole = role as Role

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })
    const prompt = buildPrompt(result, validatedRole)

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Erro na rota de feedback:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
