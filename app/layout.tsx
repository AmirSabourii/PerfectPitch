import type { Metadata } from 'next'
import { Inter, Vazirmatn } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pitch Perfect AI',
  description: 'Master your startup pitch with real-time AI analysis',
}

import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${vazirmatn.variable}`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
