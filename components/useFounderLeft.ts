'use client'
import { useEffect, useState } from 'react'

/** Founder-offer slots left (null while loading). Shared by the pricing section and the client space. */
export function useFounderLeft() {
  const [left, setLeft] = useState<number | null>(null)
  useEffect(() => {
    fetch('/api/offer').then(r => r.json()).then(j => setLeft(typeof j.founderLeft === 'number' ? j.founderLeft : 0)).catch(() => setLeft(0))
  }, [])
  return left
}
