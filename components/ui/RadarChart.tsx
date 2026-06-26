'use client'

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart as RechartsRadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { DomainScores } from '@/lib/types'

interface Props {
  domainScores: DomainScores
}

const DOMAIN_SHORT: Record<string, string> = {
  D1: 'Pipelines',
  D2: 'SQL/Python',
  D3: 'Modelagem',
  D4: 'Governança',
  D5: 'Negócios',
}

export default function RadarChart({ domainScores }: Props) {
  const data = Object.entries(domainScores).map(([key, value]) => ({
    domain: DOMAIN_SHORT[key] ?? key,
    score: value,
    fullMark: 20,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsRadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid />
        <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.3}
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)} / 20`, 'Score']}
        />
      </RechartsRadarChart>
    </ResponsiveContainer>
  )
}
