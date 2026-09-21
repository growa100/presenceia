'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Compass, Briefcase, LogOut, ExternalLink } from 'lucide-react'
import { Spinner } from '@/components/cockpit/ui'

const NAV = [
  { href: '/cockpit', label: 'Vue d’ensemble', icon: LayoutDashboard, exact: true },
  { href: '/cockpit/prospects', label: 'Prospects', icon: Users },
  { href: '/cockpit/direction', label: 'Direction', icon: Compass },
  { href: '/admin', label: 'Clients', icon: Briefcase },
]

export default function CockpitLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : { user: null })
      .then(d => {
        if (!d.user) { router.replace('/login?next=/cockpit'); return }
        if (d.user.role !== 'admin') { router.replace('/dashboard'); return }
        setUser(d.user); setChecked(true)
      })
      .catch(() => router.replace('/login?next=/cockpit'))
  }, [router])

  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/') }

  if (!checked) return <div className="min-h-screen page-light flex items-center justify-center"><Spinner /></div>

  return (
    <div className="min-h-screen page-light text-ink">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-white/60 backdrop-blur">
          <Link href="/" className="flex items-center gap-2 px-5 h-16 border-b border-line">
            <div className="w-6 h-6 bg-brand rounded-sm flex items-center justify-center"><span className="text-white font-black text-xs">+</span></div>
            <span className="font-bold">présence<span className="text-brand">ia</span></span>
            <span className="ml-auto text-[10px] font-mono uppercase tracking-wider text-ink/40">cockpit</span>
          </Link>
          <nav className="flex-1 p-3 space-y-1">
            {NAV.map(n => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href)
              return (
                <Link key={n.href} href={n.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-ink text-white' : 'text-ink/70 hover:bg-ink/5'}`}>
                  <n.icon className="w-4 h-4" />{n.label}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t border-line">
            <a href="https://app.instantly.ai/app/unibox" target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ink/60 hover:bg-ink/5">
              <ExternalLink className="w-4 h-4" />Réponses (Unibox)
            </a>
            <div className="px-3 pt-3 pb-1 text-xs text-ink/50 truncate">{user?.email}</div>
            <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-ink/60 hover:bg-ink/5 w-full">
              <LogOut className="w-4 h-4" />Déconnexion
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="md:hidden flex items-center gap-1 px-2 h-14 border-b border-line bg-white/70 overflow-x-auto">
            {NAV.map(n => {
              const active = n.exact ? pathname === n.href : pathname.startsWith(n.href)
              return (
                <Link key={n.href} href={n.href}
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${active ? 'bg-ink text-white' : 'text-ink/70'}`}>{n.label}</Link>
              )
            })}
          </header>
          <main className="p-4 md:p-8 max-w-[1400px]">{children}</main>
        </div>
      </div>
    </div>
  )
}
