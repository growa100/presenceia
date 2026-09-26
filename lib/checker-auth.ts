// Access control for the free visibility check ("Analyse gratuite").
// A visitor proves they are human (Cloudflare Turnstile), receives a 6-digit code by email,
// and gets a 30-day session cookie. Each verified email gets 1 fresh check per 24 h.
// Stateless: the pending code lives in a signed token, not in the database.
import jwt from 'jsonwebtoken'
import { createHash, randomInt } from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from './cockpit'
import { supabaseAdmin } from './supabase'
import { sendMail } from './mailer'
import { E, emailShell, mailLang } from './email-layout'

const SECRET = process.env.CHECKER_SECRET || process.env.JWT_SECRET || ''
const IS_PROD = process.env.NODE_ENV === 'production'
export const SESSION_COOKIE = 'pia_check'
const SESSION_DAYS = 30

function secret(): string {
  if (!SECRET && IS_PROD) throw new Error('CHECKER_SECRET is not set')
  return SECRET || 'dev-only-secret'
}

export function normalizeEmail(e: string): string {
  return String(e || '').trim().toLowerCase().slice(0, 200)
}
export function isValidEmail(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e)
}

// Founder addresses (and GEO_UNLIMITED_EMAILS) are not limited, for demos and tests.
export function isUnlimited(email: string): boolean {
  const extra = (process.env.GEO_UNLIMITED_EMAILS || '').toLowerCase().split(',').map(s => s.trim()).filter(Boolean)
  return isAdminEmail(email) || extra.includes(email)
}

// ─── Human check ───────────────────────────────────────────────────────────────
export async function verifyHuman(token: string | undefined, ip: string): Promise<boolean> {
  const key = process.env.TURNSTILE_SECRET_KEY
  if (!key) return !IS_PROD // local dev without keys: allowed; production without keys: refused
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: key, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return !!data.success
  } catch {
    return false
  }
}

// ─── Email code ────────────────────────────────────────────────────────────────
function codeHash(email: string, code: string): string {
  return createHash('sha256').update(`${email}|${code}|${secret()}`).digest('hex')
}

export function createChallenge(email: string): { code: string; challenge: string } {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const challenge = jwt.sign({ e: email, h: codeHash(email, code), k: 'code' }, secret(), { expiresIn: '15m' })
  return { code, challenge }
}

export function verifyChallenge(challenge: string, code: string): string | null {
  try {
    const p = jwt.verify(challenge, secret()) as { e: string; h: string; k: string }
    if (p.k !== 'code') return null
    const clean = String(code || '').replace(/\D/g, '')
    return clean.length === 6 && codeHash(p.e, clean) === p.h ? p.e : null
  } catch {
    return null
  }
}

const CODE_MAIL = {
  fr: { s: 'Votre code Présence IA', t: 'Votre code de connexion', b: 'Saisissez ce code sur presenceia.com pour lancer votre analyse gratuite. Il est valable 15 minutes.', ign: 'Si vous n\'avez rien demandé, ignorez simplement ce message.' },
  de: { s: 'Ihr Présence IA Code', t: 'Ihr Anmeldecode', b: 'Geben Sie diesen Code auf presenceia.com ein, um Ihre kostenlose Analyse zu starten. Er ist 15 Minuten gültig.', ign: 'Falls Sie nichts angefordert haben, ignorieren Sie diese Nachricht.' },
  en: { s: 'Your Présence IA code', t: 'Your sign-in code', b: 'Enter this code on presenceia.com to start your free analysis. It is valid for 15 minutes.', ign: 'If you did not ask for it, simply ignore this message.' },
}

// Returns true when sent. Without RESEND_API_KEY in local dev, the code is only logged.
export async function sendCode(email: string, code: string, language: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    if (IS_PROD) return false
    console.log(`[checker] DEV code for ${email}: ${code}`)
    return true
  }
  const lang = mailLang(language)
  const m = CODE_MAIL[lang]
  return sendMail({
    to: email,
    subject: `${m.s}${lang === 'fr' ? ' : ' : ': '}${code}`,
    text: `${m.t} : ${code}\n\n${m.b}\n\n${m.ign}\n\nPrésence IA, 41 Labs GmbH, Zug\nantoine@presenceia.com`,
    html: emailShell({ lang, preheader: `${m.t} : ${code}`, body: E.title(m.t) + E.p(m.b) + E.code(code) + E.small(m.ign) }),
  })
}

// ─── Magic link (client space) ────────────────────────────────────────────────
// A signed, short-lived link that opens a session for the email it was sent to.
// Stateless and reusable until it expires, so inbox link scanners cannot "use it up".
export function createMagicToken(email: string, ttl: string = '30m'): string {
  return jwt.sign({ e: email, k: 'magic' }, secret(), { expiresIn: ttl as jwt.SignOptions['expiresIn'] })
}

export function verifyMagicToken(token: string): string | null {
  try {
    const p = jwt.verify(token, secret()) as { e: string; k: string }
    return p.k === 'magic' ? p.e : null
  } catch {
    return null
  }
}

/** Link that logs the visitor in and lands on `to` (a path on this site). */
export function magicUrl(base: string, email: string, ttl = '30m', to = '/espace-client'): string {
  return `${base}/api/client/magic?t=${encodeURIComponent(createMagicToken(email, ttl))}&to=${encodeURIComponent(to)}`
}

// ─── Session ───────────────────────────────────────────────────────────────────
export function setSession(res: NextResponse, email: string) {
  const token = jwt.sign({ e: email, k: 'session' }, secret(), { expiresIn: `${SESSION_DAYS}d` })
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, secure: IS_PROD, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400,
  })
}

export function getSessionEmail(req: NextRequest): string | null {
  return sessionEmailFromToken(req.cookies.get(SESSION_COOKIE)?.value)
}

export function sessionEmailFromToken(token: string | undefined): string | null {
  if (!token) return null
  try {
    const p = jwt.verify(token, secret()) as { e: string; k: string }
    return p.k === 'session' ? p.e : null
  } catch {
    return null
  }
}

export function clientIp(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim()
}

// ─── Daily allowance ───────────────────────────────────────────────────────────
export const FREE_PER_DAY = Number(process.env.GEO_FREE_PER_DAY || 1)

// Fresh (paid) checks left in the last 24 h. Cached results are free and not counted.
export async function freeChecksLeft(email: string): Promise<number> {
  if (isUnlimited(email)) return 99
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count } = await supabaseAdmin.from('visibility_checks')
    .select('id', { count: 'exact', head: true }).eq('email', email).eq('from_cache', false).gte('created_at', since)
  return Math.max(0, FREE_PER_DAY - (count || 0))
}
