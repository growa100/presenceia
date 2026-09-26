// Loads one stored analysis for the signed-in owner (admins can open any).
import type { NextRequest } from 'next/server'
import { getSessionEmail } from './checker-auth'
import { isAdminEmail } from './cockpit'
import { supabaseAdmin } from './supabase'

export async function loadOwnAnalysis(req: NextRequest, id: string) {
  const email = getSessionEmail(req)
  if (!email) return { status: 401 as const }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { status: 404 as const }
  let q = supabaseAdmin.from('visibility_checks').select('id, result, language, created_at').eq('id', id)
  if (!isAdminEmail(email)) q = q.eq('email', email)
  const { data } = await q.maybeSingle()
  if (!data) return { status: 404 as const }
  return { status: 200 as const, data }
}
