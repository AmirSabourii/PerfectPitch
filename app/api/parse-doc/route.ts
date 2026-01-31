import { NextResponse } from 'next/server'
import { GoogleGenAI, createPartFromUri } from '@google/genai'
import { withTimeout, TIMEOUTS } from '@/lib/timeout'
import pdfParse from 'pdf-parse'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 600 // 10 minutes for large PDFs

/** Max PDF size in bytes (100MB) */
const MAX_PDF_SIZE_BYTES = 100 * 1024 * 1024

/** Use Files API instead of inline (improves latency per Google docs) */
const FILES_API_SIZE_THRESHOLD = 2 * 1024 * 1024 // 2MB

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.')
    return new GoogleGenAI({ apiKey })
}

async function getPdfPageCount(buffer: Buffer): Promise<number> {
    try {
        const data = await pdfParse(buffer)
        return data.numpages || 0
    } catch (error) {
        console.error('[parse-doc] Error parsing PDF:', error)
        return 0
    }
}

// Default structure when parsing fails
const DEFAULT_EXTRACTED = {
    problem: 'Not specified in deck',
    solution: 'Not specified in deck',
    market: 'Not specified in deck',
    competitors: 'Not specified in deck',
    businessModel: 'Not specified in deck',
    traction: 'Not specified in deck',
    team: 'Not specified in deck',
    financials: 'Not specified in deck',
    ask: 'Not specified in deck',
    stage: 'Not specified in deck',
    industry: 'Not specified in deck',
    additionalInfo: 'Not specified in deck'
}

const EXTRACTED_JSON_SCHEMA = {
    problem: 'string',
    solution: 'string',
    market: 'string',
    competitors: 'string',
    businessModel: 'string',
    traction: 'string',
    team: 'string',
    financials: 'string',
    ask: 'string',
    stage: 'string',
    industry: 'string',
    additionalInfo: 'string'
}

const EXTRACT_PROMPT = `Extract pitch deck information into this JSON structure. Use "Not specified in deck" if not found. Return ONLY valid JSON, no markdown.
{
  "problem": "What problem does the startup solve?",
  "solution": "What is their solution? How does it work?",
  "market": "Market size (TAM/SAM/SOM), target customer",
  "competitors": "Main competitors, competitive advantage",
  "businessModel": "Revenue model, pricing",
  "traction": "Users, revenue, growth, partnerships",
  "team": "Team background and expertise",
  "financials": "Revenue, burn rate, runway, projections",
  "ask": "Investment amount, use of funds",
  "stage": "pre-seed, seed, series-a, etc.",
  "industry": "Tech/SaaS, FinTech, etc.",
  "additionalInfo": "Other important information"
}`

