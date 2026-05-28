'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, ChevronRight, Check } from 'lucide-react'

const STEPS = ['Votre entreprise', 'Votre site web', 'Accès SFTP', 'Confirmation']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    business_name: '', city: '', category: '', languages: ['fr'],
    website_url: '', google_business_url: '', target_keywords: '',
    sftp_host: '', sftp_user: '', sftp_password_encrypted: '', sftp_path: '/public_html',
  })

  const update = (k: string, v: string | string[]) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async () => {
    setLoading(true)
    const payload = { ...form, target_keywords: form.target_keywords.split(',').map(s => s.trim()).filter(Boolean) }
    const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setLoading(false)
    if (res.ok) router.push('/dashboard')
  }

  const inputCls = "input-dark w-full px-4 py-3 rounded-xl text-sm"
  const labelCls = "block text-xs font-mono text-white/40 mb-2 tracking-wider uppercase"

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-grid bg-grid opacity-20 pointer-events-none" />
      <div className="relative z-10 w-full max-w-xl">
        <Link href="/" className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-7 h-7 bg-brand rounded-sm flex items-center justify-center"><span className="text-white font-black text-sm">+</span></div>
          <span className="font-sans font-bold text-white">présence<span className="text-brand">ia</span></span>
        </Link>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand text-white' : 'bg-white/5 text-white/30'}`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              <span className={`text-xs font-mono hidden sm:block ${i === step ? 'text-white/70' : 'text-white/20'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-green-500/30' : 'bg-white/5'}`} />}
            </div>
          ))}
        </div>

        <div className="glass-dark rounded-3xl p-8 border border-white/8">
          <h2 className="font-display text-2xl text-white mb-6">{STEPS[step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <div><label className={labelCls}>Nom de l'entreprise *</label><input value={form.business_name} onChange={e=>update('business_name',e.target.value)} placeholder="Plomberie Dupont SA" className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Ville *</label><input value={form.city} onChange={e=>update('city',e.target.value)} placeholder="Sion" className={inputCls} /></div>
                <div><label className={labelCls}>Secteur *</label>
                  <select value={form.category} onChange={e=>update('category',e.target.value)} className={inputCls + ' appearance-none cursor-pointer'}>
                    <option value="">Sélectionner…</option>
                    {['Plombier','Électricien','Dentiste','Médecin','Avocat','Fiduciaire','Restaurant','Hôtel','Immobilier','Architecte','Autre'].map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Langues cibles</label>
                <div className="flex gap-3">
                  {[['fr','Français'],['de','Deutsch'],['en','English'],['it','Italiano']].map(([code, name]) => (
                    <button key={code} type="button" onClick={() => update('languages', form.languages.includes(code) ? form.languages.filter(l=>l!==code) : [...form.languages, code])}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${form.languages.includes(code) ? 'bg-brand/20 border-brand/50 text-brand' : 'border-white/10 text-white/30 hover:text-white'}`}>
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={labelCls}>Mots-clés cibles (séparés par virgule)</label><input value={form.target_keywords} onChange={e=>update('target_keywords',e.target.value)} placeholder="plombier urgence Sion, débouchage Valais" className={inputCls} /></div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div><label className={labelCls}>URL du site web</label><input value={form.website_url} onChange={e=>update('website_url',e.target.value)} placeholder="https://www.monentreprise.ch" className={inputCls} /></div>
              <div><label className={labelCls}>Google Business Profile URL</label><input value={form.google_business_url} onChange={e=>update('google_business_url',e.target.value)} placeholder="https://business.google.com/..." className={inputCls} /></div>
              <div className="glass-light rounded-xl p-4 border border-white/5">
                <p className="text-white/50 text-sm">💡 <strong className="text-white/70">Astuce :</strong> Votre URL Google Business se trouve dans votre tableau de bord Google Business Profile sous "Infos" → "Partager le profil".</p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="glass-light rounded-xl p-4 border border-white/5 mb-4">
                <p className="text-white/50 text-sm">🔒 Vos identifiants SFTP sont chiffrés et utilisés uniquement par nos agents pour déployer les optimisations sur votre site. Vous pouvez les renseigner plus tard.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelCls}>Hôte SFTP</label><input value={form.sftp_host} onChange={e=>update('sftp_host',e.target.value)} placeholder="ftp.infomaniak.com" className={inputCls} /></div>
                <div><label className={labelCls}>Utilisateur</label><input value={form.sftp_user} onChange={e=>update('sftp_user',e.target.value)} placeholder="user@domain.ch" className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>Mot de passe SFTP</label><input type="password" value={form.sftp_password_encrypted} onChange={e=>update('sftp_password_encrypted',e.target.value)} className={inputCls} /></div>
              <div><label className={labelCls}>Chemin racine</label><input value={form.sftp_path} onChange={e=>update('sftp_path',e.target.value)} placeholder="/public_html" className={inputCls} /></div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[['Entreprise', form.business_name],['Ville', form.city],['Secteur', form.category],['Site web', form.website_url || 'Non renseigné'],['Langues', form.languages.join(', ')],['SFTP', form.sftp_host || 'Non configuré']].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-white/5">
                    <span className="font-mono text-xs text-white/30">{k}</span>
                    <span className="text-white/70 text-sm">{v}</span>
                  </div>
                ))}
              </div>
              <div className="glass-light rounded-xl p-4 border border-green-500/15 mt-4">
                <p className="text-white/60 text-sm">✅ Après confirmation, nos agents IA démarreront automatiquement l'audit de votre présence IA et la génération de vos données structurées.</p>
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && <button onClick={()=>setStep(s=>s-1)} className="btn-ghost px-6 py-3 rounded-xl text-sm font-medium">← Retour</button>}
            {step < 3
              ? <button onClick={()=>setStep(s=>s+1)} disabled={step===0 && (!form.business_name||!form.city||!form.category)}
                  className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              : <button onClick={submit} disabled={loading}
                  className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Enregistrement…</> : <>Lancer l'optimisation IA ✓</>}
                </button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}
