'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode, useEffect, useState } from 'react'
import CheckerForm from '@/components/CheckerForm'

/**
 * The free AI visibility analysis, as a popup (dark, inside the light page).
 * Opens from its trigger, from any link ending in "#analyse" (navbar, hero, journey, report email),
 * and when the page is loaded with #analyse.
 */
export default function AnalysisDialog({ trigger, title, sub }: { trigger?: ReactNode; title: string; sub: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onHash = () => { if (window.location.hash === '#analyse') setOpen(true) }
    const first = requestAnimationFrame(onHash) // page loaded with #analyse (e.g. from the report email)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href$="#analyse"]') as HTMLAnchorElement | null
      if (!a) return
      const url = new URL(a.href, window.location.href)
      if (url.pathname !== window.location.pathname) return
      e.preventDefault()
      setOpen(true)
    }
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHash)
    return () => { cancelAnimationFrame(first); document.removeEventListener('click', onClick); window.removeEventListener('hashchange', onHash) }
  }, [])

  const onOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v && window.location.hash === '#analyse') history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink/70 backdrop-blur-sm data-[state=open]:animate-in" />
        <Dialog.Content
          className="fixed z-[70] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-ink text-white border border-white/10 shadow-2xl p-6 md:p-10 focus:outline-none"
          aria-describedby={undefined}
        >
          <div className="flex items-start justify-between gap-6 mb-6">
            <div>
              <Dialog.Title className="font-display text-2xl md:text-3xl leading-tight">{title}</Dialog.Title>
              <p className="mt-2 text-sm text-white/55">{sub}</p>
            </div>
            <Dialog.Close className="flex-shrink-0 w-9 h-9 rounded-full border border-white/15 text-white/60 hover:text-white hover:border-white/40 flex items-center justify-center transition-colors" aria-label="Fermer">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>
          <CheckerForm />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
