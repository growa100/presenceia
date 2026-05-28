'use client'
import { useEffect } from 'react'

export function useCursor() {
  useEffect(() => {
    const cursor = document.querySelector('.cursor') as HTMLElement
    const ring = document.querySelector('.cursor-ring') as HTMLElement
    if (!cursor || !ring) return

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0

    const move = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      cursor.style.left = mouseX + 'px'
      cursor.style.top = mouseY + 'px'
    }

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12
      ringY += (mouseY - ringY) * 0.12
      ring.style.left = ringX + 'px'
      ring.style.top = ringY + 'px'
      requestAnimationFrame(animate)
    }

    const onEnter = () => { cursor.style.transform = 'translate(-50%,-50%) scale(2.5)'; cursor.style.background = 'transparent'; cursor.style.border = '1px solid var(--red)' }
    const onLeave = () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; cursor.style.background = 'var(--red)'; cursor.style.border = 'none' }

    document.addEventListener('mousemove', move)
    document.querySelectorAll('a, button, [role=button]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    animate()

    return () => document.removeEventListener('mousemove', move)
  }, [])
}
