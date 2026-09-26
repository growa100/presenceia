'use client'
import { CheckCircle2, Search, Sparkles, XCircle } from 'lucide-react'
import { useLang } from './LangProvider'
import { agencyCopy } from '@/lib/agency-copy'

// Hero illustration: what an AI assistant answer looks like when you are recommended.
// Fictional names, labelled as an illustrative example. No third-party logos.
export default function AiAnswerMock() {
  const { lang } = useLang()
  const m = agencyCopy[lang].mock
  const assistants = [['ChatGPT', true], ['Gemini', true], ['Claude', true], ['Perplexity', false]] as const
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0" aria-hidden="true">
      <div className="absolute -inset-6 bg-brand/10 blur-3xl rounded-full pointer-events-none" />
      <div className="relative rounded-3xl bg-ink text-white shadow-2xl border border-white/10 p-5 md:p-6 rotate-[0.6deg]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/40">
            <Sparkles className="w-3.5 h-3.5 text-brand" /> {m.label}
          </span>
          <span className="flex gap-1"><i className="w-2 h-2 rounded-full bg-white/15" /><i className="w-2 h-2 rounded-full bg-white/15" /><i className="w-2 h-2 rounded-full bg-white/15" /></span>
        </div>
        <div className="mt-5 flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-white/10 px-4 py-3 text-sm flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-white/50 flex-shrink-0" /> {m.q}
          </div>
        </div>
        <div className="mt-4 rounded-2xl rounded-bl-md bg-white/[0.04] border border-white/10 px-4 py-4">
          <p className="text-sm text-white/70">{m.intro}</p>
          <ol className="mt-3 space-y-2">
            {m.items.map((it, i) => {
              const you = 'you' in it && it.you
              return (
                <li key={it.name} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${you ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white/[0.03]'}`}>
                  <span className="flex items-center gap-3 text-sm">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${you ? 'bg-white text-brand' : 'bg-white/10 text-white/60'}`}>{i + 1}</span>
                    <span className={you ? 'font-semibold' : 'text-white/80'}>{it.name}</span>
                  </span>
                  <span className={`text-[11px] font-mono ${you ? 'text-white/90' : 'text-white/40'}`}>{you ? m.you : it.meta}</span>
                </li>
              )
            })}
          </ol>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {assistants.map(([name, ok]) => (
            <span key={name} className={`inline-flex items-center gap-1.5 text-[11px] font-mono rounded-full px-2.5 py-1 ${ok ? 'bg-green-500/15 text-green-300' : 'bg-white/5 text-white/35'}`}>
              {ok ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />} {name}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs font-mono text-white/40">{m.footer}</p>
      </div>
    </div>
  )
}
