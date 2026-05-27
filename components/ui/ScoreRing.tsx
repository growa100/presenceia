'use client'
import { useEffect, useState } from 'react'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
  grade?: string
}

const gradeColors: Record<string, { ring: string; text: string; bg: string }> = {
  A: { ring: '#38A169', text: '#276749', bg: '#F0FFF4' },
  B: { ring: '#3182CE', text: '#2C5282', bg: '#EBF8FF' },
  C: { ring: '#D69E2E', text: '#975A16', bg: '#FFFFF0' },
  D: { ring: '#E53E3E', text: '#C53030', bg: '#FFF5F5' },
  F: { ring: '#1A202C', text: '#2D3748', bg: '#F7FAFC' },
}

export default function ScoreRing({ score, size = 160, strokeWidth = 12, grade = 'F' }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const colors = gradeColors[grade] || gradeColors['F']

  useEffect(() => {
    let start = 0
    const duration = 1400
    const startTime = performance.now()
    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(eased * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score])

  const offset = circumference - (animatedScore / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        {/* Score ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={colors.ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color: colors.text }}>{animatedScore}</span>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mt-0.5">/100</span>
        <div
          className="mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
          style={{ background: colors.bg, color: colors.text }}
        >
          Grade {grade}
        </div>
      </div>
    </div>
  )
}
