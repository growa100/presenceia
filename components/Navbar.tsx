'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">
              présence<span className="text-red-500">ia</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Comment ça marche
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Tarifs
            </a>
            <a href="mailto:hello@presenceia.com" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Contact
            </a>
            <a
              href="#checker"
              className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              Tester gratuitement →
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-100">
            <a href="#how" className="block text-sm text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>Comment ça marche</a>
            <a href="#pricing" className="block text-sm text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>Tarifs</a>
            <a href="mailto:hello@presenceia.com" className="block text-sm text-gray-700 font-medium py-2" onClick={() => setOpen(false)}>Contact</a>
            <a href="#checker" className="block bg-red-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg text-center mt-2" onClick={() => setOpen(false)}>
              Tester gratuitement →
            </a>
          </div>
        )}
      </div>
    </nav>
  )
}
