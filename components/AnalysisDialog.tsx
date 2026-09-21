'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import CheckerForm from '@/components/CheckerForm'

/**
 * The free ChatGPT visibility analysis, as a popup. The trigger lives on
 * the light homepage; the form itself keeps its dark styling inside the
 * dialog, which reads as a focused tool rather than a page section.
 */
export default function AnalysisDialog({ trigger, title, sub }: { trigger: ReactNode; title: string; sub: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
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
