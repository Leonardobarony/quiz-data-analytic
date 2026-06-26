import type { Level } from '@/lib/types'

const BADGE_STYLES: Record<Level, string> = {
  junior: 'bg-green-100 text-green-800 border-green-300',
  pleno: 'bg-blue-100 text-blue-800 border-blue-300',
  senior: 'bg-purple-100 text-purple-800 border-purple-300',
  especialista: 'bg-amber-100 text-amber-800 border-amber-300',
}

const LEVEL_LABELS: Record<Level, string> = {
  junior: 'Júnior',
  pleno: 'Pleno',
  senior: 'Sênior',
  especialista: 'Especialista',
}

interface Props {
  level: Level
  size?: 'sm' | 'md' | 'lg'
}

export default function LevelBadge({ level, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-xl px-6 py-2' : 'text-sm px-3 py-1'
  return (
    <span className={`inline-block border rounded-full font-semibold ${BADGE_STYLES[level]} ${sizeClass}`}>
      {LEVEL_LABELS[level]}
    </span>
  )
}