export async function POST(request: Request) {
    let fileSize = 0
    let fileName = 'unknown'

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            console.error('[parse-doc] 400: No file uploaded')
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        fileSize = file.size || 0
        fileName = file.name || 'unknown'

        if (fileSize > MAX_PDF_SIZE_BYTES) {
            console.error('[parse-doc] 400: File too large', { fileSize, fileName })
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_PDF_SIZE_BYTES / (1024 * 1024)}MB.` },
                { status: 400 }
            )
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        if (!file.name.endsWith('.pdf')) {
            console.error('[parse-doc] 400: Not a PDF', { fileName })
            return NextResponse.json({ error: 'Only PDF files are currently supported' }, { status: 400 })
        }

        console.log('[parse-doc] Validating PDF...')
        const totalPages = await getPdfPageCount(buffer)

        if (totalPages === 0) {
            console.warn('[parse-doc] pdf-parse could not read pages. Proceeding with Gemini.')
        }

        const ai = getGeminiClient()
        let rawText: string

        if (fileSize > FILES_API_SIZE_THRESHOLD || totalPages > 6) {
            // Path 2: Files API for large PDFs (better latency per Google)
            console.log(`[parse-doc] Files API: ${(fileSize / 1024 / 1024).toFixed(1)}MB, ${totalPages} pages`)
            const fileBlob = new Blob([buffer], { type: 'application/pdf' })
            const uploaded = await withTimeout(
                ai.files.upload({ file: fileBlob, config: { mimeType: 'application/pdf', displayName: fileName } }),
                120000,
                'File upload timed out.'
            )
            if (!uploaded.uri) throw new Error('File upload did not return URI')
            let file = uploaded
            for (let i = 0; i < 60 && file.state === 'PROCESSING'; i++) {
                await new Promise((r) => setTimeout(r, 2000))
                file = await ai.files.get({ name: file.name! })
            }
            if (file.state === 'FAILED') throw new Error('File processing failed')
            const res = await withTimeout(
                ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{
                        role: 'user',
                        parts: [
                            createPartFromUri(uploaded.uri, 'application/pdf'),
                            { text: `Analyze this pitch deck. ${totalPages ? `${totalPages} pages.` : ''} ${EXTRACT_PROMPT}` }
                        ]
                    }],
                    config: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 8000 }
                }),
                TIMEOUTS.PDF_PARSE,
                'PDF analysis timed out.'
            )
            rawText = res.text?.trim() || '{}'
        } else {
            // Path 3: Inline for small PDFs
            console.log(`[parse-doc] Inline: ${totalPages} pages`)
            const pdfBase64 = buffer.toString('base64')
            const res = await withTimeout(
                ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: [{
                        role: 'user',
                        parts: [
                            { inlineData: { mimeType: 'application/pdf', data: pdfBase64 } },
                            { text: `Analyze this pitch deck. ${totalPages ? `${totalPages} pages.` : ''} ${EXTRACT_PROMPT}` }
                        ]
                    }],
                    config: { responseMimeType: 'application/json', temperature: 0.1, maxOutputTokens: 8000 }
                }),
                TIMEOUTS.PDF_PARSE,
                'PDF analysis timed out.'
            )
            rawText = res.text?.trim() || '{}'
        }

        let extractedData: Record<string, string>
        try {
            // Handle possible markdown code block wrapping
            let jsonStr = rawText
            const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/)
            if (jsonMatch) {
                jsonStr = jsonMatch[1].trim()
            }
            extractedData = JSON.parse(jsonStr)
        } catch (parseError) {
            console.error('[parse-doc] JSON parse error:', parseError)
            return NextResponse.json(
                { error: 'Failed to parse AI response as JSON' },
                { status: 500 }
            )
        }

        // Ensure all required fields exist
        const result = { ...DEFAULT_EXTRACTED }
        const schemaKeys = Object.keys(EXTRACTED_JSON_SCHEMA) as (keyof typeof DEFAULT_EXTRACTED)[]
        for (const key of schemaKeys) {
            if (extractedData[key] != null && typeof extractedData[key] === 'string') {
                result[key] = String(extractedData[key]).trim() || DEFAULT_EXTRACTED[key]
            }
        }

        console.log('[parse-doc] Extraction complete')

        return NextResponse.json({
            extractedData: result,
            totalPages: totalPages > 0 ? totalPages : undefined
        })
    } catch (error: any) {
        const isTimeout = error.message?.includes('timed out') || error.message?.includes('timeout')

        if (isTimeout) {
            console.error('[parse-doc] Timeout error:', error.message)
            return NextResponse.json(
                {
                    error: 'Document analysis timed out. Please try with a smaller file.',
                    details: { error: error.message, fileSize, fileName }
                },
                { status: 504 }
            )
        }

        if (error.message?.includes('GEMINI_API_KEY')) {
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        console.error('[parse-doc] Error:', {
            message: error.message,
            stack: error.stack,
            fileSize,
            fileName
        })

        return NextResponse.json(
            { error: error.message || 'Failed to parse document' },
            { status: 500 }
        )
    }
}
