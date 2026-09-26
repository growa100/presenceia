// The PDF report of one stored analysis, for its owner.
import { NextRequest, NextResponse } from 'next/server'
import { loadOwnAnalysis } from '@/lib/client-analysis'
import { renderReportPdf, reportFilename } from '@/lib/report-pdf'
import { bookingHref } from '@/lib/links'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const r = await loadOwnAnalysis(req, (await params).id)
  if (r.status !== 200) return NextResponse.json({ error: r.status === 401 ? 'login_required' : 'not_found' }, { status: r.status })
  const lang = req.nextUrl.searchParams.get('lang') || r.data.language || 'fr'
  const result = r.data.result
  const pdf = await renderReportPdf(result, lang, bookingHref(lang, result.businessName))
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reportFilename(result)}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
