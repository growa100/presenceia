'use client'
import { CheckCircle, XCircle, TrendingUp, Minus } from 'lucide-react'
import { PlatformResult } from '@/lib/scoring-engine'

const platformIcons: Record<string, string> = {
  chatgpt: '🤖',
  claude: '🧠',
  perplexity: '🔍',
}

const platformColors: Record<string, string> = {
  chatgpt: '#10A37F',
  claude: '#CC785C',
  perplexity: '#8B5CF6',
}

interface Props {
  result: PlatformResult
  lang: 'fr' | 'en'
}

const labels = {
  fr: { appeared: 'Présent', not_appeared: 'Absent', position: 'Position', first: '1ère position', second: '2ème position' },
  en: { appeared: 'Present', not_appeared: 'Absent', position: 'Position', first: '1st position', second: '2nd position' },
}

export default function PlatformCard({ result, lang }: Props) {
  const l = labels[lang]
  const icon = platformIcons[result.platform] || '🤖'
  const color = platformColors[result.platform] || '#718096'

  return (
    <div className={`
      relative rounded-2xl border p-5 transition-all duration-200
      ${result.appeared
        ? 'bg-white border-green-100 shadow-soft hover:shadow-card'
        : 'bg-gray-50 border-gray-200 opacity-80'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{result.platformLabel}</p>
            <p className="text-xs text-gray-400">{result.query.length > 45 ? result.query.slice(0, 45) + '…' : result.query}</p>
          </div>
        </div>
        <div className={`
          flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
          ${result.appeared ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}
        `}>
          {result.appeared
            ? <><CheckCircle className="w-3.5 h-3.5" />{l.appeared}</>
            : <><XCircle className="w-3.5 h-3.5" />{l.not_appeared}</>
          }
        </div>
      </div>

      {result.appeared && (
        <div className="space-y-2.5">
          {/* Position */}
          {result.position && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-gray-600">
                {l.position}: <span className="font-semibold text-gray-900">
                  {result.position === 1 ? l.first : result.position === 2 ? l.second : `#${result.position}`}
                </span>
              </span>
            </div>
          )}

          {/* Sentiment */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              result.sentiment === 'positive' ? 'bg-green-400' :
              result.sentiment === 'neutral' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-gray-600 capitalize">{result.sentiment}</span>
          </div>

          {/* Score bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Score</span>
              <span>{result.score}/25</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${(result.score / 25) * 100}%`,
                  background: color
                }}
              />
            </div>
          </div>
        </div>
      )}

      {!result.appeared && (
        <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
          <Minus className="w-4 h-4" />
          <span>{lang === 'fr' ? 'Non trouvé dans cette réponse' : 'Not found in this response'}</span>
        </div>
      )}
    </div>
  )
}
