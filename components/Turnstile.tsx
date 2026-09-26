'use client'
import { useEffect, useRef } from 'react'

// Cloudflare Turnstile human check. Without NEXT_PUBLIC_TURNSTILE_SITE_KEY (local dev) it uses
// Cloudflare's public test key, which always passes.
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
const SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
  }
}

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT}"]`) as HTMLScriptElement | null
    const s = existing || document.createElement('script')
    s.addEventListener('load', () => resolve())
    s.addEventListener('error', () => reject(new Error('turnstile')))
    if (!existing) { s.src = SCRIPT; s.async = true; document.head.appendChild(s) }
  })
}

export default function Turnstile({ onToken, lang }: { onToken: (t: string | null) => void; lang: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const idRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return
      idRef.current = window.turnstile.render(ref.current, {
        sitekey: SITE_KEY,
        theme: 'dark',
        language: lang,
        callback: (t: string) => onToken(t),
        'expired-callback': () => onToken(null),
        'error-callback': () => onToken(null),
      })
    }).catch(() => onToken(null))
    return () => {
      cancelled = true
      if (idRef.current && window.turnstile) window.turnstile.remove(idRef.current)
    }
  }, [lang, onToken])

  return <div ref={ref} className="min-h-[65px]" />
}
