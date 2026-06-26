import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import type { Domain, Level, QuizResult, Role } from '@/lib/types'

const DOMAIN_LABELS: Record<Domain, string> = {
  D1: 'Pipelines & Arquitetura de Dados',
  D2: 'SQL, Python & Processamento Distribuído',
  D3: 'Modelagem de Dados & Semântica Analítica',
  D4: 'Governança, Qualidade & Segurança de Dados',
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

function buildPrompt(result: QuizResult, role: Role): string {
  const roleLabel = role === 'DA' ? 'Analista de Dados' : 'Engenheiro de Dados'
  const level = LEVEL_LABELS[result.finalLevel]
  const gaps = result.gaps.map(d => DOMAIN_LABELS[d]).join(', ') || 'Nenhuma lacuna crítica identificada'
  const strengths = result.strengths.map(d => DOMAIN_LABELS[d]).join(', ') || 'Nenhum ponto forte acima de 70%'

  const domainDetails = Object.entries(result.domainScores)
    .map(([d, score]) => `- ${DOMAIN_LABELS[d as Domain]}: ${score.toFixed(1)}/15 (${Math.round((score / 15) * 100)}%)`)
    .join('\n')

  return `Você é um mentor especialista em carreiras de dados. Analise o resultado abaixo e forneça um feedback personalizado e construtivo em português do Brasil.

RESULTADO DO QUIZ:
- Perfil: ${roleLabel}
- Nível detectado: ${level}
- Score total: ${result.totalScore.toFixed(1)}/100
- Score D7 (Visão Estratégica): ${result.d7RawScore}/5

SCORES POR DOMÍNIO:
${domainDetails}

PONTOS FORTES (≥70%): ${strengths}
LACUNAS PRIORITÁRIAS (<50%): ${gaps}

AUTO-AVALIAÇÃO: ${result.selfAssessmentScore}/40 (nível percebido: ${LEVEL_LABELS[result.selfAssessmentLevel]})

Por favor, forneça:
1. Uma análise do perfil atual (2-3 frases)
2. Principais pontos fortes a valorizar
3. Plano de desenvolvimento priorizado para as lacunas identificadas (com recursos concretos)
4. Próximos passos de carreira recomendados para o nível ${level}
5. Uma mensagem motivacional final

Seja específico, prático e encorajador. Use bullet points para facilitar a leitura.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { result, role } = body as { result: QuizResult; role: Role }

    if (!result || !role) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })
    const prompt = buildPrompt(result, role)

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
