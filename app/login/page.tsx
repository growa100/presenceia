'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false); const [loading, setLoading] = useState(false); const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = mode === 'login' ? { email, password } : { email, password, fullName }
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Error'); return }
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid bg-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <div className="w-7 h-7 bg-brand rounded-sm flex items-center justify-center"><span className="text-white font-black text-sm">+</span></div>
          <span className="font-sans font-bold text-white">présence<span className="text-brand">ia</span></span>
        </Link>

        <div className="glass-dark rounded-3xl p-8 border border-white/8">
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8">
            {(['login','register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode===m ? 'bg-brand text-white' : 'text-white/40 hover:text-white'}`}>
                {m === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">Nom complet</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Jean Dupont"
                  className="input-dark w-full px-4 py-3.5 rounded-xl text-sm" />
              </div>
            )}
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jean@entreprise.ch"
                className="input-dark w-full px-4 py-3.5 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase">Mot de passe</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="input-dark w-full px-4 py-3.5 pr-12 rounded-xl text-sm" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-brand text-sm font-mono bg-brand/10 px-4 py-3 rounded-xl border border-brand/20">{error}</p>}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-6">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Chargement…</> : mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
