import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from './supabase'

const SECRET = process.env.JWT_SECRET || 'change-me'

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 12)
}
export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash)
}
export function signToken(payload: { userId: string; role: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}
export function verifyToken(token: string) {
  try { return jwt.verify(token, SECRET) as { userId: string; role: string; email: string }
  } catch { return null }
}
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null
  const { data } = await supabaseAdmin.from('users').select('*').eq('id', payload.userId).single()
  return data
}
