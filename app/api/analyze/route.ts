import { NextRequest, NextResponse } from 'next/server'
import { extractSlidesFromPDF, SlideContent } from '@/lib/pdfProcessor'
import { processImage } from '@/lib/imageProcessor'
import { analyzePitchDeck } from '@/lib/aiAnalyzer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'فایلی آپلود نشده است' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fileType = file.type

    let slides: SlideContent[] = []
    let images: string[] = []

    // Process PDF files
    if (fileType === 'application/pdf') {
      slides = await extractSlidesFromPDF(buffer)

      // Note: For full image extraction from PDF, we would need additional libraries
      // For now, we'll analyze the text content thoroughly
      // The AI model will work with the extracted text from all slides
    }
    // Process image files
    else if (fileType.startsWith('image/')) {
      const processed = await processImage(buffer)
      slides = [
        {
          pageNumber: 1,
          text: processed.text,
          images: [processed.imageBase64],
        },
      ]
      images.push(processed.imageBase64)
    } else {
      return NextResponse.json(
        { error: 'نوع فایل پشتیبانی نمی‌شود' },
        { status: 400 }
      )
    }

    // Analyze with AI - Updated to use object signature
    const analysisResult = await analyzePitchDeck({ slides, images })

    return NextResponse.json(analysisResult)
  } catch (error: any) {
    console.error('Error in analyze route:', error)
    return NextResponse.json(
      { error: error.message || 'خطا در پردازش فایل' },
      { status: 500 }
    )
  }
}
