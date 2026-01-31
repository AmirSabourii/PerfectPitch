import { NextRequest, NextResponse } from 'next/server'
import { adminDb, isAdminInitialized } from '@/lib/admin'
import type { InvestorDirectoryEntry, InvestorType, StageFocus } from '@/lib/investorDirectoryTypes'

const COLLECTION = 'investorDirectory'

export async function GET(request: NextRequest) {
  try {
    if (!isAdminInitialized() || !adminDb) {
      return NextResponse.json(
        { error: 'Server not configured for database' },
        { status: 503 }
      )
    }

    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country')?.trim()
    const type = searchParams.get('type')?.trim() as InvestorType | undefined
    const stage = searchParams.get('stage')?.trim() as StageFocus | undefined

    const snapshot = await adminDb.collection(COLLECTION).get()
    let entries: InvestorDirectoryEntry[] = snapshot.docs.map((doc) => {
      const d = doc.data()
      return {
        id: d.id ?? doc.id,
        name: d.name,
        type: d.type,
        country: d.country,
        city: d.city,
        description: d.description,
        website: d.website,
        applyUrl: d.applyUrl,
        stages: d.stages ?? [],
        industries: d.industries ?? [],
        checkSize: d.checkSize,
        highlights: d.highlights ?? [],
        source: d.source,
        updatedAt: d.updatedAt,
        lang: d.lang,
      } as InvestorDirectoryEntry
    })

    if (country) entries = entries.filter((e) => e.country === country)
    if (type) entries = entries.filter((e) => e.type === type)
    if (stage) entries = entries.filter((e) => e.stages?.includes(stage))
    entries.sort((a, b) => (a.name || '').localeCompare(b.name || ''))

    return NextResponse.json({
      total: entries.length,
      entries,
    })
  } catch (e) {
    console.error('[investor-directory]', e)
    return NextResponse.json(
      { error: 'Failed to fetch investor directory' },
      { status: 500 }
    )
  }
}
