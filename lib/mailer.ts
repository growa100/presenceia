// Transactional email through Resend (domain mail.presenceia.com). Returns true when accepted.
export async function sendMail(opts: { to: string | string[]; subject: string; text: string; html?: string; replyTo?: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.log(`[mail] RESEND_API_KEY missing, not sent: ${opts.subject}`)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CHECKER_MAIL_FROM || 'Présence IA <analyse@mail.presenceia.com>',
        reply_to: opts.replyTo || 'antoine@presenceia.com',
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        text: opts.text,
        ...(opts.html ? { html: opts.html } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) console.error('[mail] resend error', res.status, (await res.text()).slice(0, 300))
    return res.ok
  } catch (e) {
    console.error('[mail] failed', e)
    return false
  }
}

export function escapeHtml(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
