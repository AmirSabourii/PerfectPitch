import pdf from 'pdf-parse'

export interface SlideContent {
  pageNumber: number
  text: string
  images?: string[] // Base64 encoded images
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    throw new Error('خطا در خواندن فایل PDF')
  }
}

export async function extractSlidesFromPDF(buffer: Buffer): Promise<SlideContent[]> {
  try {
    // Use pdf-parse to extract text from all pages
    const data = await pdf(buffer, {
      // Extract text from all pages
      max: 0, // 0 means all pages
    })
    
    // pdf-parse gives us text from all pages combined
    // We'll split by double newlines as page separators
    // For better results, we could use page numbers if available
    const fullText = data.text
    
    // Try to identify page breaks (common patterns)
    // Many PDFs have page numbers or clear separators
    const pageBreaks = [
      /\n\s*\n\s*\n/g, // Triple newlines
      /Page \d+/gi,
      /\d+\s*\n\s*\n/g, // Number followed by double newline
    ]
    
    let pages: string[] = []
    
    // Try to split by page breaks
    for (const pattern of pageBreaks) {
      const splits = fullText.split(pattern)
      if (splits.length > 1 && splits.every(p => p.trim().length > 10)) {
        pages = splits.filter(p => p.trim().length > 0)
        break
      }
    }
    
    // If no clear page breaks found, try splitting by large text blocks
    if (pages.length <= 1) {
      const blocks = fullText.split(/\n\s*\n/).filter(block => block.trim().length > 20)
      if (blocks.length > 1) {
        pages = blocks
      }
    }
    
    // If still no pages, treat as single slide
    if (pages.length === 0) {
      pages = [fullText]
    }
    
    return pages.map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText.trim(),
    }))
  } catch (error) {
    console.error('Error extracting PDF slides:', error)
    // Fallback to simple text extraction
    try {
      const text = await extractTextFromPDF(buffer)
      return [{
        pageNumber: 1,
        text: text,
      }]
    } catch (fallbackError) {
      throw new Error('خطا در خواندن فایل PDF. لطفاً مطمئن شوید فایل معتبر است.')
    }
  }
}

