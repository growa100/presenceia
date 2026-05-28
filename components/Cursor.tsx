'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    const tick = () => {
      if (cursorRef.current) { cursorRef.current.style.left = mx + 'px'; cursorRef.current.style.top = my + 'px' }
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1
      if (ringRef.current) { ringRef.current.style.left = rx + 'px'; ringRef.current.style.top = ry + 'px' }
      requestAnimationFrame(tick)
    }
    const grow = () => { if (cursorRef.current) { cursorRef.current.style.width = '20px'; cursorRef.current.style.height = '20px' } }
    const shrink = () => { if (cursorRef.current) { cursorRef.current.style.width = '8px'; cursorRef.current.style.height = '8px' } }
    document.addEventListener('mousemove', move)
    document.querySelectorAll('a,button,[role=button]').forEach(el => { el.addEventListener('mouseenter', grow); el.addEventListener('mouseleave', shrink) })
    tick()
    return () => document.removeEventListener('mousemove', move)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block" />
    </>
  )
}
