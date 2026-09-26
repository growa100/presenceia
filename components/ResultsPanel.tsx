'use client'
import { CheckCircle, XCircle, TrendingUp, RefreshCw, Share2, ArrowRight } from 'lucide-react'
import { ScoringResult } from '@/lib/scoring-engine'
import { type Lang } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface Props { result: ScoringResult; lang: Lang; onReset: () => void }

const gradeColors = {
  A: { ring: '#38A169', text: '#68D391', bg: 'rgba(56,161,105,0.1)' },
  B: { ring: '#3182CE', text: '#63B3ED', bg: 'rgba(49,130,206,0.1)' },
  C: { ring: '#D69E2E', text: '#F6E05E', bg: 'rgba(214,158,46,0.1)' },
  D: { ring: '#E8372A', text: '#FC8181', bg: 'rgba(232,55,42,0.1)' },
  F: { ring: '#6B6B80', text: '#A0AEC0', bg: 'rgba(107,107,128,0.1)' },
}

function AnimatedScore({ score, grade }: { score: number; grade: string }) {
  const [val, setVal] = useState(0)
  const colors = gradeColors[grade as keyof typeof gradeColors] || gradeColors.F
  const size = 160; const sw = 10; const r = (size - sw) / 2; const circ = 2 * Math.PI * r

  useEffect(() => {
    let start = performance.now()
    const dur = 1600
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * score))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [score])

  const offset = circ - (val / 100) * circ
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.ring} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 8px ${colors.ring}40)` }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-5xl" style={{ color: colors.text }}>{val}</span>
        <span className="font-mono text-xs text-white/30 mt-1">/100</span>
        <span className="font-mono text-xs font-bold mt-2 px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>
          GRADE {grade}
        </span>
      </div>
    </div>
  )
}

const platformIcons: Record<string, string> = { chatgpt: '🤖', claude: '🧠', perplexity: '🔍' }
const platformColors: Record<string, string> = { chatgpt: '#10A37F', claude: '#CC785C', perplexity: '#8B5CF6' }

export default function ResultsPanel({ result, lang, onReset }: Props) {
  const isEn = lang === 'en'; const isDe = lang === 'de'
  const share = () => navigator.share?.({ title: 'Mon score IA', text: `${result.businessName}: ${result.overallScore}/100 sur presenceia.com`, url: window.location.href })

  return (
    <div className="space-y-6">
      {/* Score + summary */}
      <div className="flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-shrink-0"><AnimatedScore score={result.overallScore} grade={result.grade} /></div>
        <div>
          <h3 className="text-white font-semibold text-xl mb-1">{result.businessName}</h3>
          <p className="text-white/30 text-sm mb-4">{result.city} · {result.category}</p>
          <p className="text-white/60 text-sm leading-relaxed">{result.summary}</p>
          <div className="flex items-center gap-2 mt-4 text-sm font-mono">
            <TrendingUp className="w-4 h-4 text-brand" />
            <span className="text-white/40">{isEn ? 'AI Share of Voice' : isDe ? 'KI Share of Voice' : 'Part de voix IA'}:</span>
            <span className="text-white font-semibold">{result.shareOfVoice}%</span>
          </div>
        </div>
      </div>

      {/* Platform results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {result.platformResults.map((pr, i) => (
          <div key={i} className={cn('glass-light rounded-2xl p-4 border', pr.appeared ? 'border-green-500/15' : 'border-white/5 opacity-70')}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>{platformIcons[pr.platform] || '🤖'}</span>
                <span className="text-white text-xs font-semibold">{pr.platformLabel}</span>
              </div>
              <div className={cn('flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full', pr.appeared ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                {pr.appeared ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {pr.appeared ? (isEn ? 'Present' : isDe ? 'Präsent' : 'Présent') : (isEn ? 'Absent' : isDe ? 'Abwesend' : 'Absent')}
              </div>
            </div>
            {pr.appeared && (
              <>
                <div className="flex justify-between text-xs font-mono text-white/30 mb-1">
                  <span>Score</span><span>{pr.score}/25</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(pr.score/25)*100}%`, background: platformColors[pr.platform] || '#E8372A' }} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="glass-light rounded-2xl p-6 border border-white/5">
        <h4 className="font-mono text-xs text-brand tracking-widest uppercase mb-4">
          {isEn ? 'Priority actions' : isDe ? 'Prioritäre Massnahmen' : 'Actions prioritaires'}
        </h4>
        <div className="space-y-3">
          {result.topRecommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-mono text-xs text-brand/50 mt-0.5 flex-shrink-0">0{i+1}</span>
              <p className="text-white/60 text-sm leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand rounded-2xl p-6 text-center">
        <h4 className="text-white font-semibold text-lg mb-2">
          {isEn ? 'Ready to dominate AI results?' : isDe ? 'Bereit, KI-Ergebnisse zu dominieren?' : 'Prêt à dominer les recommandations IA ?'}
        </h4>
        <p className="text-white/70 text-sm mb-5">
          {isEn ? 'Get a full audit + action plan from our GEO experts.' : isDe ? 'Erhalten Sie ein vollständiges Audit + Aktionsplan.' : 'Obtenez un audit complet + plan d\'action de nos experts GEO.'}
        </p>
        <div className="flex gap-3 justify-center">
          <a href="mailto:antoine@presenceia.com" className="inline-flex items-center gap-2 bg-white text-brand px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors">
            {isEn ? 'Free audit' : isDe ? 'Kostenloses Audit' : 'Audit gratuit'}
            <ArrowRight className="w-4 h-4" />
          </a>
          <button onClick={share} className="inline-flex items-center gap-2 border border-white/30 text-white px-4 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button onClick={onReset} className="w-full flex items-center justify-center gap-2 text-white/25 hover:text-white/50 text-xs font-mono transition-colors py-2">
        <RefreshCw className="w-3.5 h-3.5" />
        {isEn ? 'Analyse another business' : isDe ? 'Anderes Unternehmen analysieren' : 'Analyser une autre entreprise'}
      </button>
    </div>
  )
}
